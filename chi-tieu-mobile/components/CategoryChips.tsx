import React from 'react'
import { ScrollView, View, Text, StyleSheet } from 'react-native'
import { formatVND } from '../utils'
import { COLORS } from './theme'
import type { Category } from '../types'

interface Props {
  chartData: Record<string, number>
  categories: Category[]
  total: number
}

export default function CategoryChips({ chartData, categories, total }: Props) {
  const entries = Object.entries(chartData)
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a)

  if (entries.length === 0) return null

  return (
    <View>
      <Text style={styles.title}>Theo danh mục</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll} contentContainerStyle={styles.content}>
        {entries.map(([key, value]) => {
          const cat = categories.find((c) => c.key === key)
          const color = cat?.color || '#94A3B8'
          const label = cat?.label || key
          const pct = total > 0 ? Math.round((value / total) * 100) : 0
          return (
            <View key={key} style={[styles.chip, { borderColor: color + '44', backgroundColor: color + '18' }]}>
              <View style={[styles.dot, { backgroundColor: color }]} />
              <View>
                <Text style={styles.chipLabel}>{label}</Text>
                <Text style={styles.chipAmount}>{formatVND(value)}</Text>
                <Text style={[styles.chipPct, { color }]}>{pct}%</Text>
              </View>
            </View>
          )
        })}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  title: { fontSize: 15, fontWeight: '600', color: COLORS.text, marginBottom: 10 },
  scroll: {},
  content: { gap: 10, paddingRight: 4 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 110,
  },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 2 },
  chipLabel: { fontSize: 12, color: COLORS.text, fontWeight: '500' },
  chipAmount: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  chipPct: { fontSize: 11, fontWeight: '500', marginTop: 1 },
})
