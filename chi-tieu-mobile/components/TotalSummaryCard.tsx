import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { formatVND } from '../utils'
import { COLORS, CARD_STYLE } from './theme'

interface Props {
  total: number
  ghAmount: number
  tmAmount: number
  ghPct: number
  tmPct: number
}

export default function TotalSummaryCard({ total, ghAmount, tmAmount, ghPct, tmPct }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>Tháng này chi</Text>
      <Text style={styles.total}>{formatVND(total)}</Text>
      <View style={styles.bar}>
        <View style={[styles.barGH, { flex: ghPct || 1 }]} />
        <View style={[styles.barTM, { flex: tmPct || 1 }]} />
      </View>
      <View style={styles.row}>
        <View style={styles.personBlock}>
          <View style={[styles.dot, { backgroundColor: COLORS.gh }]} />
          <Text style={styles.personLabel}>GH</Text>
          <Text style={styles.personAmount}>{formatVND(ghAmount)}</Text>
          <Text style={styles.personPct}>{ghPct}%</Text>
        </View>
        <View style={styles.personBlock}>
          <View style={[styles.dot, { backgroundColor: COLORS.tm }]} />
          <Text style={styles.personLabel}>TM</Text>
          <Text style={styles.personAmount}>{formatVND(tmAmount)}</Text>
          <Text style={styles.personPct}>{tmPct}%</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    ...CARD_STYLE,
    backgroundColor: COLORS.cardAlt,
  },
  label: {
    fontSize: 13,
    color: COLORS.muted,
    marginBottom: 4,
    fontWeight: '500',
  },
  total: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  bar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: '#E5E7EB',
  },
  barGH: {
    backgroundColor: COLORS.gh,
    borderRadius: 4,
  },
  barTM: {
    backgroundColor: COLORS.tm,
    borderRadius: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 20,
  },
  personBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  personLabel: {
    fontSize: 13,
    color: COLORS.muted,
    fontWeight: '500',
  },
  personAmount: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '600',
  },
  personPct: {
    fontSize: 12,
    color: COLORS.muted,
  },
})
