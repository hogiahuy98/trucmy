import { create } from 'zustand'
import NetInfo from '@react-native-community/netinfo'
import { supabase } from '../lib/supabase'
import type { Category, Expense, MonthlySummary, Income, BalanceSummary, Transfer } from '../types'

// ─── Supabase direct calls (replaces Next.js server actions) ─────────────────

async function getCategories() {
  if (!supabase) throw new Error('Supabase not initialized')
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw new Error(error.message)
  return data
}

async function addCategoryDB(category: Category) {
  if (!supabase) throw new Error('Supabase not initialized')
  const { error } = await supabase
    .from('categories')
    .upsert(category, { onConflict: 'key' })
  if (error) throw new Error(error.message)
}

async function getExpenses() {
  if (!supabase) throw new Error('Supabase not initialized')
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data
}

async function addExpenseDB(expense: Omit<Expense, 'id'> & { id?: number }) {
  if (!supabase) throw new Error('Supabase not initialized')
  const { error } = await supabase.from('expenses').insert(expense)
  if (error) throw new Error(error.message)
}

async function updateExpenseDB(id: number, updates: Partial<Expense>) {
  if (!supabase) throw new Error('Supabase not initialized')
  const { error } = await supabase.from('expenses').update(updates).eq('id', id)
  if (error) throw new Error(error.message)
}

async function deleteExpenseDB(id: number) {
  if (!supabase) throw new Error('Supabase not initialized')
  const { error } = await supabase.from('expenses').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

async function getIncomes() {
  if (!supabase) throw new Error('Supabase not initialized')
  const { data, error } = await supabase
    .from('incomes')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data
}

async function addIncomeDB(income: Omit<Income, 'id' | 'created_at' | 'updated_at'>) {
  if (!supabase) throw new Error('Supabase not initialized')
  const { data, error } = await supabase
    .from('incomes')
    .insert(income)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as Income
}

async function updateIncomeDB(id: number, updates: Partial<Income>) {
  if (!supabase) throw new Error('Supabase not initialized')
  const { error } = await supabase.from('incomes').update(updates).eq('id', id)
  if (error) throw new Error(error.message)
}

async function deleteIncomeDB(id: number) {
  if (!supabase) throw new Error('Supabase not initialized')
  const { error } = await supabase.from('incomes').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

async function getTransfers() {
  if (!supabase) throw new Error('Supabase not initialized')
  const { data, error } = await supabase
    .from('transfers')
    .select('*')
    .order('date', { ascending: false })
  if (error) throw new Error(error.message)
  return data
}

async function addTransferDB(transfer: Omit<Transfer, 'id' | 'created_at' | 'updated_at'>) {
  if (!supabase) throw new Error('Supabase not initialized')
  const { data, error } = await supabase
    .from('transfers')
    .insert(transfer)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as Transfer
}

async function updateTransferDB(id: number, updates: Partial<Transfer>) {
  if (!supabase) throw new Error('Supabase not initialized')
  const { error } = await supabase.from('transfers').update(updates).eq('id', id)
  if (error) throw new Error(error.message)
}

async function deleteTransferDB(id: number) {
  if (!supabase) throw new Error('Supabase not initialized')
  const { error } = await supabase.from('transfers').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

async function getMonthlyStats(month: number, year: number, startDate: string, endDate: string) {
  if (!supabase) return null
  const { data: expenses } = await supabase
    .from('expenses')
    .select('*')
    .gte('date', startDate)
    .lt('date', endDate)

  const { data: incomes } = await supabase
    .from('incomes')
    .select('*')
    .eq('month', month)
    .eq('year', year)

  const { data: transfers } = await supabase
    .from('transfers')
    .select('*')
    .gte('date', startDate)
    .lt('date', endDate)

  if (!expenses) return null

  const monthly = expenses as Expense[]
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
  const monthlySummary: MonthlySummary = { total, byPerson, categoryMap, monthly }

  const allIncomes = (incomes || []) as Income[]
  const allTransfers = (transfers || []) as Transfer[]

  const totalIncome = allIncomes.reduce((sum, i) => sum + i.value, 0)
  const ghIncome = allIncomes.filter(i => i.by_person === 'GH').reduce((sum, i) => sum + i.value, 0)
  const tmIncome = allIncomes.filter(i => i.by_person === 'TM').reduce((sum, i) => sum + i.value, 0)

  const ghExpenses = byPerson.GH + byPerson.Both / 2
  const tmExpenses = byPerson.TM + byPerson.Both / 2

  const ghTransfersSent = allTransfers.filter(t => t.from_person === 'GH').reduce((sum, t) => sum + t.amount, 0)
  const ghTransfersReceived = allTransfers.filter(t => t.to_person === 'GH').reduce((sum, t) => sum + t.amount, 0)
  const tmTransfersSent = allTransfers.filter(t => t.from_person === 'TM').reduce((sum, t) => sum + t.amount, 0)
  const tmTransfersReceived = allTransfers.filter(t => t.to_person === 'TM').reduce((sum, t) => sum + t.amount, 0)

  const ghNetTransfers = ghTransfersReceived - ghTransfersSent
  const tmNetTransfers = tmTransfersReceived - tmTransfersSent

  const balanceSummary: BalanceSummary = {
    totalIncome,
    totalExpenses: total,
    remaining: totalIncome - total + ghNetTransfers + tmNetTransfers,
    byPerson: {
      GH: { income: ghIncome, expenses: ghExpenses, transfers: ghNetTransfers, remaining: ghIncome - ghExpenses + ghNetTransfers },
      TM: { income: tmIncome, expenses: tmExpenses, transfers: tmNetTransfers, remaining: tmIncome - tmExpenses + tmNetTransfers },
    },
  }

  return { ...balanceSummary, monthlySummary }
}

// ─── Store ─────────────────────────────────────────────────────────────────

const DEFAULT_CATEGORIES: Category[] = [
  { key: 'cafe', label: 'Cafe', icon: 'coffee', color: '#A78BFA', disabled: false },
  { key: 'food', label: 'Ăn uống', icon: 'utensils', color: '#60A5FA', disabled: false },
  { key: 'market', label: 'Đi chợ', icon: 'shopping-cart', color: '#34D399', disabled: false },
  { key: 'fun', label: 'Giải trí', icon: 'clapperboard', color: '#F59E0B', disabled: false },
  { key: 'home', label: 'Tiền nhà', icon: 'home', color: '#F472B6', disabled: false },
  { key: 'internet', label: 'Tiền mạng', icon: 'wifi', color: '#22D3EE', disabled: false },
]

interface PendingMutation {
  type: 'addExpense' | 'addCategory' | 'deleteExpense' | 'updateExpense' | 'addIncome' | 'updateIncome' | 'deleteIncome' | 'addTransfer' | 'updateTransfer' | 'deleteTransfer'
  data: any
}

interface FinanceState {
  categories: Category[]
  expenses: Expense[]
  incomes: Income[]
  transfers: Transfer[]
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
  _transfersChannel?: any
  initialize: () => Promise<void>
  refreshStats: () => Promise<void>
  setupRealtimeSubscriptions: () => void
  cleanup: () => void
  addExpense: (expense: { id: number; amount: number; person: 'GH' | 'TM' | 'Both'; category: string; note?: string | null; date: Date | string }) => Promise<void>
  updateExpense: (expenseId: number, expense: { amount: number; person: 'GH' | 'TM' | 'Both'; category: string; note?: string | null; date: Date | string }) => Promise<void>
  addCategory: (label: string) => Promise<void>
  deleteExpense: (expenseId: number) => Promise<void>
  addIncome: (month: number, year: number, value: number, byPerson: 'GH' | 'TM', note?: string) => Promise<void>
  updateIncome: (incomeId: number, value: number, byPerson: 'GH' | 'TM', note?: string) => Promise<void>
  deleteIncome: (incomeId: number) => Promise<void>
  addTransfer: (transfer: { amount: number; from_person: 'GH' | 'TM'; to_person: 'GH' | 'TM'; note?: string | null; date: Date | string }) => Promise<void>
  updateTransfer: (transferId: number, updates: Partial<Transfer>) => Promise<void>
  deleteTransfer: (transferId: number) => Promise<void>
  getCurrentMonthIncomes: () => Income[]
  getCurrentMonthTransfers: () => Transfer[]
  getBalanceSummary: () => BalanceSummary
  syncPendingMutations: () => Promise<void>
  setOnlineStatus: (isOnline: boolean) => void
  getMonthlySummary: () => MonthlySummary
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  categories: DEFAULT_CATEGORIES,
  expenses: [],
  incomes: [],
  transfers: [],
  stats: { balanceSummary: null, monthlySummary: null },
  isLoading: false,
  isOnline: true,
  syncError: null,
  pendingMutations: [],

  initialize: async () => {
    set({ isLoading: true, syncError: null })

    // Check network status via NetInfo
    const netState = await NetInfo.fetch()
    set({ isOnline: netState.isConnected ?? true })

    try {
      const now = new Date()
      const month = now.getMonth()
      const year = now.getFullYear()
      const startDate = new Date(year, month, 1)
      const endDate = new Date(year, month + 1, 1)

      const [categoriesData, expensesData, incomesData, transfersData, statsData] = await Promise.all([
        getCategories(),
        getExpenses(),
        getIncomes(),
        getTransfers(),
        getMonthlyStats(month, year, startDate.toISOString(), endDate.toISOString()),
      ])

      const loadedCategories: Category[] =
        categoriesData && categoriesData.length > 0 ? categoriesData : DEFAULT_CATEGORIES

      set({
        categories: loadedCategories,
        expenses: (expensesData || []) as Expense[],
        incomes: (incomesData || []) as Income[],
        transfers: (transfersData || []) as Transfer[],
        stats: {
          balanceSummary: statsData,
          monthlySummary: statsData?.monthlySummary ?? null,
        },
        isLoading: false,
        syncError: null,
      })

      get().setupRealtimeSubscriptions()
    } catch (error: any) {
      console.error('Failed to load data:', error)
      set({ isLoading: false, syncError: error.message || 'Failed to load data' })
    }
  },

  refreshStats: async () => {
    try {
      set({ stats: { balanceSummary: null, monthlySummary: null } })
      const now = new Date()
      const month = now.getMonth()
      const year = now.getFullYear()
      const startDate = new Date(year, month, 1)
      const endDate = new Date(year, month + 1, 1)
      const statsData = await getMonthlyStats(month, year, startDate.toISOString(), endDate.toISOString())
      set({
        stats: {
          balanceSummary: statsData,
          monthlySummary: statsData?.monthlySummary ?? null,
        },
      })
    } catch (error) {
      console.error('Failed to refresh stats:', error)
    }
  },

  setupRealtimeSubscriptions: () => {
    if (!supabase) return

    // Tear down existing channels before re-subscribing to avoid
    // "cannot add callbacks after subscribe()" error on re-initialize
    const existing = get()
    if (existing._expensesChannel) supabase.removeChannel(existing._expensesChannel)
    if (existing._categoriesChannel) supabase.removeChannel(existing._categoriesChannel)
    if (existing._incomesChannel) supabase.removeChannel(existing._incomesChannel)
    if (existing._transfersChannel) supabase.removeChannel(existing._transfersChannel)
    set({ _expensesChannel: undefined, _categoriesChannel: undefined, _incomesChannel: undefined, _transfersChannel: undefined })

    const expensesChannel = supabase
      .channel('expenses-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, async (payload: any) => {
        if (payload.eventType === 'INSERT') {
          set((state) => {
            const exists = state.expenses.some((e) => e.id === payload.new.id)
            if (exists) return { expenses: state.expenses.map((e) => e.id === payload.new.id ? payload.new : e) }
            return { expenses: [payload.new, ...state.expenses] }
          })
        } else if (payload.eventType === 'UPDATE') {
          set((state) => ({ expenses: state.expenses.map((e) => e.id === payload.new.id ? payload.new : e) }))
        } else if (payload.eventType === 'DELETE') {
          set((state) => ({ expenses: state.expenses.filter((e) => e.id !== payload.old.id) }))
        }
        get().refreshStats()
      })
      .subscribe()

    const categoriesChannel = supabase
      .channel('categories-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, async (payload: any) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          set((state) => {
            const existing = state.categories.find((c) => c.key === payload.new.key)
            if (existing) return { categories: state.categories.map((c) => c.key === payload.new.key ? payload.new : c) }
            return { categories: [...state.categories, payload.new] }
          })
        } else if (payload.eventType === 'DELETE') {
          set((state) => ({ categories: state.categories.filter((c) => c.key !== payload.old.key) }))
        }
      })
      .subscribe()

    const incomesChannel = supabase
      .channel('incomes-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'incomes' }, async (payload: any) => {
        if (payload.eventType === 'INSERT') {
          set((state) => {
            const exists = state.incomes.some((i) => i.id === payload.new.id)
            if (exists) return { incomes: state.incomes.map((i) => i.id === payload.new.id ? payload.new : i) }
            return { incomes: [payload.new, ...state.incomes] }
          })
        } else if (payload.eventType === 'UPDATE') {
          set((state) => ({ incomes: state.incomes.map((i) => i.id === payload.new.id ? payload.new : i) }))
        } else if (payload.eventType === 'DELETE') {
          set((state) => ({ incomes: state.incomes.filter((i) => i.id !== payload.old.id) }))
        }
        get().refreshStats()
      })
      .subscribe()

    const transfersChannel = supabase
      .channel('transfers-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transfers' }, async (payload: any) => {
        if (payload.eventType === 'INSERT') {
          set((state) => {
            const exists = state.transfers.some((t) => t.id === payload.new.id)
            if (exists) return { transfers: state.transfers.map((t) => t.id === payload.new.id ? payload.new : t) }
            return { transfers: [payload.new, ...state.transfers] }
          })
        } else if (payload.eventType === 'UPDATE') {
          set((state) => ({ transfers: state.transfers.map((t) => t.id === payload.new.id ? payload.new : t) }))
        } else if (payload.eventType === 'DELETE') {
          set((state) => ({ transfers: state.transfers.filter((t) => t.id !== payload.old.id) }))
        }
        get().refreshStats()
      })
      .subscribe()

    set({ _expensesChannel: expensesChannel, _categoriesChannel: categoriesChannel, _incomesChannel: incomesChannel, _transfersChannel: transfersChannel })
  },

  cleanup: () => {
    const { _expensesChannel, _categoriesChannel, _incomesChannel, _transfersChannel } = get()
    if (_expensesChannel && supabase) supabase.removeChannel(_expensesChannel)
    if (_categoriesChannel && supabase) supabase.removeChannel(_categoriesChannel)
    if (_incomesChannel && supabase) supabase.removeChannel(_incomesChannel)
    if (_transfersChannel && supabase) supabase.removeChannel(_transfersChannel)
  },

  addExpense: async (expense) => {
    const expenseData: Expense = {
      id: expense.id || Date.now(),
      amount: expense.amount,
      person: expense.person,
      category: expense.category,
      note: expense.note || null,
      date: expense.date instanceof Date ? expense.date.toISOString() : expense.date,
    }
    set((state) => ({ expenses: [expenseData, ...state.expenses] }))

    if (!get().isOnline) {
      set((state) => ({ pendingMutations: [...state.pendingMutations, { type: 'addExpense', data: expenseData }] }))
      return
    }
    try {
      await addExpenseDB(expenseData)
      get().refreshStats()
    } catch (error: any) {
      console.error('Failed to save expense:', error)
      set((state) => ({ pendingMutations: [...state.pendingMutations, { type: 'addExpense', data: expenseData }], syncError: error.message }))
    }
  },

  updateExpense: async (expenseId, expense) => {
    const expenseData: Partial<Expense> = {
      amount: expense.amount,
      person: expense.person,
      category: expense.category,
      note: expense.note || null,
      date: expense.date instanceof Date ? expense.date.toISOString() : expense.date,
    }
    set((state) => ({ expenses: state.expenses.map((e) => e.id === expenseId ? { ...e, ...expenseData } : e) }))

    if (!get().isOnline) {
      set((state) => ({ pendingMutations: [...state.pendingMutations, { type: 'updateExpense', data: { id: expenseId, ...expenseData } }] }))
      return
    }
    try {
      await updateExpenseDB(expenseId, expenseData)
      get().refreshStats()
    } catch (error: any) {
      console.error('Failed to update expense:', error)
      get().initialize()
      set((state) => ({ pendingMutations: [...state.pendingMutations, { type: 'updateExpense', data: { id: expenseId, ...expenseData } }], syncError: error.message }))
    }
  },

  addCategory: async (label) => {
    const key = label.trim().toLowerCase().replace(/\s+/g, '-')
    const existing = get().categories.find((c) => c.key === key)
    if (existing) return
    const categoryData: Category = { key, label, icon: 'tag', color: '#94A3B8', disabled: false }
    set((state) => ({ categories: [...state.categories, categoryData] }))

    if (!get().isOnline) {
      set((state) => ({ pendingMutations: [...state.pendingMutations, { type: 'addCategory', data: categoryData }] }))
      return
    }
    try {
      await addCategoryDB(categoryData)
    } catch (error: any) {
      console.error('Failed to save category:', error)
      set((state) => ({ pendingMutations: [...state.pendingMutations, { type: 'addCategory', data: categoryData }], syncError: error.message }))
    }
  },

  deleteExpense: async (expenseId) => {
    set((state) => ({ expenses: state.expenses.filter((e) => e.id !== expenseId) }))
    if (!get().isOnline) {
      set((state) => ({ pendingMutations: [...state.pendingMutations, { type: 'deleteExpense', data: { id: expenseId } }] }))
      return
    }
    try {
      await deleteExpenseDB(expenseId)
      get().refreshStats()
    } catch (error: any) {
      console.error('Failed to delete expense:', error)
      get().initialize()
      set((state) => ({ pendingMutations: [...state.pendingMutations, { type: 'deleteExpense', data: { id: expenseId } }], syncError: error.message }))
    }
  },

  syncPendingMutations: async () => {
    if (!get().isOnline) return
    const pending = get().pendingMutations
    if (pending.length === 0) return
    set({ isLoading: true, syncError: null })
    const failed: PendingMutation[] = []
    for (const mutation of pending) {
      try {
        if (mutation.type === 'addExpense') await addExpenseDB(mutation.data)
        else if (mutation.type === 'addCategory') await addCategoryDB(mutation.data)
        else if (mutation.type === 'updateExpense') { const { id, ...d } = mutation.data; await updateExpenseDB(id, d) }
        else if (mutation.type === 'deleteExpense') await deleteExpenseDB(mutation.data.id)
        else if (mutation.type === 'addIncome') await addIncomeDB(mutation.data)
        else if (mutation.type === 'updateIncome') { const { id, ...d } = mutation.data; await updateIncomeDB(id, d) }
        else if (mutation.type === 'deleteIncome') await deleteIncomeDB(mutation.data.id)
        else if (mutation.type === 'addTransfer') await addTransferDB(mutation.data)
        else if (mutation.type === 'updateTransfer') { const { id, ...d } = mutation.data; await updateTransferDB(id, d) }
        else if (mutation.type === 'deleteTransfer') await deleteTransferDB(mutation.data.id)
      } catch { failed.push(mutation) }
    }
    set({ pendingMutations: failed, isLoading: false, syncError: failed.length > 0 ? 'Some changes failed to sync' : null })
    get().refreshStats()
  },

  setOnlineStatus: (isOnline) => {
    const wasOffline = !get().isOnline
    set({ isOnline })
    if (wasOffline && isOnline) get().syncPendingMutations()
  },

  getMonthlySummary: (): MonthlySummary => {
    const stats = get().stats.monthlySummary
    if (stats) return stats
    const now = new Date()
    const month = now.getMonth()
    const year = now.getFullYear()
    const monthly = get().expenses.filter((e) => {
      const d = new Date(e.date)
      return d.getMonth() === month && d.getFullYear() === year
    })
    const total = monthly.reduce((sum, e) => sum + e.amount, 0)
    const byPerson = monthly.reduce((acc, e) => {
      if (e.person === 'GH') acc.GH += e.amount
      else if (e.person === 'TM') acc.TM += e.amount
      else if (e.person === 'Both') acc.Both += e.amount
      return acc
    }, { GH: 0, TM: 0, Both: 0 })
    const categoryMap: Record<string, number> = {}
    for (const e of monthly) categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount
    return { total, byPerson, categoryMap, monthly }
  },

  getCurrentMonthIncomes: (): Income[] => {
    const now = new Date()
    return get().incomes.filter((i) => i.month === now.getMonth() && i.year === now.getFullYear())
  },

  addIncome: async (month, year, value, byPerson, note) => {
    const incomeData = { month, year, value, by_person: byPerson, note: note || null }
    const tempId = Date.now()
    set((state) => ({
      incomes: [{ id: tempId, ...incomeData, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }, ...state.incomes],
    }))
    if (!get().isOnline) {
      set((state) => ({ pendingMutations: [...state.pendingMutations, { type: 'addIncome', data: incomeData }] }))
      return
    }
    try {
      const data = await addIncomeDB(incomeData)
      set((state) => ({ incomes: state.incomes.map((i) => i.id === tempId ? data : i) }))
      get().refreshStats()
    } catch (error: any) {
      console.error('Failed to save income:', error)
      set((state) => ({
        incomes: state.incomes.filter((i) => i.id !== tempId),
        pendingMutations: [...state.pendingMutations, { type: 'addIncome', data: incomeData }],
        syncError: error.message,
      }))
    }
  },

  updateIncome: async (incomeId, value, byPerson, note) => {
    set((state) => ({
      incomes: state.incomes.map((i) =>
        i.id === incomeId ? { ...i, value, by_person: byPerson, note: note || null, updated_at: new Date().toISOString() } : i
      ),
    }))
    if (!get().isOnline) {
      set((state) => ({ pendingMutations: [...state.pendingMutations, { type: 'updateIncome', data: { id: incomeId, value, by_person: byPerson, note: note || null } }] }))
      return
    }
    try {
      await updateIncomeDB(incomeId, { value, by_person: byPerson, note: note || null, updated_at: new Date().toISOString() })
      get().refreshStats()
    } catch (error: any) {
      console.error('Failed to update income:', error)
      get().initialize()
      set((state) => ({ pendingMutations: [...state.pendingMutations, { type: 'updateIncome', data: { id: incomeId, value, by_person: byPerson, note: note || null } }], syncError: error.message }))
    }
  },

  deleteIncome: async (incomeId) => {
    set((state) => ({ incomes: state.incomes.filter((i) => i.id !== incomeId) }))
    if (!get().isOnline) {
      set((state) => ({ pendingMutations: [...state.pendingMutations, { type: 'deleteIncome', data: { id: incomeId } }] }))
      return
    }
    try {
      await deleteIncomeDB(incomeId)
      get().refreshStats()
    } catch (error: any) {
      console.error('Failed to delete income:', error)
      get().initialize()
      set((state) => ({ pendingMutations: [...state.pendingMutations, { type: 'deleteIncome', data: { id: incomeId } }], syncError: error.message }))
    }
  },

  addTransfer: async (transfer) => {
    const transferData = {
      amount: transfer.amount,
      from_person: transfer.from_person,
      to_person: transfer.to_person,
      note: transfer.note || null,
      date: transfer.date instanceof Date ? transfer.date.toISOString() : transfer.date,
    }
    const tempId = Date.now()
    set((state) => ({
      transfers: [{ id: tempId, ...transferData, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }, ...state.transfers],
    }))
    get().refreshStats()
    if (!get().isOnline) {
      set((state) => ({ pendingMutations: [...state.pendingMutations, { type: 'addTransfer', data: transferData }] }))
      return
    }
    try {
      const data = await addTransferDB(transferData)
      set((state) => ({ transfers: state.transfers.map((t) => t.id === tempId ? data : t) }))
      get().refreshStats()
    } catch (error: any) {
      console.error('Failed to save transfer:', error)
      set((state) => ({
        transfers: state.transfers.filter((t) => t.id !== tempId),
        pendingMutations: [...state.pendingMutations, { type: 'addTransfer', data: transferData }],
        syncError: error.message,
      }))
    }
  },

  updateTransfer: async (transferId, updates) => {
    set((state) => ({
      transfers: state.transfers.map((t) => t.id === transferId ? { ...t, ...updates, updated_at: new Date().toISOString() } : t),
    }))
    get().refreshStats()
    if (!get().isOnline) {
      set((state) => ({ pendingMutations: [...state.pendingMutations, { type: 'updateTransfer', data: { id: transferId, ...updates } }] }))
      return
    }
    try {
      await updateTransferDB(transferId, { ...updates, updated_at: new Date().toISOString() })
      get().refreshStats()
    } catch (error: any) {
      console.error('Failed to update transfer:', error)
      get().initialize()
      set((state) => ({ pendingMutations: [...state.pendingMutations, { type: 'updateTransfer', data: { id: transferId, ...updates } }], syncError: error.message }))
    }
  },

  deleteTransfer: async (transferId) => {
    set((state) => ({ transfers: state.transfers.filter((t) => t.id !== transferId) }))
    get().refreshStats()
    if (!get().isOnline) {
      set((state) => ({ pendingMutations: [...state.pendingMutations, { type: 'deleteTransfer', data: { id: transferId } }] }))
      return
    }
    try {
      await deleteTransferDB(transferId)
      get().refreshStats()
    } catch (error: any) {
      console.error('Failed to delete transfer:', error)
      get().initialize()
      set((state) => ({ pendingMutations: [...state.pendingMutations, { type: 'deleteTransfer', data: { id: transferId } }], syncError: error.message }))
    }
  },

  getCurrentMonthTransfers: (): Transfer[] => {
    const now = new Date()
    return get().transfers.filter((t) => {
      const d = new Date(t.date)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
  },

  getBalanceSummary: (): BalanceSummary => {
    const stats = get().stats.balanceSummary
    if (stats) return stats
    const currentMonthIncomes = get().getCurrentMonthIncomes()
    const currentMonthTransfers = get().getCurrentMonthTransfers()
    const monthlySummary = get().getMonthlySummary()

    const totalIncome = currentMonthIncomes.reduce((sum, i) => sum + i.value, 0)
    const ghIncome = currentMonthIncomes.filter(i => i.by_person === 'GH').reduce((sum, i) => sum + i.value, 0)
    const tmIncome = currentMonthIncomes.filter(i => i.by_person === 'TM').reduce((sum, i) => sum + i.value, 0)
    const totalExpenses = monthlySummary.total
    const ghExpenses = monthlySummary.byPerson.GH + (monthlySummary.byPerson.Both / 2)
    const tmExpenses = monthlySummary.byPerson.TM + (monthlySummary.byPerson.Both / 2)
    const ghTransfersSent = currentMonthTransfers.filter(t => t.from_person === 'GH').reduce((sum, t) => sum + t.amount, 0)
    const ghTransfersReceived = currentMonthTransfers.filter(t => t.to_person === 'GH').reduce((sum, t) => sum + t.amount, 0)
    const tmTransfersSent = currentMonthTransfers.filter(t => t.from_person === 'TM').reduce((sum, t) => sum + t.amount, 0)
    const tmTransfersReceived = currentMonthTransfers.filter(t => t.to_person === 'TM').reduce((sum, t) => sum + t.amount, 0)
    const ghNetTransfers = ghTransfersReceived - ghTransfersSent
    const tmNetTransfers = tmTransfersReceived - tmTransfersSent

    return {
      totalIncome, totalExpenses,
      remaining: totalIncome - totalExpenses + ghNetTransfers + tmNetTransfers,
      byPerson: {
        GH: { income: ghIncome, expenses: ghExpenses, transfers: ghNetTransfers, remaining: ghIncome - ghExpenses + ghNetTransfers },
        TM: { income: tmIncome, expenses: tmExpenses, transfers: tmNetTransfers, remaining: tmIncome - tmExpenses + tmNetTransfers },
      },
    }
  },
}))
