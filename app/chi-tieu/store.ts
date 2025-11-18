'use client'

import { create } from 'zustand'
import { supabase } from '../../lib/supabase'
import type { Category, Expense, MonthlySummary, Income, BalanceSummary } from './types'

const DEFAULT_CATEGORIES: Category[] = [
  {
    key: 'cafe', label: 'Cafe', icon: 'coffee', color: '#A78BFA',
    disabled: false
  },
  {
    key: 'food', label: 'Ăn uống', icon: 'utensils', color: '#60A5FA',
    disabled: false
  },
  {
    key: 'market', label: 'Đi chợ', icon: 'shopping-cart', color: '#34D399',
    disabled: false
  },
  {
    key: 'fun', label: 'Giải trí', icon: 'clapperboard', color: '#F59E0B',
    disabled: false
  },
  {
    key: 'home', label: 'Tiền nhà', icon: 'home', color: '#F472B6',
    disabled: false
  },
  {
    key: 'internet', label: 'Tiền mạng', icon: 'wifi', color: '#22D3EE',
    disabled: false
  },
]

interface PendingMutation {
  type: 'addExpense' | 'addCategory' | 'deleteExpense' | 'updateExpense' | 'addIncome' | 'updateIncome' | 'deleteIncome'
  data: any
}

interface FinanceState {
  categories: Category[]
  expenses: Expense[]
  incomes: Income[]
  isLoading: boolean
  isOnline: boolean
  syncError: string | null
  pendingMutations: PendingMutation[]
  _expensesChannel?: any
  _categoriesChannel?: any
  _incomesChannel?: any
  initialize: () => Promise<void>
  setupRealtimeSubscriptions: () => void
  cleanup: () => void
  addExpense: (expense: {
    id: number
    amount: number
    person: 'GH' | 'TM' | 'Both'
    category: string
    note?: string | null
    date: Date | string
  }) => Promise<void>
  updateExpense: (expenseId: number, expense: {
    amount: number
    person: 'GH' | 'TM' | 'Both'
    category: string
    note?: string | null
    date: Date | string
  }) => Promise<void>
  addCategory: (label: string) => Promise<void>
  deleteExpense: (expenseId: number) => Promise<void>
  addIncome: (month: number, year: number, value: number, byPerson: 'GH' | 'TM', note?: string) => Promise<void>
  updateIncome: (incomeId: number, value: number, byPerson: 'GH' | 'TM', note?: string) => Promise<void>
  deleteIncome: (incomeId: number) => Promise<void>
  getCurrentMonthIncomes: () => Income[]
  getBalanceSummary: () => BalanceSummary
  syncPendingMutations: () => Promise<void>
  setOnlineStatus: (isOnline: boolean) => void
  getMonthlySummary: () => MonthlySummary
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  categories: DEFAULT_CATEGORIES,
  expenses: [],
  incomes: [],
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
      // Load categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: true })

      if (categoriesError) throw categoriesError

      const loadedCategories: Category[] =
        categoriesData && categoriesData.length > 0
          ? categoriesData
          : DEFAULT_CATEGORIES

      // Load expenses
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })

      if (expensesError) throw expensesError

      // Load incomes
      const { data: incomesData, error: incomesError } = await supabase
        .from('incomes')
        .select('*')
        .order('year', { ascending: false })
        .order('month', { ascending: false })

      if (incomesError) throw incomesError

      set({
        categories: loadedCategories,
        expenses: (expensesData || []) as Expense[],
        incomes: (incomesData || []) as Income[],
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
        async (payload: any) => {
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
        async (payload: any) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            set((state) => {
              const existing = state.categories.find(
                (c) => c.key === payload.new.key
              )
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
              categories: state.categories.filter(
                (c) => c.key !== payload.old.key
              ),
            }))
          }
        }
      )
      .subscribe()

    // Subscribe to incomes changes
    const incomesChannel = supabase
      .channel('incomes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'incomes',
        },
        async (payload: any) => {
          if (payload.eventType === 'INSERT') {
            set((state) => {
              // Check if income already exists (avoid duplicate from optimistic update)
              const exists = state.incomes.some((i) => i.id === payload.new.id)
              if (exists) {
                return {
                  incomes: state.incomes.map((i) =>
                    i.id === payload.new.id ? payload.new : i
                  ),
                }
              }
              return {
                incomes: [payload.new, ...state.incomes],
              }
            })
          } else if (payload.eventType === 'UPDATE') {
            set((state) => ({
              incomes: state.incomes.map((i) =>
                i.id === payload.new.id ? payload.new : i
              ),
            }))
          } else if (payload.eventType === 'DELETE') {
            set((state) => ({
              incomes: state.incomes.filter((i) => i.id !== payload.old.id),
            }))
          }
        }
      )
      .subscribe()

    // Store channels for cleanup
    set({ 
      _expensesChannel: expensesChannel, 
      _categoriesChannel: categoriesChannel,
      _incomesChannel: incomesChannel
    })
  },

  // Cleanup subscriptions
  cleanup: () => {
    const { _expensesChannel, _categoriesChannel, _incomesChannel } = get()
    if (_expensesChannel && supabase) supabase.removeChannel(_expensesChannel)
    if (_categoriesChannel && supabase) supabase.removeChannel(_categoriesChannel)
    if (_incomesChannel && supabase) supabase.removeChannel(_incomesChannel)
  },

  // Add expense with Supabase sync
  addExpense: async (expense) => {
    const expenseData: Expense = {
      id: expense.id || Date.now(),
      amount: expense.amount,
      person: expense.person,
      category: expense.category,
      note: expense.note || null,
      date: expense.date instanceof Date ? expense.date.toISOString() : expense.date,
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
    } catch (error: any) {
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

  // Update expense with Supabase sync
  updateExpense: async (expenseId: number, expense) => {
    const expenseData: Partial<Expense> = {
      amount: expense.amount,
      person: expense.person,
      category: expense.category,
      note: expense.note || null,
      date: expense.date instanceof Date ? expense.date.toISOString() : expense.date,
    }

    // Optimistically update UI
    set((state) => ({
      expenses: state.expenses.map((e) =>
        e.id === expenseId ? { ...e, ...expenseData } : e
      ),
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
          { type: 'updateExpense', data: { id: expenseId, ...expenseData } },
        ],
      }))
      return
    }

    try {
      const { error } = await supabase
        .from('expenses')
        .update(expenseData)
        .eq('id', expenseId)

      if (error) throw error
    } catch (error: any) {
      console.error('Failed to update expense:', error)
      // Reload expenses to restore state
      get().initialize()
      // Queue for retry
      set((state) => ({
        pendingMutations: [
          ...state.pendingMutations,
          { type: 'updateExpense', data: { id: expenseId, ...expenseData } },
        ],
        syncError: error.message || 'Failed to update expense',
      }))
    }
  },

  // Add category with Supabase sync
  addCategory: async (label: string) => {
    const key = label.trim().toLowerCase().replace(/\s+/g, '-')
    const existing = get().categories.find((c) => c.key === key)
    if (existing) return

    const categoryData: Category = {
      key,
      label,
      icon: 'tag',
      color: '#94A3B8',
      disabled: false,
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
    } catch (error: any) {
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
  deleteExpense: async (expenseId: number) => {
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
    } catch (error: any) {
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

    const successful: PendingMutation[] = []
    const failed: PendingMutation[] = []

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
        } else if (mutation.type === 'updateExpense') {
          const { id, ...updateData } = mutation.data
          const { error } = await supabase
            .from('expenses')
            .update(updateData)
            .eq('id', id)
          if (error) throw error
          successful.push(mutation)
        } else if (mutation.type === 'deleteExpense') {
          const { error } = await supabase
            .from('expenses')
            .delete()
            .eq('id', mutation.data.id)
          if (error) throw error
          successful.push(mutation)
        } else if (mutation.type === 'addIncome') {
          const { month, year, value, by_person, note } = mutation.data
          const { error } = await supabase
            .from('incomes')
            .insert({
              month,
              year,
              value,
              by_person,
              note: note || null,
            })
          if (error) throw error
          successful.push(mutation)
        } else if (mutation.type === 'updateIncome') {
          const { id, value, by_person, note } = mutation.data
          const { error } = await supabase
            .from('incomes')
            .update({
              value,
              by_person,
              note: note || null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', id)
          if (error) throw error
          successful.push(mutation)
        } else if (mutation.type === 'deleteIncome') {
          const { error } = await supabase
            .from('incomes')
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

    // Auto-sync when coming back online
    if (wasOffline && isOnline) {
      get().syncPendingMutations()
    }
  },

  getMonthlySummary: (): MonthlySummary => {
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
    const categoryMap: Record<string, number> = {}
    for (const e of monthly) {
      categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount
    }
    return { total, byPerson, categoryMap, monthly }
  },

  // Get current month incomes (all incomes for current month)
  getCurrentMonthIncomes: (): Income[] => {
    const now = new Date()
    const month = now.getMonth()
    const year = now.getFullYear()
    return get().incomes.filter((i) => i.month === month && i.year === year)
  },

  // Add new income (always creates new record)
  addIncome: async (month: number, year: number, value: number, byPerson: 'GH' | 'TM', note?: string) => {
    const incomeData: Omit<Income, 'id' | 'created_at' | 'updated_at'> = {
      month,
      year,
      value,
      by_person: byPerson,
      note: note || null,
    }

    // Optimistically update UI
    const tempId = Date.now()
    set((state) => ({
      incomes: [
        {
          id: tempId,
          ...incomeData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        ...state.incomes,
      ],
    }))

    if (!supabase) {
      return
    }

    // Try to save to Supabase
    if (!get().isOnline) {
      set((state) => ({
        pendingMutations: [
          ...state.pendingMutations,
          { type: 'addIncome', data: { month, year, ...incomeData } },
        ],
      }))
      return
    }

    try {
      const { data, error } = await supabase
        .from('incomes')
        .insert({
          month,
          year,
          value,
          by_person: byPerson,
          note: note || null,
        })
        .select()
        .single()

      if (error) throw error

      // Replace optimistic update with real data
      set((state) => ({
        incomes: state.incomes.map((i) =>
          i.id === tempId ? data : i
        ),
      }))
    } catch (error: any) {
      console.error('Failed to save income:', error)
      // Remove optimistic update
      set((state) => ({
        incomes: state.incomes.filter((i) => i.id !== tempId),
        pendingMutations: [
          ...state.pendingMutations,
          { type: 'addIncome', data: { month, year, ...incomeData } },
        ],
        syncError: error.message || 'Failed to save income',
      }))
    }
  },

  // Update existing income
  updateIncome: async (incomeId: number, value: number, byPerson: 'GH' | 'TM', note?: string) => {
    // Optimistically update UI
    set((state) => ({
      incomes: state.incomes.map((i) =>
        i.id === incomeId
          ? { ...i, value, by_person: byPerson, note: note || null, updated_at: new Date().toISOString() }
          : i
      ),
    }))

    if (!supabase) {
      return
    }

    // Try to save to Supabase
    if (!get().isOnline) {
      set((state) => ({
        pendingMutations: [
          ...state.pendingMutations,
          { type: 'updateIncome', data: { id: incomeId, value, by_person: byPerson, note: note || null } },
        ],
      }))
      return
    }

    try {
      const { error } = await supabase
        .from('incomes')
        .update({
          value,
          by_person: byPerson,
          note: note || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', incomeId)

      if (error) throw error
    } catch (error: any) {
      console.error('Failed to update income:', error)
      // Reload incomes to restore state
      get().initialize()
      set((state) => ({
        pendingMutations: [
          ...state.pendingMutations,
          { type: 'updateIncome', data: { id: incomeId, value, by_person: byPerson, note: note || null } },
        ],
        syncError: error.message || 'Failed to update income',
      }))
    }
  },

  // Delete income
  deleteIncome: async (incomeId: number) => {
    // Optimistically update UI
    set((state) => ({
      incomes: state.incomes.filter((i) => i.id !== incomeId),
    }))

    if (!supabase) {
      return
    }

    // Try to delete from Supabase
    if (!get().isOnline) {
      set((state) => ({
        pendingMutations: [
          ...state.pendingMutations,
          { type: 'deleteIncome', data: { id: incomeId } },
        ],
      }))
      return
    }

    try {
      const { error } = await supabase
        .from('incomes')
        .delete()
        .eq('id', incomeId)

      if (error) throw error
    } catch (error: any) {
      console.error('Failed to delete income:', error)
      // Reload incomes to restore state
      get().initialize()
      set((state) => ({
        pendingMutations: [
          ...state.pendingMutations,
          { type: 'deleteIncome', data: { id: incomeId } },
        ],
        syncError: error.message || 'Failed to delete income',
      }))
    }
  },

  // Get balance summary (sums all incomes for current month)
  getBalanceSummary: (): BalanceSummary => {
    const currentMonthIncomes = get().getCurrentMonthIncomes()
    const monthlySummary = get().getMonthlySummary()

    // Sum all incomes for current month
    const totalIncome = currentMonthIncomes.reduce((sum, i) => sum + i.value, 0)
    const totalGhIncome = currentMonthIncomes
      .filter((i) => i.by_person === 'GH')
      .reduce((sum, i) => sum + i.value, 0)
    const totalTmIncome = currentMonthIncomes
      .filter((i) => i.by_person === 'TM')
      .reduce((sum, i) => sum + i.value, 0)

    const totalExpenses = monthlySummary.total
    const remaining = totalIncome - totalExpenses

    // Calculate by person (split "Both" expenses 50/50)
    const ghExpenses = monthlySummary.byPerson.GH + monthlySummary.byPerson.Both / 2
    const tmExpenses = monthlySummary.byPerson.TM + monthlySummary.byPerson.Both / 2

    return {
      totalIncome,
      totalExpenses,
      remaining,
      byPerson: {
        GH: {
          income: totalGhIncome,
          expenses: ghExpenses,
          remaining: totalGhIncome - ghExpenses,
        },
        TM: {
          income: totalTmIncome,
          expenses: tmExpenses,
          remaining: totalTmIncome - tmExpenses,
        },
      },
    }
  },
}))

