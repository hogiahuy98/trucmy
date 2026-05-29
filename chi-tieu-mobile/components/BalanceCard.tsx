import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { formatVND } from '../utils'
import { COLORS, CARD_STYLE } from './theme'
import type { BalanceSummary } from '../types'

interface Props {
  balance: BalanceSummary
  hasIncome: boolean
  onEditClick: () => void
  onTransferClick: () => void
}

export default function BalanceCard({ balance, hasIncome, onEditClick, onTransferClick }: Props) {
  const remaining = balance.remaining

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Số dư</Text>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn} onPress={onTransferClick}>
            <Ionicons name="swap-horizontal-outline" size={16} color={COLORS.muted} />
            <Text style={styles.actionText}>Chuyển tiền</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={onEditClick}>
            <Ionicons name="pencil-outline" size={16} color={COLORS.muted} />
            <Text style={styles.actionText}>Thu nhập</Text>
          </TouchableOpacity>
        </View>
      </View>

      {!hasIncome ? (
        <TouchableOpacity style={styles.emptyState} onPress={onEditClick}>
          <Ionicons name="add-circle-outline" size={20} color={COLORS.accent} />
          <Text style={styles.emptyText}>Thêm thu nhập tháng này</Text>
        </TouchableOpacity>
      ) : (
        <>
          <Text style={[styles.remaining, { color: remaining >= 0 ? COLORS.success : COLORS.danger }]}>
            {remaining >= 0 ? '+' : ''}{formatVND(remaining)}
          </Text>
          <View style={styles.divider} />
          <View style={styles.personRow}>
            <PersonBalance label="GH" data={balance.byPerson.GH} color={COLORS.gh} />
            <View style={styles.verticalDivider} />
            <PersonBalance label="TM" data={balance.byPerson.TM} color={COLORS.tm} />
          </View>
        </>
      )}
    </View>
  )
}

function PersonBalance({ label, data, color }: { label: string; data: BalanceSummary['byPerson']['GH']; color: string }) {
  return (
    <View style={styles.personBlock}>
      <View style={styles.personHeader}>
        <View style={[styles.dot, { backgroundColor: color }]} />
        <Text style={styles.personLabel}>{label}</Text>
      </View>
      <Text style={styles.personIncome}>+{formatVND(data.income)}</Text>
      <Text style={styles.personExpense}>−{formatVND(data.expenses)}</Text>
      {data.transfers !== 0 && (
        <Text style={[styles.personTransfer, { color: data.transfers > 0 ? COLORS.success : COLORS.danger }]}>
          {data.transfers > 0 ? '↑' : '↓'}{formatVND(Math.abs(data.transfers))}
        </Text>
      )}
      <Text style={[styles.personRemaining, { color: data.remaining >= 0 ? COLORS.success : COLORS.danger }]}>
        = {formatVND(data.remaining)}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: { ...CARD_STYLE },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  actions: { flexDirection: 'row', gap: 10 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: COLORS.cardAlt, borderRadius: 8 },
  actionText: { fontSize: 12, color: COLORS.muted, fontWeight: '500' },
  emptyState: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12, justifyContent: 'center' },
  emptyText: { fontSize: 14, color: COLORS.accent, fontWeight: '500' },
  remaining: { fontSize: 28, fontWeight: '700', marginBottom: 12 },
  divider: { height: 1, backgroundColor: COLORS.border, marginBottom: 12 },
  personRow: { flexDirection: 'row', gap: 0 },
  personBlock: { flex: 1, paddingHorizontal: 4 },
  personHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  personLabel: { fontSize: 13, fontWeight: '600', color: COLORS.text },
  personIncome: { fontSize: 12, color: COLORS.success, marginBottom: 1 },
  personExpense: { fontSize: 12, color: COLORS.danger, marginBottom: 1 },
  personTransfer: { fontSize: 12, marginBottom: 1 },
  personRemaining: { fontSize: 13, fontWeight: '700', marginTop: 2 },
  verticalDivider: { width: 1, backgroundColor: COLORS.border, marginHorizontal: 8 },
})
