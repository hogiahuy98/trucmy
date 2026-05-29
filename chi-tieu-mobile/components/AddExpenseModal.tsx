import React, { useState, useEffect } from 'react'
import {
  Modal, View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView,
  KeyboardAvoidingView, Platform, Pressable,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from './theme'
import { formatAmountInput, parseAmount } from '../utils'
import DatePicker from './DatePicker'
import type { Category, Expense } from '../types'

interface Props {
  open: boolean
  onClose: () => void
  categories: Category[]
  onAdd: (expense: { id: number; amount: number; person: 'GH' | 'TM' | 'Both'; category: string; note?: string | null; date: Date | string }) => Promise<void>
  onUpdate?: (expenseId: number, expense: { amount: number; person: 'GH' | 'TM' | 'Both'; category: string; note?: string | null; date: Date | string }) => Promise<void>
  onAddCategory: (label: string) => Promise<void>
  editExpense?: Expense | null
}

const PERSONS: Array<{ value: 'GH' | 'TM' | 'Both'; label: string; color: string }> = [
  { value: 'GH', label: 'GH', color: COLORS.gh },
  { value: 'TM', label: 'TM', color: COLORS.tm },
  { value: 'Both', label: 'Cả 2', color: COLORS.both },
]

export default function AddExpenseModal({ open, onClose, categories, onAdd, onUpdate, onAddCategory, editExpense }: Props) {
  const [amount, setAmount] = useState('')
  const [person, setPerson] = useState<'GH' | 'TM' | 'Both'>('GH')
  const [category, setCategory] = useState('')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [newCatLabel, setNewCatLabel] = useState('')
  const [showNewCat, setShowNewCat] = useState(false)
  const [loading, setLoading] = useState(false)

  const isEdit = !!editExpense

  useEffect(() => {
    if (editExpense) {
      setAmount(formatAmountInput(String(editExpense.amount)))
      setPerson(editExpense.person)
      setCategory(editExpense.category)
      setNote(editExpense.note || '')
      const d = new Date(editExpense.date)
      setDate(d.toISOString().split('T')[0])
    } else {
      setAmount('')
      setPerson('GH')
      setCategory(categories[0]?.key || '')
      setNote('')
      setDate(new Date().toISOString().split('T')[0])
    }
    setShowNewCat(false)
    setNewCatLabel('')
  }, [editExpense, open])

  useEffect(() => {
    if (!category && categories.length > 0) setCategory(categories[0].key)
  }, [categories])

  const handleSubmit = async () => {
    const amountNum = parseAmount(amount)
    if (!amountNum || amountNum <= 0 || !category) return
    setLoading(true)
    try {
      if (isEdit && editExpense && onUpdate) {
        await onUpdate(editExpense.id, { amount: amountNum, person, category, note: note || null, date })
      } else {
        await onAdd({ id: Date.now(), amount: amountNum, person, category, note: note || null, date })
      }
      onClose()
    } finally {
      setLoading(false)
    }
  }

  const handleAddCategory = async () => {
    if (!newCatLabel.trim()) return
    await onAddCategory(newCatLabel.trim())
    setCategory(newCatLabel.trim().toLowerCase().replace(/\s+/g, '-'))
    setNewCatLabel('')
    setShowNewCat(false)
  }

  return (
    <Modal visible={open} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={COLORS.muted} />
            </TouchableOpacity>
            <Text style={styles.title}>{isEdit ? 'Sửa chi tiêu' : 'Thêm chi tiêu'}</Text>
            <TouchableOpacity onPress={handleSubmit} style={styles.saveBtn} disabled={loading}>
              <Text style={styles.saveBtnText}>{isEdit ? 'Lưu' : 'Thêm'}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Amount */}
            <Text style={styles.label}>Số tiền</Text>
            <View style={styles.amountRow}>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={(t) => setAmount(formatAmountInput(t))}
                placeholder="0"
                keyboardType="number-pad"
                placeholderTextColor={COLORS.muted}
                autoFocus={!isEdit}
              />
              <Text style={styles.amountSuffix}>VND</Text>
            </View>

            {/* Person */}
            <Text style={styles.label}>Người chi</Text>
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
            <Text style={styles.label}>Danh mục</Text>
            <View style={styles.catGrid}>
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
              <TouchableOpacity style={styles.catChip} onPress={() => setShowNewCat(!showNewCat)}>
                <Ionicons name="add" size={14} color={COLORS.muted} />
                <Text style={styles.catChipText}>Thêm</Text>
              </TouchableOpacity>
            </View>
            {showNewCat && (
              <View style={styles.newCatRow}>
                <TextInput
                  style={styles.newCatInput}
                  value={newCatLabel}
                  onChangeText={setNewCatLabel}
                  placeholder="Tên danh mục..."
                  placeholderTextColor={COLORS.muted}
                />
                <TouchableOpacity style={styles.newCatBtn} onPress={handleAddCategory}>
                  <Text style={styles.newCatBtnText}>Thêm</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Note */}
            <Text style={styles.label}>Ghi chú (tuỳ chọn)</Text>
            <TextInput
              style={styles.input}
              value={note}
              onChangeText={setNote}
              placeholder="Ghi chú..."
              placeholderTextColor={COLORS.muted}
            />

            {/* Date */}
            <Text style={styles.label}>Ngày</Text>
            <DatePicker value={date} onChange={setDate} />

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingTop: 20 },
  closeBtn: { padding: 4 },
  title: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  saveBtn: { backgroundColor: COLORS.accent, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  saveBtnText: { fontSize: 15, fontWeight: '700', color: '#FFF' },
  body: { flex: 1, padding: 20 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.muted, marginBottom: 8, marginTop: 16, textTransform: 'uppercase', letterSpacing: 0.5 },
  amountRow: { flexDirection: 'row', alignItems: 'flex-end', borderBottomWidth: 2, borderBottomColor: COLORS.accent, paddingBottom: 8, marginBottom: 4 },
  amountInput: { flex: 1, fontSize: 36, fontWeight: '700', color: COLORS.text },
  amountSuffix: { fontSize: 18, fontWeight: '600', color: COLORS.muted, marginBottom: 6, marginLeft: 8 },
  input: { fontSize: 15, color: COLORS.text, backgroundColor: COLORS.card, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.border },
  personRow: { flexDirection: 'row', gap: 10 },
  personChip: { flex: 1, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center', backgroundColor: COLORS.card },
  personChipText: { fontSize: 14, fontWeight: '500', color: COLORS.muted },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.card },
  catChipText: { fontSize: 13, color: COLORS.muted },
  newCatRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  newCatInput: { flex: 1, fontSize: 14, color: COLORS.text, backgroundColor: COLORS.card, borderRadius: 10, padding: 10, borderWidth: 1, borderColor: COLORS.border },
  newCatBtn: { backgroundColor: COLORS.accent, paddingHorizontal: 14, borderRadius: 10, justifyContent: 'center' },
  newCatBtnText: { fontSize: 14, fontWeight: '600', color: '#FFF' },
})
