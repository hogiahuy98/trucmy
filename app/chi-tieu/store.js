'use client'

import { create } from 'zustand'
import { supabase } from '../../lib/supabase'

const DEFAULT_CATEGORIES = [
  { key: 'cafe', label: 'Cafe', icon: 'coffee', color: '#A78BFA' },
  { key: 'food', label: 'Ăn uống', icon: 'utensils', color: '#60A5FA' },
  { key: 'market', label: 'Đi chợ', icon: 'shopping-cart', color: '#34D399' },
  { key: 'fun', label: 'Giải trí', icon: 'clapperboard', color: '#F59E0B' },
  { key: 'home', label: 'Tiền nhà', icon: 'home', color: '#F472B6' },
  { key: 'internet', label: 'Tiền mạng', icon: 'wifi', color: '#22D3EE' },
]

export const useFinanceStore = create((set, get) => ({
  categories: DEFAULT_CATEGORIES,
  expenses: [],
  isLoading: false,
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  syncError: null,
  pendingMutations: [],

  // Initialize: Load data from Supabase
  initialize: async () => {
    if (!supabase) {
      console.warn('Supabase not configured, using local state only')
      return
    }

    set({ isLoading: true, syncError: null })

    try {
      // Load categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: true })

      if (categoriesError) throw categoriesError

      const loadedCategories = categoriesData && categoriesData.length > 0
        ? categoriesData
        : DEFAULT_CATEGORIES

      // Load expenses
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })

      if (expensesError) throw expensesError

      set({
        categories: loadedCategories,
        expenses: expensesData || [],
        isLoading: false,
        syncError: null,
      })

      // Setup real-time subscriptions
      get().setupRealtimeSubscriptions()
    } catch (error) {
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

    // Subscribe to expenses changes
    const expensesChannel = supabase
      .channel('expenses-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'expenses',
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            set((state) => {
              // Check if expense already exists (avoid duplicate from optimistic update)
              const exists = state.expenses.some((e) => e.id === payload.new.id)
              if (exists) {
                // Update existing instead of adding duplicate
                return {
                  expenses: state.expenses.map((e) =>
                    e.id === payload.new.id ? payload.new : e
                  ),
                }
              }
              return {
                expenses: [payload.new, ...state.expenses],
              }
            })
          } else if (payload.eventType === 'UPDATE') {
            set((state) => ({
              expenses: state.expenses.map((e) =>
                e.id === payload.new.id ? payload.new : e
              ),
            }))
          } else if (payload.eventType === 'DELETE') {
            set((state) => ({
              expenses: state.expenses.filter((e) => e.id !== payload.old.id),
            }))
          }
        }
      )
      .subscribe()

    // Subscribe to categories changes
    const categoriesChannel = supabase
      .channel('categories-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'categories',
        },
        async (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            set((state) => {
              const existing = state.categories.find((c) => c.key === payload.new.key)
              if (existing) {
                return {
                  categories: state.categories.map((c) =>
                    c.key === payload.new.key ? payload.new : c
                  ),
                }
              }
              return {
                categories: [...state.categories, payload.new],
              }
            })
          } else if (payload.eventType === 'DELETE') {
            set((state) => ({
              categories: state.categories.filter((c) => c.key !== payload.old.key),
            }))
          }
        }
      )
      .subscribe()

    // Store channels for cleanup
    set({ _expensesChannel: expensesChannel, _categoriesChannel: categoriesChannel })
  },

  // Cleanup subscriptions
  cleanup: () => {
    const { _expensesChannel, _categoriesChannel } = get()
    if (_expensesChannel) supabase.removeChannel(_expensesChannel)
    if (_categoriesChannel) supabase.removeChannel(_categoriesChannel)
  },

  // Add expense with Supabase sync
  addExpense: async (expense) => {
    const expenseData = {
      id: expense.id || Date.now(),
      amount: expense.amount,
      person: expense.person,
      category: expense.category,
      note: expense.note || null,
      date: expense.date.toISOString(),
    }

    // Optimistically update UI
    set((state) => ({
      expenses: [expenseData, ...state.expenses],
    }))

    if (!supabase) {
      return
    }

    // Try to save to Supabase
    if (!get().isOnline) {
      // Queue for later sync
      set((state) => ({
        pendingMutations: [
          ...state.pendingMutations,
          { type: 'addExpense', data: expenseData },
        ],
      }))
      return
    }

    try {
      const { error } = await supabase.from('expenses').insert(expenseData)

      if (error) throw error
    } catch (error) {
      console.error('Failed to save expense:', error)
      // Queue for retry
      set((state) => ({
        pendingMutations: [
          ...state.pendingMutations,
          { type: 'addExpense', data: expenseData },
        ],
        syncError: error.message || 'Failed to save expense',
      }))
    }
  },

  // Add category with Supabase sync
  addCategory: async (label) => {
    const key = label.trim().toLowerCase().replace(/\s+/g, '-')
    const existing = get().categories.find((c) => c.key === key)
    if (existing) return

    const categoryData = {
      key,
      label,
      icon: 'tag',
      color: '#94A3B8',
    }

    // Optimistically update UI
    set((state) => ({
      categories: [...state.categories, categoryData],
    }))

    if (!supabase) {
      return
    }

    // Try to save to Supabase
    if (!get().isOnline) {
      set((state) => ({
        pendingMutations: [
          ...state.pendingMutations,
          { type: 'addCategory', data: categoryData },
        ],
      }))
      return
    }

    try {
      const { error } = await supabase.from('categories').upsert(categoryData, {
        onConflict: 'key',
      })

      if (error) throw error
    } catch (error) {
      console.error('Failed to save category:', error)
      set((state) => ({
        pendingMutations: [
          ...state.pendingMutations,
          { type: 'addCategory', data: categoryData },
        ],
        syncError: error.message || 'Failed to save category',
      }))
    }
  },

  // Delete expense with Supabase sync
  deleteExpense: async (expenseId) => {
    // Optimistically update UI
    set((state) => ({
      expenses: state.expenses.filter((e) => e.id !== expenseId),
    }))

    if (!supabase) {
      return
    }

    // Try to delete from Supabase
    if (!get().isOnline) {
      // Queue for later sync
      set((state) => ({
        pendingMutations: [
          ...state.pendingMutations,
          { type: 'deleteExpense', data: { id: expenseId } },
        ],
      }))
      return
    }

    try {
      const { error } = await supabase.from('expenses').delete().eq('id', expenseId)

      if (error) throw error
    } catch (error) {
      console.error('Failed to delete expense:', error)
      // Reload expenses to restore state
      get().initialize()
      // Queue for retry
      set((state) => ({
        pendingMutations: [
          ...state.pendingMutations,
          { type: 'deleteExpense', data: { id: expenseId } },
        ],
        syncError: error.message || 'Failed to delete expense',
      }))
    }
  },

  // Sync pending mutations when online
  syncPendingMutations: async () => {
    if (!supabase || !get().isOnline) return

    const pending = get().pendingMutations
    if (pending.length === 0) return

    set({ isLoading: true, syncError: null })

    const successful = []
    const failed = []

    for (const mutation of pending) {
      try {
        if (mutation.type === 'addExpense') {
          const { error } = await supabase.from('expenses').insert(mutation.data)
          if (error) throw error
          successful.push(mutation)
        } else if (mutation.type === 'addCategory') {
          const { error } = await supabase.from('categories').upsert(mutation.data, {
            onConflict: 'key',
          })
          if (error) throw error
          successful.push(mutation)
        } else if (mutation.type === 'deleteExpense') {
          const { error } = await supabase.from('expenses').delete().eq('id', mutation.data.id)
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
  setOnlineStatus: (isOnline) => {
    const wasOffline = !get().isOnline
    set({ isOnline })

    // Auto-sync when coming back online
    if (wasOffline && isOnline) {
      get().syncPendingMutations()
    }
  },

  getMonthlySummary: () => {
    const now = new Date()
    const month = now.getMonth()
    const year = now.getFullYear()
    const monthly = get().expenses.filter((e) => {
      const d = new Date(e.date)
      return d.getMonth() === month && d.getFullYear() === year
    })
    const total = monthly.reduce((sum, e) => sum + e.amount, 0)
    const byPerson = monthly.reduce(
      (acc, e) => {
        if (e.person === 'GH') acc.GH += e.amount
        else if (e.person === 'TM') acc.TM += e.amount
        else if (e.person === 'Both') acc.Both += e.amount
        return acc
      },
      { GH: 0, TM: 0, Both: 0 }
    )
    const categoryMap = {}
    for (const e of monthly) {
      categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount
    }
    return { total, byPerson, categoryMap, monthly }
  },
}))
