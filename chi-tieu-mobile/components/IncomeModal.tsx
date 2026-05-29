import React, { useState } from 'react'
import {
  Modal, View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from './theme'
import { formatVND, formatAmountInput, parseAmount } from '../utils'
import type { Income } from '../types'

interface Props {
  open: boolean
  onClose: () => void
  currentMonthIncomes: Income[]
  onAdd: (month: number, year: number, value: number, byPerson: 'GH' | 'TM', note?: string) => Promise<void>
  onUpdate: (incomeId: number, value: number, byPerson: 'GH' | 'TM', note?: string) => Promise<void>
  onDelete: (incomeId: number) => Promise<void>
}

export default function IncomeModal({ open, onClose, currentMonthIncomes, onAdd, onUpdate, onDelete }: Props) {
  const [amount, setAmount] = useState('')
  const [person, setPerson] = useState<'GH' | 'TM'>('GH')
  const [note, setNote] = useState('')
  const [editId, setEditId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  const now = new Date()

  const handleSave = async () => {
    const amountNum = parseAmount(amount)
    if (!amountNum || amountNum <= 0) return
    setLoading(true)
    try {
      if (editId) {
        await onUpdate(editId, amountNum, person, note || undefined)
      } else {
        await onAdd(now.getMonth(), now.getFullYear(), amountNum, person, note || undefined)
      }
      resetForm()
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setAmount('')
    setNote('')
    setEditId(null)
    setPerson('GH')
  }

  const startEdit = (income: Income) => {
    setEditId(income.id)
    setAmount(formatAmountInput(String(income.value)))
    setPerson(income.by_person)
    setNote(income.note || '')
  }

  const handleDelete = async (id: number) => {
    setLoading(true)
    try {
      await onDelete(id)
      if (editId === id) resetForm()
    } finally {
      setLoading(false)
    }
  }

  const monthName = now.toLocaleString('vi-VN', { month: 'long', year: 'numeric' })

  return (
    <Modal visible={open} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={COLORS.muted} />
            </TouchableOpacity>
            <Text style={styles.title}>Thu nhập {monthName}</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
            {/* Existing incomes */}
            {currentMonthIncomes.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Đã nhập</Text>
                {currentMonthIncomes.map((inc) => (
                  <View key={inc.id} style={styles.incomeRow}>
                    <View style={[styles.personTag, { backgroundColor: inc.by_person === 'GH' ? COLORS.gh + '22' : COLORS.tm + '22' }]}>
                      <Text style={[styles.personTagText, { color: inc.by_person === 'GH' ? COLORS.ghDark : COLORS.tmDark }]}>{inc.by_person}</Text>
                    </View>
                    <View style={styles.incomeInfo}>
                      <Text style={styles.incomeAmount}>{formatVND(inc.value)}</Text>
                      {inc.note ? <Text style={styles.incomeNote}>{inc.note}</Text> : null}
                    </View>
                    <TouchableOpacity onPress={() => startEdit(inc)} style={styles.actionBtn}>
                      <Ionicons name="pencil-outline" size={16} color={COLORS.muted} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(inc.id)} style={styles.actionBtn}>
                      <Ionicons name="trash-outline" size={16} color={COLORS.danger} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Add/Edit form */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{editId ? 'Sửa thu nhập' : 'Thêm thu nhập'}</Text>
              <Text style={styles.label}>Số tiền</Text>
              <View style={styles.amountRow}>
                <TextInput
                  style={styles.amountInput}
                  value={amount}
                  onChangeText={(t) => setAmount(formatAmountInput(t))}
                  placeholder="0"
                  keyboardType="number-pad"
                  placeholderTextColor={COLORS.muted}
                />
                <Text style={styles.amountSuffix}>VND</Text>
              </View>
              <Text style={styles.label}>Người</Text>
              <View style={styles.personRow}>
                {(['GH', 'TM'] as const).map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[styles.personChip, person === p && { backgroundColor: (p === 'GH' ? COLORS.gh : COLORS.tm) + '33', borderColor: p === 'GH' ? COLORS.gh : COLORS.tm }]}
                    onPress={() => setPerson(p)}
                  >
                    <Text style={[styles.personChipText, person === p && { color: p === 'GH' ? COLORS.ghDark : COLORS.tmDark, fontWeight: '700' }]}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.label}>Ghi chú (tuỳ chọn)</Text>
              <TextInput
                style={styles.input}
                value={note}
                onChangeText={setNote}
                placeholder="Lương, thưởng..."
                placeholderTextColor={COLORS.muted}
              />
              <View style={styles.btnRow}>
                {editId && (
                  <TouchableOpacity style={styles.cancelBtn} onPress={resetForm}>
                    <Text style={styles.cancelBtnText}>Huỷ</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
                  <Text style={styles.saveBtnText}>{editId ? 'Lưu' : 'Thêm'}</Text>
                </TouchableOpacity>
              </View>
            </View>

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
  body: { flex: 1, padding: 20 },
  section: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  incomeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  personTag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  personTagText: { fontSize: 12, fontWeight: '700' },
  incomeInfo: { flex: 1 },
  incomeAmount: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  incomeNote: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  actionBtn: { padding: 6, borderRadius: 8, backgroundColor: COLORS.cardAlt },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.muted, marginBottom: 8, marginTop: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { fontSize: 15, color: COLORS.text, backgroundColor: COLORS.cardAlt, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.border },
  amountRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.cardAlt, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 14 },
  amountInput: { flex: 1, fontSize: 15, color: COLORS.text, paddingVertical: 14 },
  amountSuffix: { fontSize: 14, fontWeight: '600', color: COLORS.muted, marginLeft: 8 },
  personRow: { flexDirection: 'row', gap: 10 },
  personChip: { flex: 1, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center', backgroundColor: COLORS.cardAlt },
  personChipText: { fontSize: 14, fontWeight: '500', color: COLORS.muted },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  cancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: COLORS.cardAlt, alignItems: 'center' },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: COLORS.muted },
  saveBtn: { flex: 2, paddingVertical: 12, borderRadius: 12, backgroundColor: COLORS.accent, alignItems: 'center' },
  saveBtnText: { fontSize: 15, fontWeight: '700', color: '#FFF' },
})
