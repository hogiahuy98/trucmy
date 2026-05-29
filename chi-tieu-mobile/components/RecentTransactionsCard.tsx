import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { formatVND, formatDate } from '../utils'
import { COLORS, CARD_STYLE, PERSON_COLORS, PERSON_LABELS } from './theme'
import type { Expense, Category } from '../types'

interface Props {
  expenses: Expense[]
  categories: Category[]
  onDelete: (id: number) => void
  onEdit?: (expense: Expense) => void
}

export default function RecentTransactionsCard({ expenses, categories, onDelete, onEdit }: Props) {
  const recent = expenses.slice(0, 10)

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Giao dịch gần đây</Text>
      {recent.length === 0 ? (
        <Text style={styles.empty}>Chưa có giao dịch nào</Text>
      ) : (
        recent.map((expense) => {
          const cat = categories.find((c) => c.key === expense.category)
          const color = cat?.color || '#94A3B8'
          const label = cat?.label || expense.category
          const personColor = PERSON_COLORS[expense.person] || COLORS.muted

          return (
            <View key={expense.id} style={styles.row}>
              <View style={[styles.catDot, { backgroundColor: color + '33', borderColor: color }]}>
                <View style={[styles.catDotInner, { backgroundColor: color }]} />
              </View>
              <View style={styles.info}>
                <Text style={styles.category}>{label}</Text>
                {expense.note ? <Text style={styles.note} numberOfLines={1}>{expense.note}</Text> : null}
                <Text style={styles.date}>{formatDate(expense.date)}</Text>
              </View>
              <View style={styles.right}>
                <Text style={styles.amount}>{formatVND(expense.amount)}</Text>
                <View style={[styles.personBadge, { backgroundColor: personColor + '22' }]}>
                  <Text style={[styles.personText, { color: personColor }]}>{PERSON_LABELS[expense.person]}</Text>
                </View>
              </View>
              <View style={styles.actions}>
                {onEdit && (
                  <TouchableOpacity onPress={() => onEdit(expense)} style={styles.actionBtn}>
                    <Ionicons name="pencil-outline" size={14} color={COLORS.muted} />
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => onDelete(expense.id)} style={styles.actionBtn}>
                  <Ionicons name="trash-outline" size={14} color={COLORS.danger} />
                </TouchableOpacity>
              </View>
            </View>
          )
        })
      )}
      {expenses.length > 10 && (
        <Text style={styles.more}>+{expenses.length - 10} giao dịch khác trong tháng</Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card: { ...CARD_STYLE },
  title: { fontSize: 15, fontWeight: '600', color: COLORS.text, marginBottom: 12 },
  empty: { fontSize: 13, color: COLORS.muted, fontStyle: 'italic', paddingVertical: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  catDot: { width: 32, height: 32, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  catDotInner: { width: 10, height: 10, borderRadius: 5 },
  info: { flex: 1 },
  category: { fontSize: 13, fontWeight: '600', color: COLORS.text },
  note: { fontSize: 12, color: COLORS.muted, marginTop: 1 },
  date: { fontSize: 11, color: COLORS.muted, marginTop: 1 },
  right: { alignItems: 'flex-end', gap: 4 },
  amount: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  personBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  personText: { fontSize: 10, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 4 },
  actionBtn: { padding: 6, borderRadius: 8, backgroundColor: COLORS.cardAlt },
  more: { fontSize: 12, color: COLORS.muted, marginTop: 10, textAlign: 'center' },
})
