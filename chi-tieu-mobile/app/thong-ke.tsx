import React, { useMemo, useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  ActivityIndicator, Modal, Pressable,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import dayjs from 'dayjs'
import 'dayjs/locale/vi'
import isoWeek from 'dayjs/plugin/isoWeek'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import { useFinanceStore } from '../store/finance'
import AddExpenseModal from '../components/AddExpenseModal'
import ConfirmModal from '../components/ConfirmModal'
import DatePicker from '../components/DatePicker'
import { COLORS, PERSON_COLORS, PERSON_LABELS } from '../components/theme'
import { formatVND, formatDate } from '../utils'
import type { Expense } from '../types'

dayjs.extend(isoWeek)
dayjs.extend(weekOfYear)
dayjs.locale('vi')

const PERSON_OPTIONS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'GH', label: 'GH' },
  { value: 'TM', label: 'TM' },
  { value: 'Both', label: 'Cả 2' },
]

interface WeeklyRow {
  key: string
  weekLabel: string
  total: number
  GH: number
  TM: number
  Both: number
  count: number
}

export default function ThongKeScreen() {
  const expenses = useFinanceStore((s) => s.expenses)
  const categories = useFinanceStore((s) => s.categories)
  const deleteExpense = useFinanceStore((s) => s.deleteExpense)
  const updateExpense = useFinanceStore((s) => s.updateExpense)
  const addExpense = useFinanceStore((s) => s.addExpense)
  const addCategory = useFinanceStore((s) => s.addCategory)
  const initialize = useFinanceStore((s) => s.initialize)
  const isLoading = useFinanceStore((s) => s.isLoading)

  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [hasInitialized, setHasInitialized] = useState(false)

  // Filters
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedPerson, setSelectedPerson] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchText, setSearchText] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 20

  // Modals
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null)

  // Filter picker modals
  const [personPickerOpen, setPersonPickerOpen] = useState(false)
  const [catPickerOpen, setCatPickerOpen] = useState(false)

  useEffect(() => {
    const init = async () => {
      setHasInitialized(true)
      await initialize()
    }
    init()
  }, [])

  useEffect(() => {
    if (hasInitialized && !isLoading && isInitialLoad) setIsInitialLoad(false)
  }, [hasInitialized, isLoading, isInitialLoad])

  const filteredExpenses = useMemo(() => {
    let filtered = [...expenses]
    if (startDate) {
      const start = dayjs(startDate).startOf('day')
      filtered = filtered.filter((e) => dayjs(e.date).isAfter(start) || dayjs(e.date).isSame(start))
    }
    if (endDate) {
      const end = dayjs(endDate).endOf('day')
      filtered = filtered.filter((e) => dayjs(e.date).isBefore(end) || dayjs(e.date).isSame(end))
    }
    if (selectedPerson !== 'all') filtered = filtered.filter((e) => e.person === selectedPerson)
    if (selectedCategory !== 'all') filtered = filtered.filter((e) => e.category === selectedCategory)
    if (searchText) {
      const lower = searchText.toLowerCase()
      filtered = filtered.filter((e) => {
        const note = (e.note || '').toLowerCase()
        const cat = categories.find((c) => c.key === e.category)
        const catLabel = (cat?.label || e.category).toLowerCase()
        return note.includes(lower) || catLabel.includes(lower)
      })
    }
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [expenses, startDate, endDate, selectedPerson, selectedCategory, searchText, categories])

  const totals = useMemo(() => {
    const total = filteredExpenses.reduce((s, e) => s + e.amount, 0)
    const byPerson = filteredExpenses.reduce((acc, e) => {
      if (e.person === 'GH') acc.GH += e.amount
      else if (e.person === 'TM') acc.TM += e.amount
      else if (e.person === 'Both') acc.Both += e.amount
      return acc
    }, { GH: 0, TM: 0, Both: 0 })
    return { total, byPerson }
  }, [filteredExpenses])

  const weeklyRows: WeeklyRow[] = useMemo(() => {
    const weekMap = new Map<string, WeeklyRow>()
    for (const e of filteredExpenses) {
      const d = dayjs(e.date)
      const start = d.startOf('week')
      const end_ = d.endOf('week')
      const key = start.format('YYYY-[W]ww')
      if (!weekMap.has(key)) {
        weekMap.set(key, {
          key,
          weekLabel: `${start.format('DD/MM')} - ${end_.format('DD/MM')}`,
          total: 0, GH: 0, TM: 0, Both: 0, count: 0,
        })
      }
      const row = weekMap.get(key)!
      row.total += e.amount
      row.count += 1
      if (e.person === 'GH') row.GH += e.amount
      else if (e.person === 'TM') row.TM += e.amount
      else if (e.person === 'Both') row.Both += e.amount
    }
    return Array.from(weekMap.values()).sort((a, b) => b.key.localeCompare(a.key))
  }, [filteredExpenses])

  const paginatedExpenses = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredExpenses.slice(start, start + pageSize)
  }, [filteredExpenses, currentPage])

  const totalPages = Math.ceil(filteredExpenses.length / pageSize)

  const handleReset = () => {
    setStartDate(''); setEndDate(''); setSelectedPerson('all')
    setSelectedCategory('all'); setSearchText(''); setCurrentPage(1)
  }

  const handleDelete = (expense: Expense) => {
    setExpenseToDelete(expense)
    setConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (!expenseToDelete) return
    await deleteExpense(expenseToDelete.id)
    setExpenseToDelete(null)
  }

  const handleEdit = (expense: Expense) => {
    setExpenseToEdit(expense)
    setEditModalOpen(true)
  }

  if (isInitialLoad && (isLoading || !hasInitialized)) {
    return (
      <SafeAreaView style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </SafeAreaView>
    )
  }

  const activeFilters = [
    startDate || endDate,
    selectedPerson !== 'all',
    selectedCategory !== 'all',
    searchText,
  ].filter(Boolean).length

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Summary Cards */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.summaryScroll} contentContainerStyle={{ gap: 10 }}>
          <SummaryCard label="Tổng chi" value={formatVND(totals.total)} color={COLORS.text} />
          <SummaryCard label="GH" value={formatVND(totals.byPerson.GH)} color={COLORS.ghDark} />
          <SummaryCard label="TM" value={formatVND(totals.byPerson.TM)} color={COLORS.tmDark} />
          <SummaryCard label="Cả 2" value={formatVND(totals.byPerson.Both)} color={COLORS.both} />
        </ScrollView>

        {/* Filters */}
        <View style={styles.filterCard}>
          <View style={styles.filterHeader}>
            <Text style={styles.filterTitle}>Bộ lọc {activeFilters > 0 ? `(${activeFilters})` : ''}</Text>
            {activeFilters > 0 && (
              <TouchableOpacity onPress={handleReset} style={styles.resetBtn}>
                <Ionicons name="refresh-outline" size={14} color={COLORS.muted} />
                <Text style={styles.resetText}>Đặt lại</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Search */}
          <View style={styles.searchRow}>
            <Ionicons name="search-outline" size={16} color={COLORS.muted} />
            <TextInput
              style={styles.searchInput}
              value={searchText}
              onChangeText={(t) => { setSearchText(t); setCurrentPage(1) }}
              placeholder="Tìm trong ghi chú, danh mục..."
              placeholderTextColor={COLORS.muted}
            />
            {searchText ? (
              <TouchableOpacity onPress={() => setSearchText('')}>
                <Ionicons name="close-circle" size={16} color={COLORS.muted} />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Date range */}
          <View style={styles.dateRow}>
            <View style={styles.dateField}>
              <Text style={styles.dateLabel}>Từ ngày</Text>
              <DatePicker value={startDate} onChange={(v) => { setStartDate(v); setCurrentPage(1) }} placeholder="Tất cả" />
            </View>
            <View style={styles.dateField}>
              <Text style={styles.dateLabel}>Đến ngày</Text>
              <DatePicker value={endDate} onChange={(v) => { setEndDate(v); setCurrentPage(1) }} placeholder="Tất cả" />
            </View>
          </View>

          {/* Person & Category pickers */}
          <View style={styles.pickerRow}>
            <TouchableOpacity style={styles.picker} onPress={() => setPersonPickerOpen(true)}>
              <Text style={styles.pickerText}>{PERSON_OPTIONS.find(p => p.value === selectedPerson)?.label || 'Tất cả'}</Text>
              <Ionicons name="chevron-down" size={14} color={COLORS.muted} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.picker} onPress={() => setCatPickerOpen(true)}>
              <Text style={styles.pickerText} numberOfLines={1}>{selectedCategory === 'all' ? 'Danh mục' : categories.find(c => c.key === selectedCategory)?.label || selectedCategory}</Text>
              <Ionicons name="chevron-down" size={14} color={COLORS.muted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Weekly stats */}
        {weeklyRows.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Theo tuần</Text>
            {weeklyRows.map((row) => (
              <View key={row.key} style={styles.weekRow}>
                <Text style={styles.weekLabel}>{row.weekLabel}</Text>
                <View style={styles.weekAmounts}>
                  <Text style={styles.weekTotal}>{formatVND(row.total)}</Text>
                  <Text style={styles.weekCount}>{row.count} gd</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Transactions list */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Giao dịch ({filteredExpenses.length}/{expenses.length})
          </Text>
          {paginatedExpenses.map((expense) => {
            const cat = categories.find((c) => c.key === expense.category)
            const catLabel = cat?.label || expense.category
            const catColor = cat?.color || '#94A3B8'
            const personColor = PERSON_COLORS[expense.person] || COLORS.muted

            return (
              <View key={expense.id} style={styles.expenseRow}>
                <View style={[styles.catDot, { backgroundColor: catColor + '33' }]}>
                  <View style={[styles.catDotInner, { backgroundColor: catColor }]} />
                </View>
                <View style={styles.expenseInfo}>
                  <Text style={styles.expenseCat}>{catLabel}</Text>
                  {expense.note ? <Text style={styles.expenseNote} numberOfLines={1}>{expense.note}</Text> : null}
                  <Text style={styles.expenseDate}>{formatDate(expense.date)}</Text>
                </View>
                <View style={styles.expenseRight}>
                  <Text style={styles.expenseAmount}>{formatVND(expense.amount)}</Text>
                  <View style={[styles.personBadge, { backgroundColor: personColor + '22' }]}>
                    <Text style={[styles.personBadgeText, { color: personColor }]}>{PERSON_LABELS[expense.person]}</Text>
                  </View>
                </View>
                <View style={styles.rowActions}>
                  <TouchableOpacity onPress={() => handleEdit(expense)} style={styles.rowActionBtn}>
                    <Ionicons name="pencil-outline" size={14} color={COLORS.muted} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(expense)} style={styles.rowActionBtn}>
                    <Ionicons name="trash-outline" size={14} color={COLORS.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            )
          })}

          {/* Pagination */}
          {totalPages > 1 && (
            <View style={styles.pagination}>
              <TouchableOpacity
                style={[styles.pageBtn, currentPage === 1 && styles.pageBtnDisabled]}
                onPress={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <Ionicons name="chevron-back" size={16} color={currentPage === 1 ? COLORS.border : COLORS.text} />
              </TouchableOpacity>
              <Text style={styles.pageText}>{currentPage} / {totalPages}</Text>
              <TouchableOpacity
                style={[styles.pageBtn, currentPage === totalPages && styles.pageBtnDisabled]}
                onPress={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <Ionicons name="chevron-forward" size={16} color={currentPage === totalPages ? COLORS.border : COLORS.text} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Person picker modal */}
      <PickerModal
        open={personPickerOpen}
        onClose={() => setPersonPickerOpen(false)}
        title="Người chi"
        options={PERSON_OPTIONS}
        value={selectedPerson}
        onChange={(v) => { setSelectedPerson(v); setCurrentPage(1) }}
      />

      {/* Category picker modal */}
      <PickerModal
        open={catPickerOpen}
        onClose={() => setCatPickerOpen(false)}
        title="Danh mục"
        options={[{ value: 'all', label: 'Tất cả' }, ...categories.map(c => ({ value: c.key, label: c.label }))]}
        value={selectedCategory}
        onChange={(v) => { setSelectedCategory(v); setCurrentPage(1) }}
      />

      <ConfirmModal
        open={confirmOpen}
        onClose={() => { setConfirmOpen(false); setExpenseToDelete(null) }}
        onConfirm={confirmDelete}
        title="Xác nhận xóa"
        description={expenseToDelete ? `Xóa chi tiêu ${formatVND(expenseToDelete.amount)} (${categories.find(c => c.key === expenseToDelete!.category)?.label || expenseToDelete.category})?` : ''}
        confirmText="Xóa"
        variant="danger"
      />

      <AddExpenseModal
        open={editModalOpen}
        onClose={() => { setEditModalOpen(false); setExpenseToEdit(null) }}
        categories={categories}
        onAdd={addExpense}
        onUpdate={updateExpense}
        onAddCategory={addCategory}
        editExpense={expenseToEdit}
      />
    </SafeAreaView>
  )
}

function SummaryCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={summaryStyles.card}>
      <Text style={summaryStyles.label}>{label}</Text>
      <Text style={[summaryStyles.value, { color }]}>{value}</Text>
    </View>
  )
}

const summaryStyles = StyleSheet.create({
  card: { backgroundColor: COLORS.card, borderRadius: 14, padding: 14, minWidth: 130, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  label: { fontSize: 12, color: COLORS.muted, fontWeight: '500', marginBottom: 4 },
  value: { fontSize: 18, fontWeight: '700' },
})

function PickerModal({ open, onClose, title, options, value, onChange }: {
  open: boolean; onClose: () => void; title: string
  options: Array<{ value: string; label: string }>
  value: string; onChange: (v: string) => void
}) {
  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={pickerStyles.overlay} onPress={onClose}>
        <Pressable style={pickerStyles.sheet} onPress={e => e.stopPropagation()}>
          <View style={pickerStyles.handle} />
          <Text style={pickerStyles.title}>{title}</Text>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[pickerStyles.option, value === opt.value && pickerStyles.optionActive]}
              onPress={() => { onChange(opt.value); onClose() }}
            >
              <Text style={[pickerStyles.optionText, value === opt.value && pickerStyles.optionTextActive]}>
                {opt.label}
              </Text>
              {value === opt.value && <Ionicons name="checkmark" size={18} color={COLORS.accent} />}
            </TouchableOpacity>
          ))}
          <View style={{ height: 20 }} />
        </Pressable>
      </Pressable>
    </Modal>
  )
}

const pickerStyles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.3)' },
  sheet: { backgroundColor: COLORS.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingTop: 12 },
  handle: { width: 40, height: 4, backgroundColor: COLORS.border, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  title: { fontSize: 17, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  option: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  optionActive: { backgroundColor: COLORS.accent + '10', borderRadius: 10, paddingHorizontal: 8 },
  optionText: { fontSize: 16, color: COLORS.text },
  optionTextActive: { fontWeight: '600', color: COLORS.ghDark },
})

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  loading: { flex: 1, backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center' },
  scroll: { flex: 1 },
  content: { padding: 16 },
  summaryScroll: { marginBottom: 16 },
  filterCard: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
  filterHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  filterTitle: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  resetBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  resetText: { fontSize: 13, color: COLORS.muted },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.cardAlt, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 10 },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.text },
  dateRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  dateField: { flex: 1 },
  dateLabel: { fontSize: 11, color: COLORS.muted, fontWeight: '500', marginBottom: 4 },
  dateInput: { fontSize: 13, color: COLORS.text, backgroundColor: COLORS.cardAlt, borderRadius: 10, padding: 10, borderWidth: 1, borderColor: COLORS.border },
  pickerRow: { flexDirection: 'row', gap: 10 },
  picker: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.cardAlt, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: COLORS.border },
  pickerText: { fontSize: 13, color: COLORS.text, flex: 1 },
  card: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text, marginBottom: 12 },
  weekRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  weekLabel: { fontSize: 13, color: COLORS.text, fontWeight: '500' },
  weekAmounts: { alignItems: 'flex-end' },
  weekTotal: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  weekCount: { fontSize: 11, color: COLORS.muted },
  expenseRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  catDot: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  catDotInner: { width: 10, height: 10, borderRadius: 5 },
  expenseInfo: { flex: 1 },
  expenseCat: { fontSize: 13, fontWeight: '600', color: COLORS.text },
  expenseNote: { fontSize: 12, color: COLORS.muted, marginTop: 1 },
  expenseDate: { fontSize: 11, color: COLORS.muted, marginTop: 1 },
  expenseRight: { alignItems: 'flex-end', gap: 4 },
  expenseAmount: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  personBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  personBadgeText: { fontSize: 10, fontWeight: '600' },
  rowActions: { flexDirection: 'row', gap: 4 },
  rowActionBtn: { padding: 6, borderRadius: 8, backgroundColor: COLORS.cardAlt },
  pagination: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 16 },
  pageBtn: { padding: 8, borderRadius: 10, backgroundColor: COLORS.cardAlt },
  pageBtnDisabled: { opacity: 0.3 },
  pageText: { fontSize: 14, color: COLORS.text, fontWeight: '500' },
})
