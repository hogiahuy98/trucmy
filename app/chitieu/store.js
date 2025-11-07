'use client'

import { create } from 'zustand'

export const useFinanceStore = create((set, get) => ({
  categories: [
    { key: 'cafe', label: 'Cafe', icon: 'coffee', color: '#A78BFA' },
    { key: 'food', label: 'Ăn uống', icon: 'utensils', color: '#60A5FA' },
    { key: 'market', label: 'Đi chợ', icon: 'shopping-cart', color: '#34D399' },
    { key: 'fun', label: 'Giải trí', icon: 'clapperboard', color: '#F59E0B' },
    { key: 'home', label: 'Tiền nhà', icon: 'home', color: '#F472B6' },
    { key: 'internet', label: 'Tiền mạng', icon: 'wifi', color: '#22D3EE' },
  ],
  expenses: [],
  addCategory: (label) =>
    set((state) => {
      const key = label.trim().toLowerCase().replace(/\s+/g, '-')
      if (state.categories.find((c) => c.key === key)) return state
      return {
        categories: [
          ...state.categories,
          { key, label, icon: 'tag', color: '#94A3B8' },
        ],
      }
    }),
  addExpense: (expense) =>
    set((state) => ({ expenses: [{ ...expense }, ...state.expenses] })),
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


