'use client'

import { useMemo } from 'react'
import { CalendarDays } from 'lucide-react'
import { formatVND } from '../utils'
import type { Expense } from '../types'
import dayjs from 'dayjs'

interface DailySpendingCardProps {
  expenses: Expense[]
}

export default function DailySpendingCard({ expenses }: DailySpendingCardProps) {
  const todayTotal = useMemo(() => {
    const today = dayjs().startOf('day')
    const todayExpenses = expenses.filter((e) => {
      const expenseDate = dayjs(e.date).startOf('day')
      return expenseDate.isSame(today)
    })
    return todayExpenses.reduce((sum, e) => sum + e.amount, 0)
  }, [expenses])

  const todayCount = useMemo(() => {
    const today = dayjs().startOf('day')
    return expenses.filter((e) => {
      const expenseDate = dayjs(e.date).startOf('day')
      return expenseDate.isSame(today)
    }).length
  }, [expenses])

  return (
    <div
      style={{
        backgroundColor: '#EFECE6', // warm linen
        borderRadius: '20px',
        padding: '20px',
        boxShadow: '0 2px 16px rgba(111, 143, 95, 0.08)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <CalendarDays
          size={18}
          style={{ color: '#A3C68C', strokeWidth: 1.5 }}
        />
        <div
          style={{
            color: '#8B8F7A',
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          Chi tiêu hôm nay
        </div>
      </div>
      <div
        style={{
          color: '#4A4F3B',
          fontSize: '28px',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          marginBottom: '4px',
        }}
      >
        {formatVND(todayTotal)}
      </div>
      {todayCount > 0 && (
        <div
          style={{
            color: '#8B8F7A',
            fontSize: '14px',
          }}
        >
          {todayCount} {todayCount === 1 ? 'giao dịch' : 'giao dịch'}
        </div>
      )}
      {todayTotal === 0 && (
        <div
          style={{
            color: '#8B8F7A',
            fontSize: '14px',
            fontStyle: 'italic',
          }}
        >
          Chưa có chi tiêu nào hôm nay
        </div>
      )}
    </div>
  )
}

