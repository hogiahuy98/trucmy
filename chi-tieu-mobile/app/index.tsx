import React, { useMemo, useState, useEffect } from 'react'
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, Vibration,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useFinanceStore } from '../store/finance'
import { useUIStore } from '../store/ui'
import TotalSummaryCard from '../components/TotalSummaryCard'
import BalanceCard from '../components/BalanceCard'
import DailySpendingCard from '../components/DailySpendingCard'
import CategoryChips from '../components/CategoryChips'
import InsightsCard from '../components/InsightsCard'
import RecentTransactionsCard from '../components/RecentTransactionsCard'
import AddExpenseModal from '../components/AddExpenseModal'
import QuickAddExpense from '../components/QuickAddExpense'
import IncomeModal from '../components/IncomeModal'
import TransferModal from '../components/TransferModal'
import { COLORS } from '../components/theme'
import { scheduleDailyReminder, cancelDailyReminder, isDailyReminderScheduled } from '../lib/notifications'
import { Alert } from 'react-native'
import type { Expense } from '../types'

export default function HomeScreen() {
  const router = useRouter()

  const categories = useFinanceStore((s) => s.categories)
  const addCategory = useFinanceStore((s) => s.addCategory)
  const expenses = useFinanceStore((s) => s.expenses)
  const addExpense = useFinanceStore((s) => s.addExpense)
  const updateExpense = useFinanceStore((s) => s.updateExpense)
  const deleteExpense = useFinanceStore((s) => s.deleteExpense)
  const initialize = useFinanceStore((s) => s.initialize)
  const cleanup = useFinanceStore((s) => s.cleanup)
  const isLoading = useFinanceStore((s) => s.isLoading)
  const isOnline = useFinanceStore((s) => s.isOnline)
  const syncError = useFinanceStore((s) => s.syncError)
  const pendingMutations = useFinanceStore((s) => s.pendingMutations)
  const incomes = useFinanceStore((s) => s.incomes)
  const transfers = useFinanceStore((s) => s.transfers)
  const getCurrentMonthIncomes = useFinanceStore((s) => s.getCurrentMonthIncomes)
  const getCurrentMonthTransfers = useFinanceStore((s) => s.getCurrentMonthTransfers)
  const addIncome = useFinanceStore((s) => s.addIncome)
  const updateIncome = useFinanceStore((s) => s.updateIncome)
  const deleteIncome = useFinanceStore((s) => s.deleteIncome)
  const addTransfer = useFinanceStore((s) => s.addTransfer)
  const updateTransfer = useFinanceStore((s) => s.updateTransfer)
  const deleteTransfer = useFinanceStore((s) => s.deleteTransfer)

  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [hasInitialized, setHasInitialized] = useState(false)
  const [expenseModalOpen, setExpenseModalOpen] = useState(false)
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const [incomeModalOpen, setIncomeModalOpen] = useState(false)
  const [transferModalOpen, setTransferModalOpen] = useState(false)
  const [editExpense, setEditExpense] = useState<Expense | null>(null)
  const [reminderOn, setReminderOn] = useState(false)
  const quickAddRequested = useUIStore((s) => s.quickAddRequested)

  useEffect(() => {
    const init = async () => {
      setHasInitialized(true)
      await initialize()
    }
    init()
    return () => cleanup()
  }, [])

  useEffect(() => {
    isDailyReminderScheduled().then(setReminderOn)
  }, [])

  // Mở form thêm nhanh khi kích hoạt từ quick action (long-press icon)
  useEffect(() => {
    if (quickAddRequested > 0) setQuickAddOpen(true)
  }, [quickAddRequested])

  const handleToggleReminder = async () => {
    if (reminderOn) {
      await cancelDailyReminder()
      setReminderOn(false)
      Alert.alert('Đã tắt nhắc nhở', 'Bạn sẽ không nhận thông báo nhắc nhập chi tiêu nữa.')
    } else {
      const ok = await scheduleDailyReminder()
      if (ok) {
        setReminderOn(true)
        Alert.alert('Đã bật nhắc nhở', 'Mỗi tối 9h sẽ có thông báo nhắc bạn ghi chi tiêu.')
      } else {
        Alert.alert('Không thể bật', 'Vui lòng cho phép thông báo trong Cài đặt iPhone.')
      }
    }
  }

  useEffect(() => {
    if (hasInitialized && !isLoading && isInitialLoad) setIsInitialLoad(false)
  }, [hasInitialized, isLoading, isInitialLoad])

  const { total, byPerson, categoryMap } = useMemo(
    () => useFinanceStore.getState().getMonthlySummary(),
    [expenses]
  )

  const balance = useMemo(
    () => useFinanceStore.getState().getBalanceSummary(),
    [expenses, incomes, transfers]
  )

  const currentMonthIncomes = useMemo(() => getCurrentMonthIncomes(), [incomes])
  const currentMonthTransfers = useMemo(() => getCurrentMonthTransfers(), [transfers])

  const ghAmount = byPerson.GH + byPerson.Both / 2
  const tmAmount = byPerson.TM + byPerson.Both / 2
  const ghPct = total > 0 ? Math.round((ghAmount / total) * 100) : 0
  const tmPct = 100 - ghPct

  const colorPalette = categories.map((c) => c.color)
  const chartData = Object.keys(categoryMap).length > 0 ? categoryMap : {}

  const handleFabPress = () => {
    setExpenseModalOpen(true)
  }

  const handleFabLongPress = () => {
    Vibration.vibrate(30)
    setQuickAddOpen(true)
  }

  const handleEditExpense = (expense: Expense) => {
    setEditExpense(expense)
    setExpenseModalOpen(true)
  }

  if (isInitialLoad && (isLoading || !hasInitialized)) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Chi tiêu Huy My 🥑</Text>
          {!isOnline && (
            <Text style={styles.offlineBadge}>Offline{pendingMutations.length > 0 ? ` · ${pendingMutations.length} chờ sync` : ''}</Text>
          )}
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconBtn} onPress={handleToggleReminder}>
            <Ionicons name={reminderOn ? 'notifications' : 'notifications-off-outline'} size={20} color={reminderOn ? COLORS.ghDark : COLORS.muted} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.statsBtn} onPress={() => router.push('/thong-ke')}>
            <Ionicons name="bar-chart-outline" size={18} color={COLORS.ghDark} />
            <Text style={styles.statsBtnText}>Thống kê</Text>
          </TouchableOpacity>
        </View>
      </View>

      {syncError && (
        <View style={styles.errorBanner}>
          <Ionicons name="warning-outline" size={14} color={COLORS.danger} />
          <Text style={styles.errorText} numberOfLines={1}>{syncError}</Text>
        </View>
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TotalSummaryCard total={total} ghAmount={ghAmount} tmAmount={tmAmount} ghPct={ghPct} tmPct={tmPct} />
        <View style={styles.gap} />
        <BalanceCard
          balance={balance}
          hasIncome={currentMonthIncomes.length > 0}
          onEditClick={() => setIncomeModalOpen(true)}
          onTransferClick={() => setTransferModalOpen(true)}
        />
        <View style={styles.gap} />
        <DailySpendingCard expenses={expenses} />
        <View style={styles.gap} />
        {Object.keys(chartData).length > 0 && (
          <>
            <CategoryChips chartData={chartData} categories={categories} total={total} />
            <View style={styles.gap} />
          </>
        )}
        <InsightsCard expenses={expenses} />
        <View style={styles.gap} />
        <RecentTransactionsCard
          expenses={expenses}
          categories={categories}
          onDelete={deleteExpense}
          onEdit={handleEditExpense}
        />
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB — tap = full modal, long press = quick add */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleFabPress}
        onLongPress={handleFabLongPress}
        delayLongPress={500}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>

      <AddExpenseModal
        open={expenseModalOpen}
        onClose={() => { setExpenseModalOpen(false); setEditExpense(null) }}
        categories={categories}
        onAdd={addExpense}
        onUpdate={updateExpense}
        onAddCategory={addCategory}
        editExpense={editExpense}
      />

      <QuickAddExpense
        open={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        onOpenFullModal={() => { setQuickAddOpen(false); setExpenseModalOpen(true) }}
      />

      <IncomeModal
        open={incomeModalOpen}
        onClose={() => setIncomeModalOpen(false)}
        currentMonthIncomes={currentMonthIncomes}
        onAdd={async (month, year, value, byPerson, note) => await addIncome(month, year, value, byPerson, note)}
        onUpdate={async (incomeId, value, byPerson, note) => await updateIncome(incomeId, value, byPerson, note)}
        onDelete={async (incomeId) => await deleteIncome(incomeId)}
      />

      <TransferModal
        open={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        currentMonthTransfers={currentMonthTransfers}
        onAdd={async (amount, fromPerson, toPerson, note, date) => await addTransfer({ amount, from_person: fromPerson, to_person: toPerson, note, date: date || new Date() })}
        onUpdate={async (transferId, amount, fromPerson, toPerson, note) => await updateTransfer(transferId, { amount, from_person: fromPerson, to_person: toPerson, note })}
        onDelete={async (transferId) => await deleteTransfer(transferId)}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  loadingContainer: { flex: 1, backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 15, color: COLORS.muted },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  offlineBadge: { fontSize: 11, color: COLORS.danger, marginTop: 2, fontWeight: '500' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: COLORS.cardAlt, alignItems: 'center', justifyContent: 'center' },
  statsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.cardAlt,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  statsBtnText: { fontSize: 14, fontWeight: '600', color: COLORS.ghDark },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.danger + '15',
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginHorizontal: 20,
    borderRadius: 10,
    marginBottom: 8,
  },
  errorText: { flex: 1, fontSize: 12, color: COLORS.danger },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 20 },
  gap: { height: 14 },
  fab: {
    position: 'absolute',
    bottom: 36,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.ghDark,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
})
