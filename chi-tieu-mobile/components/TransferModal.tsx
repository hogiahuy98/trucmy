import React, { useState } from 'react'
import {
  Modal, View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from './theme'
import { formatVND, formatDate, formatAmountInput, parseAmount } from '../utils'
import type { Transfer } from '../types'

interface Props {
  open: boolean
  onClose: () => void
  currentMonthTransfers: Transfer[]
  onAdd: (amount: number, fromPerson: 'GH' | 'TM', toPerson: 'GH' | 'TM', note?: string, date?: Date) => Promise<void>
  onUpdate: (transferId: number, amount: number, fromPerson: 'GH' | 'TM', toPerson: 'GH' | 'TM', note?: string) => Promise<void>
  onDelete: (transferId: number) => Promise<void>
}

export default function TransferModal({ open, onClose, currentMonthTransfers, onAdd, onUpdate, onDelete }: Props) {
  const [amount, setAmount] = useState('')
  const [fromPerson, setFromPerson] = useState<'GH' | 'TM'>('GH')
  const [toPerson, setToPerson] = useState<'GH' | 'TM'>('TM')
  const [note, setNote] = useState('')
  const [editId, setEditId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    const amountNum = parseAmount(amount)
    if (!amountNum || amountNum <= 0 || fromPerson === toPerson) return
    setLoading(true)
    try {
      if (editId) {
        await onUpdate(editId, amountNum, fromPerson, toPerson, note || undefined)
      } else {
        await onAdd(amountNum, fromPerson, toPerson, note || undefined, new Date())
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
    setFromPerson('GH')
    setToPerson('TM')
  }

  const startEdit = (t: Transfer) => {
    setEditId(t.id)
    setAmount(formatAmountInput(String(t.amount)))
    setFromPerson(t.from_person)
    setToPerson(t.to_person)
    setNote(t.note || '')
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

  const PersonSelector = ({ value, onChange, label }: { value: 'GH' | 'TM'; onChange: (v: 'GH' | 'TM') => void; label: string }) => (
    <View style={{ flex: 1 }}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.personRow}>
        {(['GH', 'TM'] as const).map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.personChip, value === p && { backgroundColor: (p === 'GH' ? COLORS.gh : COLORS.tm) + '33', borderColor: p === 'GH' ? COLORS.gh : COLORS.tm }]}
            onPress={() => onChange(p)}
          >
            <Text style={[styles.personChipText, value === p && { color: p === 'GH' ? COLORS.ghDark : COLORS.tmDark, fontWeight: '700' }]}>{p}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )

  return (
    <Modal visible={open} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={COLORS.muted} />
            </TouchableOpacity>
            <Text style={styles.title}>Chuyển tiền</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
            {/* Existing transfers */}
            {currentMonthTransfers.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Tháng này</Text>
                {currentMonthTransfers.map((t) => (
                  <View key={t.id} style={styles.transferRow}>
                    <View style={styles.transferFlow}>
                      <Text style={[styles.flowPerson, { color: t.from_person === 'GH' ? COLORS.ghDark : COLORS.tmDark }]}>{t.from_person}</Text>
                      <Ionicons name="arrow-forward" size={14} color={COLORS.muted} />
                      <Text style={[styles.flowPerson, { color: t.to_person === 'GH' ? COLORS.ghDark : COLORS.tmDark }]}>{t.to_person}</Text>
                    </View>
                    <View style={styles.transferInfo}>
                      <Text style={styles.transferAmount}>{formatVND(t.amount)}</Text>
                      {t.note ? <Text style={styles.transferNote}>{t.note}</Text> : null}
                      <Text style={styles.transferDate}>{formatDate(t.date)}</Text>
                    </View>
                    <TouchableOpacity onPress={() => startEdit(t)} style={styles.actionBtn}>
                      <Ionicons name="pencil-outline" size={16} color={COLORS.muted} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(t.id)} style={styles.actionBtn}>
                      <Ionicons name="trash-outline" size={16} color={COLORS.danger} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Form */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{editId ? 'Sửa chuyển tiền' : 'Chuyển tiền mới'}</Text>
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
              <View style={styles.personPairRow}>
                <PersonSelector value={fromPerson} onChange={setFromPerson} label="Từ" />
                <Ionicons name="arrow-forward-circle" size={24} color={COLORS.muted} style={{ marginTop: 28 }} />
                <PersonSelector value={toPerson} onChange={setToPerson} label="Đến" />
              </View>
              {fromPerson === toPerson && (
                <Text style={styles.errorText}>Người chuyển và người nhận không được giống nhau</Text>
              )}
              <Text style={styles.label}>Ghi chú (tuỳ chọn)</Text>
              <TextInput
                style={styles.input}
                value={note}
                onChangeText={setNote}
                placeholder="Ghi chú..."
                placeholderTextColor={COLORS.muted}
              />
              <View style={styles.btnRow}>
                {editId && (
                  <TouchableOpacity style={styles.cancelBtn} onPress={resetForm}>
                    <Text style={styles.cancelBtnText}>Huỷ</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.saveBtn, fromPerson === toPerson && { opacity: 0.5 }]}
                  onPress={handleSave}
                  disabled={loading || fromPerson === toPerson}
                >
                  <Text style={styles.saveBtnText}>{editId ? 'Lưu' : 'Chuyển'}</Text>
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
  transferRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  transferFlow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  flowPerson: { fontSize: 13, fontWeight: '700' },
  transferInfo: { flex: 1, marginLeft: 4 },
  transferAmount: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  transferNote: { fontSize: 12, color: COLORS.muted },
  transferDate: { fontSize: 11, color: COLORS.muted },
  actionBtn: { padding: 6, borderRadius: 8, backgroundColor: COLORS.cardAlt },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.muted, marginBottom: 8, marginTop: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { fontSize: 15, color: COLORS.text, backgroundColor: COLORS.cardAlt, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.border },
  amountRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.cardAlt, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 14 },
  amountInput: { flex: 1, fontSize: 15, color: COLORS.text, paddingVertical: 14 },
  amountSuffix: { fontSize: 14, fontWeight: '600', color: COLORS.muted, marginLeft: 8 },
  personPairRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-end' },
  personRow: { flexDirection: 'row', gap: 8 },
  personChip: { flex: 1, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center', backgroundColor: COLORS.cardAlt },
  personChipText: { fontSize: 14, fontWeight: '500', color: COLORS.muted },
  errorText: { fontSize: 12, color: COLORS.danger, marginTop: 6 },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  cancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: COLORS.cardAlt, alignItems: 'center' },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: COLORS.muted },
  saveBtn: { flex: 2, paddingVertical: 12, borderRadius: 12, backgroundColor: COLORS.accent, alignItems: 'center' },
  saveBtnText: { fontSize: 15, fontWeight: '700', color: '#FFF' },
})
