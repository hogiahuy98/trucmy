'use client'

import { useMemo } from 'react'
import { Card, Space, Typography } from 'antd'
import { Calendar } from 'lucide-react'
import { formatVND } from '../utils'
import type { Expense } from '../types'
import dayjs from 'dayjs'

const { Text, Title } = Typography

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
    <Card
      className="rounded-2xl border-2 shadow-lg"
      style={{
        borderColor: '#ff4b6e',
        background: 'linear-gradient(135deg, #fff5f7 0%, #ffe0e6 100%)',
        boxShadow: '0 8px 24px rgba(255, 75, 110, 0.2)',
      }}
    >
      <Space direction="vertical" size={8} className="w-full">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-[#ff4b6e]" />
          <Text type="secondary" className="text-sm font-medium">
            Chi tiêu hôm nay
          </Text>
        </div>
        <Title
          level={2}
          className="!m-0 !text-3xl !font-bold"
          style={{ color: '#ff4b6e' }}
        >
          {formatVND(todayTotal)}
        </Title>
        {todayCount > 0 && (
          <Text type="secondary" className="text-xs">
            {todayCount} {todayCount === 1 ? 'giao dịch' : 'giao dịch'}
          </Text>
        )}
        {todayTotal === 0 && (
          <Text type="secondary" className="text-xs italic">
            Chưa có chi tiêu nào hôm nay 🎉
          </Text>
        )}
      </Space>
    </Card>
  )
}

