import React, { useMemo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { COLORS, CARD_STYLE } from './theme'
import { formatVND } from '../utils'
import type { Expense } from '../types'

interface Props {
  expenses: Expense[]
}

export default function InsightsCard({ expenses }: Props) {
  const insights = useMemo(() => {
    const now = new Date()
    const thisMonth = expenses.filter((e) => {
      const d = new Date(e.date)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })

    if (thisMonth.length === 0) return []

    const results: string[] = []

    // Days passed this month
    const daysPassed = now.getDate()
    const totalDaysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const total = thisMonth.reduce((s, e) => s + e.amount, 0)
    const dailyAvg = daysPassed > 0 ? total / daysPassed : 0
    const projected = dailyAvg * totalDaysInMonth

    results.push(`Trung bình ${formatVND(Math.round(dailyAvg))}/ngày`)
    results.push(`Dự kiến cả tháng ~${formatVND(Math.round(projected))}`)

    // Top category
    const catMap: Record<string, number> = {}
    for (const e of thisMonth) catMap[e.category] = (catMap[e.category] || 0) + e.amount
    const topCat = Object.entries(catMap).sort(([, a], [, b]) => b - a)[0]
    if (topCat) results.push(`Chi nhiều nhất: ${topCat[0]} (${formatVND(topCat[1])})`)

    return results
  }, [expenses])

  if (insights.length === 0) return null

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Nhận xét</Text>
      {insights.map((text, i) => (
        <View key={i} style={styles.row}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.text}>{text}</Text>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  card: { ...CARD_STYLE, backgroundColor: '#EEF6E8' },
  title: { fontSize: 14, fontWeight: '600', color: COLORS.ghDark, marginBottom: 8 },
  row: { flexDirection: 'row', gap: 6, marginBottom: 4 },
  bullet: { fontSize: 13, color: COLORS.ghDark, marginTop: 1 },
  text: { flex: 1, fontSize: 13, color: COLORS.text, lineHeight: 20 },
})
