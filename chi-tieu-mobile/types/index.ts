export interface Category {
  key: string
  label: string
  icon: string
  color: string
  disabled: boolean
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

export interface Income {
  id: number
  month: number  // 0-11
  year: number
  value: number
  by_person: 'GH' | 'TM'
  note?: string | null
  created_at: string
  updated_at: string
}

export interface Transfer {
  id: number
  amount: number
  from_person: 'GH' | 'TM'
  to_person: 'GH' | 'TM'
  note?: string | null
  date: string | Date
  created_at: string
  updated_at: string
}

export interface BalanceSummary {
  totalIncome: number
  totalExpenses: number
  remaining: number
  byPerson: {
    GH: {
      income: number
      expenses: number
      transfers: number
      remaining: number
    }
    TM: {
      income: number
      expenses: number
      transfers: number
      remaining: number
    }
  }
}
