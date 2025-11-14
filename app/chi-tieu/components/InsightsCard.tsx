'use client'

import { useMemo } from 'react'
import { Sparkles } from 'lucide-react'
import type { Expense } from '../types'
import dayjs from 'dayjs'

interface InsightsCardProps {
  expenses: Expense[]
}

export default function InsightsCard({ expenses }: InsightsCardProps) {
  const insight = useMemo(() => {
    const now = dayjs()
    const thisWeekStart = now.startOf('week')
    const lastWeekStart = thisWeekStart.subtract(1, 'week')
    const lastWeekEnd = thisWeekStart.subtract(1, 'day')

    // Calculate this week's spending
    const thisWeekExpenses = expenses.filter((e) => {
      const expenseDate = dayjs(e.date)
      return expenseDate.isAfter(thisWeekStart) || expenseDate.isSame(thisWeekStart, 'day')
    })
    const thisWeekTotal = thisWeekExpenses.reduce((sum, e) => sum + e.amount, 0)

    // Calculate last week's spending
    const lastWeekExpenses = expenses.filter((e) => {
      const expenseDate = dayjs(e.date)
      return (
        (expenseDate.isAfter(lastWeekStart) || expenseDate.isSame(lastWeekStart, 'day')) &&
        (expenseDate.isBefore(lastWeekEnd) || expenseDate.isSame(lastWeekEnd, 'day'))
      )
    })
    const lastWeekTotal = lastWeekExpenses.reduce((sum, e) => sum + e.amount, 0)

    // Calculate category changes
    const thisWeekByCategory: Record<string, number> = {}
    thisWeekExpenses.forEach((e) => {
      thisWeekByCategory[e.category] = (thisWeekByCategory[e.category] || 0) + e.amount
    })

    const lastWeekByCategory: Record<string, number> = {}
    lastWeekExpenses.forEach((e) => {
      lastWeekByCategory[e.category] = (lastWeekByCategory[e.category] || 0) + e.amount
    })

    // Find category with biggest change
    let biggestChange: { category: string; change: number } | null = null
    Object.keys(thisWeekByCategory).forEach((cat) => {
      const thisWeek = thisWeekByCategory[cat]
      const lastWeek = lastWeekByCategory[cat] || 0
      if (lastWeek > 0) {
        const change = ((thisWeek - lastWeek) / lastWeek) * 100
        if (!biggestChange || Math.abs(change) > Math.abs(biggestChange.change)) {
          biggestChange = { category: cat, change }
        }
      }
    })

    // Generate insight
    if (thisWeekTotal === 0 && lastWeekTotal === 0) {
      return {
        text: 'Hai tụi mình chưa có chi tiêu tuần này. Tiếp tục giữ thói quen tốt nhé',
        emoji: '✨',
      }
    }

    if (thisWeekTotal === 0) {
      return {
        text: 'Tuần này hai tụi mình chưa chi tiêu gì — rất tốt',
        emoji: '🧡',
      }
    }

    if (lastWeekTotal === 0) {
      return {
        text: 'Tuần này hai tụi mình bắt đầu ghi lại chi tiêu. Cùng nhau quản lý tốt nhé',
        emoji: '💛',
      }
    }

    const totalChange = ((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100

    if (Math.abs(totalChange) < 5) {
      return {
        text: 'Tuần này hai tụi mình chi tiêu khá ổn định — giữ nhịp độ tốt',
        emoji: '🧡',
      }
    }

    if (totalChange < -5) {
      const categoryText = biggestChange && biggestChange.change < -10
        ? ` — ${biggestChange.category} giảm nhẹ`
        : ''
      return {
        text: `Tuần này hai tụi mình chi tiêu giảm ${Math.round(Math.abs(totalChange))}%${categoryText}`,
        emoji: '🧡',
      }
    }

    if (totalChange > 5 && totalChange < 15) {
      return {
        text: 'Tuần này chi tiêu tăng nhẹ — có thể do nhu cầu tạm thời',
        emoji: '💛',
      }
    }

    return {
      text: 'Hai tụi mình đang quản lý chi tiêu cùng nhau — tiếp tục nhé',
      emoji: '💛',
    }
  }, [expenses])

  return (
    <div
      style={{
        backgroundColor: '#D8E2D0', // sage
        borderRadius: '20px',
        padding: '20px',
        boxShadow: '0 2px 16px rgba(111, 143, 95, 0.08)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            backgroundColor: 'rgba(163, 198, 140, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Sparkles size={20} style={{ color: '#A3C68C', strokeWidth: 1.5 }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              color: '#4A4F3B',
              fontSize: '16px',
              lineHeight: '1.5',
              fontWeight: 500,
            }}
          >
            {insight.text} {insight.emoji}
          </div>
        </div>
      </div>
    </div>
  )
}

