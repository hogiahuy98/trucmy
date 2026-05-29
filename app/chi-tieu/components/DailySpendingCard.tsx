'use client'

import { useMemo } from 'react'
import { formatVND } from '../utils'
import type { Expense } from '../types'
import dayjs from 'dayjs'

const PERSON_COLORS: Record<string, string> = {
  GH: '#A3C68C',
  TM: '#9B8FD4',
  Both: '#E69D87',
}

const PERSON_LABELS: Record<string, string> = {
  GH: 'GH',
  TM: 'TM',
  Both: 'Cả 2',
}

interface DailySpendingCardProps {
  expenses: Expense[]
}

export default function DailySpendingCard({ expenses }: DailySpendingCardProps) {
  const today = dayjs().startOf('day')
  const yesterday = today.subtract(1, 'day')

  const todayExpenses = useMemo(() =>
    expenses.filter((e) => dayjs(e.date).startOf('day').isSame(today)),
    [expenses]
  )

  const yesterdayExpenses = useMemo(() =>
    expenses.filter((e) => dayjs(e.date).startOf('day').isSame(yesterday)),
    [expenses]
  )

  const todayTotal = todayExpenses.reduce((s, e) => s + e.amount, 0)
  const yesterdayTotal = yesterdayExpenses.reduce((s, e) => s + e.amount, 0)

  const renderItems = (items: Expense[]) =>
    items.slice(0, 3).map((e) => (
      <div
        key={e.id}
        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
      >
        <div
          style={{
            padding: '2px 6px',
            borderRadius: '6px',
            backgroundColor: `${PERSON_COLORS[e.person] || '#7A7060'}22`,
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: PERSON_COLORS[e.person] || '#7A7060',
            }}
          >
            {PERSON_LABELS[e.person] || e.person}
          </span>
        </div>
        <span
          style={{
            flex: 1,
            fontSize: '13px',
            color: '#2D2A24',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {e.note || e.category}
        </span>
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#2D2A24', flexShrink: 0 }}>
          {formatVND(e.amount)}
        </span>
      </div>
    ))

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        padding: '20px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}
    >
      <div style={{ fontSize: '15px', fontWeight: 600, color: '#2D2A24', marginBottom: '8px' }}>
        Chi tiêu hôm nay
      </div>

      {todayExpenses.length === 0 ? (
        <div style={{ fontSize: '13px', color: '#7A7060', fontStyle: 'italic', paddingBottom: '4px' }}>
          Chưa có chi tiêu hôm nay
        </div>
      ) : (
        <>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#2D2A24', marginBottom: '10px' }}>
            {formatVND(todayTotal)}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {renderItems(todayExpenses)}
          </div>
          {todayExpenses.length > 3 && (
            <div style={{ fontSize: '12px', color: '#7A7060', marginTop: '6px' }}>
              +{todayExpenses.length - 3} giao dịch khác
            </div>
          )}
        </>
      )}

      {yesterdayExpenses.length > 0 && (
        <>
          <div
            style={{
              height: '1px',
              backgroundColor: '#E8E4DC',
              margin: '12px 0',
            }}
          />
          <div style={{ fontSize: '13px', fontWeight: 500, color: '#7A7060', marginBottom: '8px' }}>
            Hôm qua — {formatVND(yesterdayTotal)}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {renderItems(yesterdayExpenses)}
          </div>
        </>
      )}
    </div>
  )
}

