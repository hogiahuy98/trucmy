'use client'

import { useMemo } from 'react'
import type { Expense } from '../types'
import { formatVND } from '../utils'
import dayjs from 'dayjs'

interface InsightsCardProps {
  expenses: Expense[]
}

export default function InsightsCard({ expenses }: InsightsCardProps) {
  const insights = useMemo(() => {
    const now = dayjs()
    const thisMonth = expenses.filter((e) => {
      const d = dayjs(e.date)
      return d.month() === now.month() && d.year() === now.year()
    })

    if (thisMonth.length === 0) return []

    const results: string[] = []
    const daysPassed = now.date()
    const totalDaysInMonth = now.daysInMonth()
    const total = thisMonth.reduce((s, e) => s + e.amount, 0)
    const dailyAvg = daysPassed > 0 ? total / daysPassed : 0
    const projected = dailyAvg * totalDaysInMonth

    results.push(`Trung bình ${formatVND(Math.round(dailyAvg))}/ngày`)
    results.push(`Dự kiến cả tháng ~${formatVND(Math.round(projected))}`)

    const catMap: Record<string, number> = {}
    for (const e of thisMonth) catMap[e.category] = (catMap[e.category] || 0) + e.amount
    const topCat = Object.entries(catMap).sort(([, a], [, b]) => b - a)[0]
    if (topCat) results.push(`Chi nhiều nhất: ${topCat[0]} (${formatVND(topCat[1])})`)

    return results
  }, [expenses])

  if (insights.length === 0) return null

  return (
    <div
      style={{
        backgroundColor: '#EEF6E8',
        borderRadius: '20px',
        padding: '20px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}
    >
      <div style={{ fontSize: '14px', fontWeight: 600, color: '#6F8F5F', marginBottom: '8px' }}>
        Nhận xét
      </div>
      {insights.map((text, i) => (
        <div key={i} style={{ display: 'flex', gap: '6px', marginBottom: '4px' }}>
          <span style={{ fontSize: '13px', color: '#6F8F5F', marginTop: '1px' }}>•</span>
          <span style={{ flex: 1, fontSize: '13px', color: '#2D2A24', lineHeight: '20px' }}>{text}</span>
        </div>
      ))}
    </div>
  )
}

