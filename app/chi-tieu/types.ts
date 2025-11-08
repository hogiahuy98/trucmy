export interface Category {
  key: string
  label: string
  icon: string
  color: string
}

export interface Expense {
  id: number
  amount: number
  person: 'GH' | 'TM' | 'Both'
  category: string
  note?: string | null
  date: string | Date
}

export interface MonthlySummary {
  total: number
  byPerson: {
    GH: number
    TM: number
    Both: number
  }
  categoryMap: Record<string, number>
  monthly: Expense[]
}

