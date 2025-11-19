'use client'

import { create } from 'zustand'
import { supabase } from '../../lib/supabase'
import type { Category, Expense, MonthlySummary, Income, BalanceSummary } from './types'
import {
  getCategories,
  getExpenses,
  getIncomes,
  addExpense,
  updateExpense,
  deleteExpense,
  addCategory,
  addIncome,
  updateIncome,
  deleteIncome,
  getMonthlyStats
} from '../actions/finance'

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
  stats: {
    balanceSummary: BalanceSummary | null
    monthlySummary: MonthlySummary | null
  }
  isLoading: boolean
  isOnline: boolean
  syncError: string | null
  pendingMutations: PendingMutation[]
  _expensesChannel?: any
  _categoriesChannel?: any
  _incomesChannel?: any
  initialize: () => Promise<void>
  refreshStats: () => Promise<void>
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
  stats: {
    balanceSummary: null,
    monthlySummary: null
  },
  isLoading: false,
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  syncError: null,
  pendingMutations: [],

  // Initialize: Load data from Server Actions
  initialize: async () => {
    set({ isLoading: true, syncError: null })

    try {
      const now = new Date()
      const month = now.getMonth()
      const year = now.getFullYear()

      // Calculate date range for current month in local time
      const startDate = new Date(year, month, 1)
      const endDate = new Date(year, month + 1, 1)

      // Load data in parallel
      const [categoriesData, expensesData, incomesData, statsData] = await Promise.all([
        getCategories(),
        getExpenses(),
        getIncomes(),
        getMonthlyStats(month, year, startDate.toISOString(), endDate.toISOString())
      ])

      const loadedCategories: Category[] =
        categoriesData && categoriesData.length > 0
          ? categoriesData
          : DEFAULT_CATEGORIES

      set({
        categories: loadedCategories,
        expenses: (expensesData || []) as Expense[],
        incomes: (incomesData || []) as Income[],
        stats: {
          balanceSummary: statsData,
          monthlySummary: statsData?.monthlySummary
        },
        isLoading: false,
        syncError: null,
      })

      // Setup real-time subscriptions
      get().setupRealtimeSubscriptions()
    } catch (error: any) {
      console.error('Failed to load data:', error)
      set({
        isLoading: false,
        syncError: error.message || 'Failed to load data',
      })
    }
  },

  // Refresh stats only
  refreshStats: async () => {
    try {
      const now = new Date()
      const month = now.getMonth()
      const year = now.getFullYear()
      // Calculate date range for current month in local time
      const startDate = new Date(year, month, 1)
      const endDate = new Date(year, month + 1, 1)
      
      const statsData = await getMonthlyStats(month, year, startDate.toISOString(), endDate.toISOString())
      
      set({
        stats: {
          balanceSummary: statsData,
          monthlySummary: statsData?.monthlySummary
        }
      })
    } catch (error) {
      console.error('Failed to refresh stats:', error)
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
              const exists = state.expenses.some((e) => e.id === payload.new.id)
              if (exists) {
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
          // Refresh stats on any change
          get().refreshStats()
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
          // Refresh stats on any change
          get().refreshStats()
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
      await addExpense(expenseData)
      get().refreshStats()
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
      await updateExpense(expenseId, expenseData)
      get().refreshStats()
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
      await addCategory(categoryData)
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
      await deleteExpense(expenseId)
      get().refreshStats()
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
    if (!get().isOnline) return

    const pending = get().pendingMutations
    if (pending.length === 0) return

    set({ isLoading: true, syncError: null })

    const successful: PendingMutation[] = []
    const failed: PendingMutation[] = []

    for (const mutation of pending) {
      try {
        if (mutation.type === 'addExpense') {
          await addExpense(mutation.data)
          successful.push(mutation)
        } else if (mutation.type === 'addCategory') {
          await addCategory(mutation.data)
          successful.push(mutation)
        } else if (mutation.type === 'updateExpense') {
          const { id, ...updateData } = mutation.data
          await updateExpense(id, updateData)
          successful.push(mutation)
        } else if (mutation.type === 'deleteExpense') {
          await deleteExpense(mutation.data.id)
          successful.push(mutation)
        } else if (mutation.type === 'addIncome') {
          await addIncome(mutation.data)
          successful.push(mutation)
        } else if (mutation.type === 'updateIncome') {
          const { id, ...updateData } = mutation.data
          await updateIncome(id, updateData)
          successful.push(mutation)
        } else if (mutation.type === 'deleteIncome') {
          await deleteIncome(mutation.data.id)
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
    
    // Refresh stats after sync
    get().refreshStats()
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
    const stats = get().stats.monthlySummary
    if (stats) return stats

    // Fallback to client-side calculation if stats not loaded yet
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

    // Try to save to Supabase
    if (!get().isOnline) {
      set((state) => ({
        pendingMutations: [
          ...state.pendingMutations,
          { type: 'addIncome', data: { ...incomeData } },
        ],
      }))
      return
    }

    try {
      const data = await addIncome(incomeData)

      // Replace optimistic update with real data
      set((state) => ({
        incomes: state.incomes.map((i) =>
          i.id === tempId ? data : i
        ),
      }))
      get().refreshStats()
    } catch (error: any) {
      console.error('Failed to save income:', error)
      // Remove optimistic update
      set((state) => ({
        incomes: state.incomes.filter((i) => i.id !== tempId),
        pendingMutations: [
          ...state.pendingMutations,
          { type: 'addIncome', data: { ...incomeData } },
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
      await updateIncome(incomeId, {
        value,
        by_person: byPerson,
        note: note || null,
        updated_at: new Date().toISOString(),
      })
      get().refreshStats()
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
      await deleteIncome(incomeId)
      get().refreshStats()
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
    const stats = get().stats.balanceSummary
    if (stats) return stats

    // Fallback to client-side calculation if stats not loaded yet
    const currentMonthIncomes = get().getCurrentMonthIncomes()
    const monthlySummary = get().getMonthlySummary()

    // Calculate incomes
    const totalIncome = currentMonthIncomes.reduce((sum, i) => sum + i.value, 0)
    const ghIncome = currentMonthIncomes
      .filter((i) => i.by_person === 'GH')
      .reduce((sum, i) => sum + i.value, 0)
    const tmIncome = currentMonthIncomes
      .filter((i) => i.by_person === 'TM')
      .reduce((sum, i) => sum + i.value, 0)

    // Calculate expenses
    const totalExpenses = monthlySummary.total
    
    // Calculate split expenses (Both is split 50/50)
    const ghExpenses = monthlySummary.byPerson.GH + (monthlySummary.byPerson.Both / 2)
    const tmExpenses = monthlySummary.byPerson.TM + (monthlySummary.byPerson.Both / 2)

    return {
      totalIncome,
      totalExpenses,
      remaining: totalIncome - totalExpenses,
      byPerson: {
        GH: {
          income: ghIncome,
          expenses: ghExpenses,
          remaining: ghIncome - ghExpenses
        },
        TM: {
          income: tmIncome,
          expenses: tmExpenses,
          remaining: tmIncome - tmExpenses
        }
      }
    }
  },
}))
