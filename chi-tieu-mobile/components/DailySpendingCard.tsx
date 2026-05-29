import React, { useMemo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { formatVND, formatDateShort } from '../utils'
import { COLORS, CARD_STYLE, PERSON_COLORS, PERSON_LABELS } from './theme'
import type { Expense } from '../types'

interface Props {
  expenses: Expense[]
}

export default function DailySpendingCard({ expenses }: Props) {
  const today = new Date()

  const todayExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const d = new Date(e.date)
      return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()
    })
  }, [expenses])

  const yesterdayExpenses = useMemo(() => {
    const y = new Date(today)
    y.setDate(y.getDate() - 1)
    return expenses.filter((e) => {
      const d = new Date(e.date)
      return d.getDate() === y.getDate() && d.getMonth() === y.getMonth() && d.getFullYear() === y.getFullYear()
    })
  }, [expenses])

  const todayTotal = todayExpenses.reduce((s, e) => s + e.amount, 0)
  const yesterdayTotal = yesterdayExpenses.reduce((s, e) => s + e.amount, 0)

  const renderItems = (items: Expense[]) => (
    items.slice(0, 3).map((e) => (
      <View key={e.id} style={styles.item}>
        <View style={[styles.personBadge, { backgroundColor: (PERSON_COLORS[e.person] || COLORS.muted) + '22' }]}>
          <Text style={[styles.personText, { color: PERSON_COLORS[e.person] || COLORS.muted }]}>
            {PERSON_LABELS[e.person]}
          </Text>
        </View>
        <Text style={styles.itemNote} numberOfLines={1}>{e.note || e.category}</Text>
        <Text style={styles.itemAmount}>{formatVND(e.amount)}</Text>
      </View>
    ))
  )

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Chi tiêu hôm nay</Text>
      {todayExpenses.length === 0 ? (
        <Text style={styles.empty}>Chưa có chi tiêu hôm nay</Text>
      ) : (
        <>
          <Text style={styles.dayTotal}>{formatVND(todayTotal)}</Text>
          <View style={styles.items}>{renderItems(todayExpenses)}</View>
          {todayExpenses.length > 3 && (
            <Text style={styles.more}>+{todayExpenses.length - 3} giao dịch khác</Text>
          )}
        </>
      )}

      {yesterdayExpenses.length > 0 && (
        <>
          <View style={styles.divider} />
          <Text style={styles.subTitle}>Hôm qua — {formatVND(yesterdayTotal)}</Text>
          <View style={styles.items}>{renderItems(yesterdayExpenses)}</View>
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card: { ...CARD_STYLE },
  title: { fontSize: 15, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  empty: { fontSize: 13, color: COLORS.muted, fontStyle: 'italic', paddingVertical: 8 },
  dayTotal: { fontSize: 22, fontWeight: '700', color: COLORS.text, marginBottom: 10 },
  items: { gap: 6 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  personBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  personText: { fontSize: 11, fontWeight: '600' },
  itemNote: { flex: 1, fontSize: 13, color: COLORS.text },
  itemAmount: { fontSize: 13, fontWeight: '600', color: COLORS.text },
  more: { fontSize: 12, color: COLORS.muted, marginTop: 6 },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 12 },
  subTitle: { fontSize: 13, fontWeight: '500', color: COLORS.muted, marginBottom: 8 },
})
