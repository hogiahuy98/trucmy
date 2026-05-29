import React, { useState, useEffect } from 'react'
import { Modal, View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from './theme'
import { formatAmountInput, parseAmount } from '../utils'
import { useFinanceStore } from '../store/finance'

interface Props {
  open: boolean
  onClose: () => void
  onOpenFullModal: () => void
}

const QUICK_AMOUNTS = [10000, 20000, 30000, 50000, 100000, 200000]
const formatQuick = (n: number) => n >= 1000 ? `${(n / 1000).toLocaleString('vi-VN')}k` : String(n)
const PERSONS: Array<{ value: 'GH' | 'TM' | 'Both'; label: string; color: string }> = [
  { value: 'GH', label: 'GH', color: COLORS.gh },
  { value: 'TM', label: 'TM', color: COLORS.tm },
  { value: 'Both', label: 'Cả 2', color: COLORS.both },
]

export default function QuickAddExpense({ open, onClose, onOpenFullModal }: Props) {
  const categories = useFinanceStore((s) => s.categories)
  const addExpense = useFinanceStore((s) => s.addExpense)

  const [amount, setAmount] = useState('')
  const [person, setPerson] = useState<'GH' | 'TM' | 'Both'>('GH')
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setAmount('')
      setCategory(categories[0]?.key || '')
    }
  }, [open])

  const handleQuickAdd = async () => {
    const amountNum = parseAmount(amount)
    if (!amountNum || !category) return
    setLoading(true)
    try {
      await addExpense({ id: Date.now(), amount: amountNum, person, category, note: null, date: new Date() })
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />

          <View style={styles.headerRow}>
            <Text style={styles.title}>Thêm nhanh</Text>
            <TouchableOpacity onPress={onOpenFullModal} style={styles.fullBtn}>
              <Ionicons name="expand-outline" size={16} color={COLORS.muted} />
              <Text style={styles.fullBtnText}>Đầy đủ</Text>
            </TouchableOpacity>
          </View>

          {/* Quick amounts */}
          <View style={styles.quickAmounts}>
            {QUICK_AMOUNTS.map((a) => (
              <TouchableOpacity
                key={a}
                style={[styles.quickChip, amount === String(a) && styles.quickChipActive]}
              onPress={() => setAmount(formatAmountInput(String(a)))}
            >
              <Text style={[styles.quickChipText, amount === formatAmountInput(String(a)) && styles.quickChipTextActive]}>
                {formatQuick(a)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Amount input */}
          <View style={styles.amountRow}>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={(t) => setAmount(formatAmountInput(t))}
              placeholder="Số tiền khác..."
              keyboardType="number-pad"
              placeholderTextColor={COLORS.muted}
            />
            <Text style={styles.amountSuffix}>VND</Text>
          </View>

          {/* Person */}
          <View style={styles.personRow}>
            {PERSONS.map((p) => (
              <TouchableOpacity
                key={p.value}
                style={[styles.personChip, person === p.value && { backgroundColor: p.color + '33', borderColor: p.color }]}
                onPress={() => setPerson(p.value)}
              >
                <Text style={[styles.personChipText, person === p.value && { color: p.color, fontWeight: '700' }]}>
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Category */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll} contentContainerStyle={{ gap: 8 }}>
            {categories.filter(c => !c.disabled).map((c) => (
              <TouchableOpacity
                key={c.key}
                style={[styles.catChip, category === c.key && { backgroundColor: c.color + '33', borderColor: c.color }]}
                onPress={() => setCategory(c.key)}
              >
                <Text style={[styles.catChipText, category === c.key && { color: c.color, fontWeight: '700' }]}>
                  {c.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.addBtn} onPress={handleQuickAdd} disabled={loading || !amount || !category}>
            <Text style={styles.addBtnText}>Thêm</Text>
          </TouchableOpacity>

          <View style={{ height: 20 }} />
        </Pressable>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.3)' },
  sheet: { backgroundColor: COLORS.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingTop: 12 },
  handle: { width: 40, height: 4, backgroundColor: COLORS.border, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  fullBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 6, backgroundColor: COLORS.cardAlt, borderRadius: 8 },
  fullBtnText: { fontSize: 13, color: COLORS.muted, fontWeight: '500' },
  quickAmounts: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  quickChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.card },
  quickChipActive: { backgroundColor: COLORS.accent + '33', borderColor: COLORS.accent },
  quickChipText: { fontSize: 14, color: COLORS.muted, fontWeight: '500' },
  quickChipTextActive: { color: COLORS.ghDark, fontWeight: '700' },
  amountRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 12, marginBottom: 12 },
  amountInput: { flex: 1, fontSize: 20, fontWeight: '600', color: COLORS.text, paddingVertical: 12 },
  amountSuffix: { fontSize: 15, fontWeight: '600', color: COLORS.muted, marginLeft: 8 },
  personRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  personChip: { flex: 1, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center', backgroundColor: COLORS.card },
  personChipText: { fontSize: 14, fontWeight: '500', color: COLORS.muted },
  catScroll: { marginBottom: 16 },
  catChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.card },
  catChipText: { fontSize: 13, color: COLORS.muted },
  addBtn: { backgroundColor: COLORS.accent, paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  addBtnText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
})
