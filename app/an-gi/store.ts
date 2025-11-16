'use client'

import { create } from 'zustand'
import { supabase } from '../../lib/supabase'
import type { Dish, TodayMeal, MealHistory, MealVote, MealCategory, UserRole } from './types'

interface PendingMutation {
  type: 'addDish' | 'addTodayMeal' | 'removeTodayMeal' | 'updateDish' | 'deleteDish'
  data: any
}

interface MealState {
  dishes: Dish[]
  todayMeals: TodayMeal[]
  mealHistory: MealHistory[]
  mealVotes: MealVote[]
  isLoading: boolean
  isOnline: boolean
  syncError: string | null
  pendingMutations: PendingMutation[]
  _dishesChannel?: any
  _todayMealsChannel?: any
  _mealHistoryChannel?: any
  _mealVotesChannel?: any
  initialize: () => Promise<void>
  setupRealtimeSubscriptions: () => void
  cleanup: () => void
  addDish: (dish: {
    name: string
    category: MealCategory
    emoji?: string
    note?: string
    is_favorite?: boolean
    is_wishlist?: boolean
    wishlist_note?: string
  }) => Promise<void>
  updateDish: (dishId: number, updates: Partial<Dish>) => Promise<void>
  deleteDish: (dishId: number) => Promise<void>
  addTodayMeal: (dishId: number, date?: string) => Promise<void>
  removeTodayMeal: (todayMealId: number) => Promise<void>
  submitVote: (dishId: number, userRole: UserRole, date?: string) => Promise<void>
  getTodayDishes: () => Dish[]
  getFavoriteDishes: () => Dish[]
  getWishlistDishes: () => Dish[]
  getRecentDishes: (limit?: number) => Dish[]
  getTodayVotes: () => MealVote[]
  getUserVote: (userRole: UserRole, date?: string) => MealVote | undefined
  syncPendingMutations: () => Promise<void>
  setOnlineStatus: (isOnline: boolean) => void
}

export const useMealStore = create<MealState>((set, get) => ({
  dishes: [],
  todayMeals: [],
  mealHistory: [],
  mealVotes: [],
  isLoading: false,
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  syncError: null,
  pendingMutations: [],

  // Initialize: Load data from Supabase
  initialize: async () => {
    set({ isLoading: true, syncError: null })

    if (!supabase) {
      console.warn('Supabase not configured, using local state only')
      set({ isLoading: false })
      return
    }

    try {
      const today = new Date().toISOString().split('T')[0]

      // Load dishes
      const { data: dishesData, error: dishesError } = await supabase
        .from('dishes')
        .select('*')
        .order('created_at', { ascending: false })

      if (dishesError) throw dishesError

      // Load today's meals with dish data
      const { data: todayMealsData, error: todayMealsError } = await supabase
        .from('today_meals')
        .select(`
          *,
          dish:dishes(*)
        `)
        .eq('date', today)
        .order('created_at', { ascending: false })

      if (todayMealsError) throw todayMealsError

      // Load recent meal history (last 7 days)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      const { data: historyData, error: historyError } = await supabase
        .from('meal_history')
        .select(`
          *,
          dish:dishes(*)
        `)
        .gte('date', sevenDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(50)

      if (historyError) throw historyError

      // Load today's votes
      const { data: votesData, error: votesError } = await supabase
        .from('meal_votes')
        .select(`
          *,
          dish:dishes(*)
        `)
        .eq('date', today)
        .order('created_at', { ascending: false })

      if (votesError) throw votesError

      set({
        dishes: (dishesData || []) as Dish[],
        todayMeals: (todayMealsData || []) as TodayMeal[],
        mealHistory: (historyData || []) as MealHistory[],
        mealVotes: (votesData || []) as MealVote[],
        isLoading: false,
        syncError: null,
      })

      // Setup real-time subscriptions
      get().setupRealtimeSubscriptions()
    } catch (error: any) {
      console.error('Failed to load data from Supabase:', error)
      set({
        isLoading: false,
        syncError: error.message || 'Failed to load data',
      })
    }
  },

  // Setup real-time subscriptions
  setupRealtimeSubscriptions: () => {
    if (!supabase) return

    // Subscribe to dishes changes
    const dishesChannel = supabase
      .channel('dishes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'dishes',
        },
        async (payload: any) => {
          if (payload.eventType === 'INSERT') {
            set((state) => ({
              dishes: [payload.new, ...state.dishes],
            }))
          } else if (payload.eventType === 'UPDATE') {
            set((state) => ({
              dishes: state.dishes.map((d) =>
                d.id === payload.new.id ? payload.new : d
              ),
            }))
          } else if (payload.eventType === 'DELETE') {
            set((state) => ({
              dishes: state.dishes.filter((d) => d.id !== payload.old.id),
            }))
          }
        }
      )
      .subscribe()

    // Subscribe to today_meals changes
    const todayMealsChannel = supabase
      .channel('today-meals-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'today_meals',
        },
        async (payload: any) => {
          const today = new Date().toISOString().split('T')[0]
          if (
            supabase &&
            payload.eventType === 'INSERT' &&
            payload.new.date === today
          ) {
            // Check if already exists (avoid duplicate from optimistic update)
            const existing = get().todayMeals.find(
              (m) => m.id === payload.new.id || 
                     (m.dish_id === payload.new.dish_id && m.date === payload.new.date)
            )
            if (existing) {
              // Update existing instead of adding duplicate
              const { data: dish } = await supabase
                .from('dishes')
                .select('*')
                .eq('id', payload.new.dish_id)
                .single()
              
              set((state) => ({
                todayMeals: state.todayMeals.map((m) =>
                  m.id === existing.id ? { ...payload.new, dish } : m
                ),
              }))
              return
            }

            // Fetch dish data
            const { data: dish } = await supabase
              .from('dishes')
              .select('*')
              .eq('id', payload.new.dish_id)
              .single()
            
            set((state) => ({
              todayMeals: [{ ...payload.new, dish }, ...state.todayMeals],
            }))
          } else if (payload.eventType === 'DELETE') {
            set((state) => ({
              todayMeals: state.todayMeals.filter(
                (m) => m.id !== payload.old.id
              ),
            }))
          }
        }
      )
      .subscribe()

    // Subscribe to meal_votes changes
    const mealVotesChannel = supabase
      .channel('meal-votes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'meal_votes',
        },
        async (payload: any) => {
          const today = new Date().toISOString().split('T')[0]
          if (payload.eventType === 'INSERT' && payload.new.date === today) {
            // Fetch dish data
            if (supabase) {
              const { data: dish } = await supabase
                .from('dishes')
                .select('*')
                .eq('id', payload.new.dish_id)
                .single()
              
              set((state) => {
                const existing = state.mealVotes.find((v) => v.id === payload.new.id)
                if (existing) {
                  return {
                    mealVotes: state.mealVotes.map((v) =>
                      v.id === payload.new.id ? { ...payload.new, dish } : v
                    ),
                  }
                }
                return {
                  mealVotes: [{ ...payload.new, dish }, ...state.mealVotes],
                }
              })
            }
          } else if (payload.eventType === 'UPDATE') {
            if (supabase) {
              const { data: dish } = await supabase
                .from('dishes')
                .select('*')
                .eq('id', payload.new.dish_id)
                .single()
              
              set((state) => ({
                mealVotes: state.mealVotes.map((v) =>
                  v.id === payload.new.id ? { ...payload.new, dish } : v
                ),
              }))
            }
          } else if (payload.eventType === 'DELETE') {
            set((state) => ({
              mealVotes: state.mealVotes.filter((v) => v.id !== payload.old.id),
            }))
          }
        }
      )
      .subscribe()

    set({
      _dishesChannel: dishesChannel,
      _todayMealsChannel: todayMealsChannel,
      _mealVotesChannel: mealVotesChannel,
    })
  },

  // Cleanup subscriptions
  cleanup: () => {
    const { _dishesChannel, _todayMealsChannel, _mealHistoryChannel, _mealVotesChannel } = get()
    if (_dishesChannel && supabase) supabase.removeChannel(_dishesChannel)
    if (_todayMealsChannel && supabase) supabase.removeChannel(_todayMealsChannel)
    if (_mealHistoryChannel && supabase) supabase.removeChannel(_mealHistoryChannel)
    if (_mealVotesChannel && supabase) supabase.removeChannel(_mealVotesChannel)
  },

  // Add dish
  addDish: async (dish) => {
    const dishData: Omit<Dish, 'id' | 'created_at' | 'updated_at'> = {
      name: dish.name.trim(),
      category: dish.category,
      emoji: dish.emoji || null,
      note: dish.note || null,
      is_favorite: dish.is_favorite || false,
      is_wishlist: dish.is_wishlist || false,
      wishlist_note: dish.wishlist_note || null,
    }

    // Optimistically update UI
    const tempId = Date.now()
    const optimisticDish: Dish = {
      id: tempId,
      ...dishData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    set((state) => ({
      dishes: [optimisticDish, ...state.dishes],
    }))

    if (!supabase) {
      return
    }

    if (!get().isOnline) {
      set((state) => ({
        pendingMutations: [
          ...state.pendingMutations,
          { type: 'addDish', data: dishData },
        ],
      }))
      return
    }

    try {
      const { data, error } = await supabase
        .from('dishes')
        .insert(dishData)
        .select()
        .single()

      if (error) throw error

      // Replace optimistic update with real data
      set((state) => ({
        dishes: state.dishes.map((d) =>
          d.id === tempId ? data : d
        ),
      }))
    } catch (error: any) {
      console.error('Failed to save dish:', error)
      // Remove optimistic update
      set((state) => ({
        dishes: state.dishes.filter((d) => d.id !== tempId),
        pendingMutations: [
          ...state.pendingMutations,
          { type: 'addDish', data: dishData },
        ],
        syncError: error.message || 'Failed to save dish',
      }))
    }
  },

  // Update dish
  updateDish: async (dishId: number, updates: Partial<Dish>) => {
    // Optimistically update UI
    set((state) => ({
      dishes: state.dishes.map((d) =>
        d.id === dishId ? { ...d, ...updates } : d
      ),
    }))

    if (!supabase) return

    if (!get().isOnline) {
      set((state) => ({
        pendingMutations: [
          ...state.pendingMutations,
          { type: 'updateDish', data: { id: dishId, ...updates } },
        ],
      }))
      return
    }

    try {
      const { error } = await supabase
        .from('dishes')
        .update(updates)
        .eq('id', dishId)

      if (error) throw error
    } catch (error: any) {
      console.error('Failed to update dish:', error)
      get().initialize()
      set((state) => ({
        pendingMutations: [
          ...state.pendingMutations,
          { type: 'updateDish', data: { id: dishId, ...updates } },
        ],
        syncError: error.message || 'Failed to update dish',
      }))
    }
  },

  // Delete dish
  deleteDish: async (dishId: number) => {
    set((state) => ({
      dishes: state.dishes.filter((d) => d.id !== dishId),
    }))

    if (!supabase) return

    if (!get().isOnline) {
      set((state) => ({
        pendingMutations: [
          ...state.pendingMutations,
          { type: 'deleteDish', data: { id: dishId } },
        ],
      }))
      return
    }

    try {
      const { error } = await supabase
        .from('dishes')
        .delete()
        .eq('id', dishId)

      if (error) throw error
    } catch (error: any) {
      console.error('Failed to delete dish:', error)
      get().initialize()
      set((state) => ({
        pendingMutations: [
          ...state.pendingMutations,
          { type: 'deleteDish', data: { id: dishId } },
        ],
        syncError: error.message || 'Failed to delete dish',
      }))
    }
  },

  // Add dish to today
  addTodayMeal: async (dishId: number, date?: string) => {
    const mealDate = date || new Date().toISOString().split('T')[0]

    // Check if already added today
    const existing = get().todayMeals.find(
      (m) => m.dish_id === dishId && m.date === mealDate
    )
    if (existing) return

    const dish = get().dishes.find((d) => d.id === dishId)
    if (!dish) return

    // Optimistically update UI
    const tempId = Date.now()
    const optimisticMeal: TodayMeal = {
      id: tempId,
      dish_id: dishId,
      date: mealDate,
      created_at: new Date().toISOString(),
      dish,
    }
    set((state) => ({
      todayMeals: [optimisticMeal, ...state.todayMeals],
    }))

    // Also add to history
    if (!get().mealHistory.some((h) => h.dish_id === dishId && h.date === mealDate)) {
      set((state) => ({
        mealHistory: [
          {
            id: tempId + 1,
            dish_id: dishId,
            date: mealDate,
            created_at: new Date().toISOString(),
            dish,
          },
          ...state.mealHistory,
        ],
      }))
    }

    if (!supabase) return

    if (!get().isOnline) {
      set((state) => ({
        pendingMutations: [
          ...state.pendingMutations,
          { type: 'addTodayMeal', data: { dish_id: dishId, date: mealDate } },
        ],
      }))
      return
    }

    try {
      // Add to today_meals
      const { data: todayMeal, error: todayError } = await supabase
        .from('today_meals')
        .insert({ dish_id: dishId, date: mealDate })
        .select()
        .single()

      if (todayError) throw todayError

      // Add to history
      await supabase.from('meal_history').insert({
        dish_id: dishId,
        date: mealDate,
      })

      // Replace optimistic update with real data
      set((state) => {
        // Check if real-time subscription already added it
        const alreadyExists = state.todayMeals.some(
          (m) => m.id === todayMeal.id || 
                 (m.dish_id === todayMeal.dish_id && m.date === todayMeal.date && m.id !== tempId)
        )
        
        if (alreadyExists) {
          // Remove optimistic update, keep the one from real-time
          return {
            todayMeals: state.todayMeals.filter((m) => m.id !== tempId),
          }
        }
        
        // Replace optimistic update
        return {
          todayMeals: state.todayMeals.map((m) =>
            m.id === tempId ? { ...todayMeal, dish } : m
          ),
        }
      })
    } catch (error: any) {
      console.error('Failed to add today meal:', error)
      set((state) => ({
        todayMeals: state.todayMeals.filter((m) => m.id !== tempId),
        pendingMutations: [
          ...state.pendingMutations,
          { type: 'addTodayMeal', data: { dish_id: dishId, date: mealDate } },
        ],
        syncError: error.message || 'Failed to add meal',
      }))
    }
  },

  // Remove dish from today
  removeTodayMeal: async (todayMealId: number) => {
    set((state) => ({
      todayMeals: state.todayMeals.filter((m) => m.id !== todayMealId),
    }))

    if (!supabase) return

    if (!get().isOnline) {
      set((state) => ({
        pendingMutations: [
          ...state.pendingMutations,
          { type: 'removeTodayMeal', data: { id: todayMealId } },
        ],
      }))
      return
    }

    try {
      const { error } = await supabase
        .from('today_meals')
        .delete()
        .eq('id', todayMealId)

      if (error) throw error
    } catch (error: any) {
      console.error('Failed to remove today meal:', error)
      get().initialize()
      set((state) => ({
        pendingMutations: [
          ...state.pendingMutations,
          { type: 'removeTodayMeal', data: { id: todayMealId } },
        ],
        syncError: error.message || 'Failed to remove meal',
      }))
    }
  },

  // Get today's dishes
  getTodayDishes: () => {
    const today = new Date().toISOString().split('T')[0]
    return get().todayMeals
      .filter((m) => m.date === today && m.dish)
      .map((m) => m.dish!)
  },

  // Get favorite dishes
  getFavoriteDishes: () => {
    return get().dishes.filter((d) => d.is_favorite)
  },

  // Get wishlist dishes
  getWishlistDishes: () => {
    return get().dishes.filter((d) => d.is_wishlist)
  },

  // Get recent dishes (from history)
  getRecentDishes: (limit = 7) => {
    const recentDishIds = new Set<number>()
    const recentDishes: Dish[] = []

    for (const history of get().mealHistory) {
      if (history.dish && !recentDishIds.has(history.dish.id)) {
        recentDishIds.add(history.dish.id)
        recentDishes.push(history.dish)
        if (recentDishes.length >= limit) break
      }
    }

    return recentDishes
  },

  // Submit vote
  submitVote: async (dishId: number, userRole: UserRole, date?: string) => {
    const voteDate = date || new Date().toISOString().split('T')[0]
    const dish = get().dishes.find((d) => d.id === dishId)
    if (!dish) return

    // Check if user already voted today
    const existingVote = get().mealVotes.find(
      (v) => v.user_role === userRole && v.date === voteDate
    )

    if (!supabase) {
      // Use localStorage as fallback
      const votes = JSON.parse(localStorage.getItem('meal_votes') || '[]')
      const newVotes = existingVote
        ? votes.map((v: any) =>
            v.user_role === userRole && v.date === voteDate
              ? { ...v, dish_id: dishId, updated_at: new Date().toISOString() }
              : v
          )
        : [
            ...votes.filter((v: any) => !(v.user_role === userRole && v.date === voteDate)),
            {
              id: Date.now(),
              dish_id: dishId,
              user_role: userRole,
              date: voteDate,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              dish,
            },
          ]
      localStorage.setItem('meal_votes', JSON.stringify(newVotes))
      
      // Update state
      set((state) => {
        if (existingVote) {
          return {
            mealVotes: state.mealVotes.map((v) =>
              v.id === existingVote.id
                ? { ...v, dish_id: dishId, dish, updated_at: new Date().toISOString() }
                : v
            ),
          }
        }
        return {
          mealVotes: [
            {
              id: Date.now(),
              dish_id: dishId,
              user_role: userRole,
              date: voteDate,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              dish,
            },
            ...state.mealVotes,
          ],
        }
      })
      return
    }

    try {
      if (existingVote) {
        // Update existing vote
        const { data, error } = await supabase
          .from('meal_votes')
          .update({ dish_id: dishId, updated_at: new Date().toISOString() })
          .eq('id', existingVote.id)
          .select()
          .single()

        if (error) throw error

        set((state) => ({
          mealVotes: state.mealVotes.map((v) =>
            v.id === existingVote.id ? { ...data, dish } : v
          ),
        }))
      } else {
        // Insert new vote
        const { data, error } = await supabase
          .from('meal_votes')
          .insert({
            dish_id: dishId,
            user_role: userRole,
            date: voteDate,
          })
          .select()
          .single()

        if (error) throw error

        set((state) => ({
          mealVotes: [{ ...data, dish }, ...state.mealVotes],
        }))
      }
    } catch (error: any) {
      console.error('Failed to submit vote:', error)
      throw error
    }
  },

  // Get today's votes
  getTodayVotes: () => {
    const today = new Date().toISOString().split('T')[0]
    return get().mealVotes.filter((v) => v.date === today)
  },

  // Get user's vote for today
  getUserVote: (userRole: UserRole, date?: string) => {
    const voteDate = date || new Date().toISOString().split('T')[0]
    return get().mealVotes.find((v) => v.user_role === userRole && v.date === voteDate)
  },

  // Sync pending mutations
  syncPendingMutations: async () => {
    if (!supabase || !get().isOnline) return

    const pending = get().pendingMutations
    if (pending.length === 0) return

    set({ isLoading: true, syncError: null })

    const successful: PendingMutation[] = []
    const failed: PendingMutation[] = []

    for (const mutation of pending) {
      try {
        if (mutation.type === 'addDish') {
          const { error } = await supabase.from('dishes').insert(mutation.data)
          if (error) throw error
          successful.push(mutation)
        } else if (mutation.type === 'addTodayMeal') {
          const { error } = await supabase
            .from('today_meals')
            .insert(mutation.data)
          if (error) throw error
          // Also add to history
          await supabase.from('meal_history').insert({
            dish_id: mutation.data.dish_id,
            date: mutation.data.date,
          })
          successful.push(mutation)
        } else if (mutation.type === 'removeTodayMeal') {
          const { error } = await supabase
            .from('today_meals')
            .delete()
            .eq('id', mutation.data.id)
          if (error) throw error
          successful.push(mutation)
        } else if (mutation.type === 'updateDish') {
          const { id, ...updateData } = mutation.data
          const { error } = await supabase
            .from('dishes')
            .update(updateData)
            .eq('id', id)
          if (error) throw error
          successful.push(mutation)
        } else if (mutation.type === 'deleteDish') {
          const { error } = await supabase
            .from('dishes')
            .delete()
            .eq('id', mutation.data.id)
          if (error) throw error
          successful.push(mutation)
        }
      } catch (error) {
        console.error('Failed to sync mutation:', error)
        failed.push(mutation)
      }
    }

    set((state) => ({
      pendingMutations: failed,
      isLoading: false,
      syncError: failed.length > 0 ? 'Some changes failed to sync' : null,
    }))
  },

  // Update online status
  setOnlineStatus: (isOnline: boolean) => {
    const wasOffline = !get().isOnline
    set({ isOnline })

    if (wasOffline && isOnline) {
      get().syncPendingMutations()
    }
  },
}))

