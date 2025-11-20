'use client'

import { useMemo, useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { BarChart3 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useFinanceStore } from './store'
import TotalSummaryCard from './components/TotalSummaryCard'
import BalanceCard from './components/BalanceCard'
import RecentTransactionsCard from './components/RecentTransactionsCard'
import DailySpendingCard from './components/DailySpendingCard'
import InsightsCard from './components/InsightsCard'
import CategoryChips from './components/CategoryChips'
import AddExpenseModal from './components/AddExpenseModal'
import IncomeModal from './components/IncomeModal'
import TransferModal from './components/TransferModal'
import QuickAddExpense from './components/QuickAddExpense'
import LoadingIndicator from './components/LoadingIndicator'
import styles from './styles/finance.module.scss'


export default function FinancePage() {
  const router = useRouter()
  const categories = useFinanceStore((s) => s.categories)
  const addCategory = useFinanceStore((s) => s.addCategory)
  const expenses = useFinanceStore((s) => s.expenses)
  const addExpense = useFinanceStore((s) => s.addExpense)
  const deleteExpense = useFinanceStore((s) => s.deleteExpense)
  const initialize = useFinanceStore((s) => s.initialize)
  const isLoading = useFinanceStore((s) => s.isLoading)
  const isOnline = useFinanceStore((s) => s.isOnline)
  const syncError = useFinanceStore((s) => s.syncError)
  const pendingMutations = useFinanceStore((s) => s.pendingMutations)
  const setOnlineStatus = useFinanceStore((s) => s.setOnlineStatus)
  const cleanup = useFinanceStore((s) => s.cleanup)
  const getCurrentMonthIncomes = useFinanceStore((s) => s.getCurrentMonthIncomes)
  const getCurrentMonthTransfers = useFinanceStore((s) => s.getCurrentMonthTransfers)
  const getBalanceSummary = useFinanceStore((s) => s.getBalanceSummary)
  const addIncome = useFinanceStore((s) => s.addIncome)
  const updateIncome = useFinanceStore((s) => s.updateIncome)
  const deleteIncome = useFinanceStore((s) => s.deleteIncome)
  const addTransfer = useFinanceStore((s) => s.addTransfer)
  const updateTransfer = useFinanceStore((s) => s.updateTransfer)
  const deleteTransfer = useFinanceStore((s) => s.deleteTransfer)

  const [open, setOpen] = useState(false)
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const [incomeModalOpen, setIncomeModalOpen] = useState(false)
  const [transferModalOpen, setTransferModalOpen] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [hasInitialized, setHasInitialized] = useState(false)
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const longPressTriggeredRef = useRef(false)

  // Initialize store on mount
  useEffect(() => {
    const init = async () => {
      setHasInitialized(true)
      await initialize()
    }
    init()

    // Setup online/offline listeners
    const handleOnline = () => setOnlineStatus(true)
    const handleOffline = () => setOnlineStatus(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Cleanup on unmount
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      cleanup()
    }
  }, [initialize, setOnlineStatus, cleanup])

  // Track when initial load completes
  useEffect(() => {
    if (hasInitialized && !isLoading && isInitialLoad) {
      setIsInitialLoad(false)
    }
  }, [hasInitialized, isLoading, isInitialLoad])

  // Show sync status notifications
  useEffect(() => {
    if (syncError) {
      toast.error('Lỗi đồng bộ', {
        description: syncError,
        duration: 4000,
      })
    }
  }, [syncError])

  useEffect(() => {
    if (!isOnline && pendingMutations.length > 0) {
      toast.info('Đang offline', {
        description: `${pendingMutations.length} thay đổi sẽ được đồng bộ khi online`,
        duration: 3000,
      })
    }
  }, [isOnline, pendingMutations.length])

  // Long press handler for FAB
  const handleFabMouseDown = () => {
    longPressTriggeredRef.current = false
    longPressTimerRef.current = setTimeout(() => {
      longPressTriggeredRef.current = true
      setQuickAddOpen(true)
      // Haptic feedback if supported
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(30)
      }
    }, 500) // 500ms for long press
  }

  const handleFabMouseUp = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }

  const handleFabClick = (e: React.MouseEvent) => {
    // Prevent click if long press was just triggered
    if (longPressTriggeredRef.current) {
      e.preventDefault()
      longPressTriggeredRef.current = false
      return
    }
    
    // Only open full modal if it wasn't a long press
    if (longPressTimerRef.current === null) {
      setOpen(true)
    }
    
    // Clear timer if it exists
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }

  // Reset long press flag when quickAdd closes
  useEffect(() => {
    if (!quickAddOpen) {
      // Small delay to prevent immediate click after closing
      const timer = setTimeout(() => {
        longPressTriggeredRef.current = false
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [quickAddOpen])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current)
      }
    }
  }, [])

  const { total, byPerson, categoryMap } = useMemo(
    () => useFinanceStore.getState().getMonthlySummary(),
    [expenses]
  )

  const incomes = useFinanceStore((s) => s.incomes)

  const balance = useMemo(
    () => useFinanceStore.getState().getBalanceSummary(),
    [expenses, incomes]
  )

  const currentMonthIncomes = useMemo(
    () => useFinanceStore.getState().getCurrentMonthIncomes(),
    [incomes]
  )

  const transfers = useFinanceStore((s) => s.transfers)

  const currentMonthTransfers = useMemo(
    () => useFinanceStore.getState().getCurrentMonthTransfers(),
    [transfers]
  )

  const ghAmount = byPerson.GH + byPerson.Both / 2
  const tmAmount = byPerson.TM + byPerson.Both / 2
  const ghPct = total > 0 ? Math.round((ghAmount / total) * 100) : 0
  const tmPct = 100 - ghPct

  const colorPalette = categories.map((c) => c.color)
  const chartData =
    Object.keys(categoryMap).length > 0 ? categoryMap : { Cafe: 1 }

  // Show loading indicator on first load
  if (isInitialLoad && (isLoading || !hasInitialized)) {
    return <LoadingIndicator />
  }

  return (
      <div className={styles.financeApp}>
        <div className={styles.financeContainer}>
          {/* iOS Large Title */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={styles.iosHeader}
          >
            <h1 className={styles.iosLargeTitle}>Chi tiêu Huy My 🥑</h1>
              <Button
              variant="ghost"
                onClick={() => router.push('/chi-tieu/thong-ke')}
              className={styles.iosHeaderButton}
              >
              <BarChart3 size={18} />
              <span>Thống kê</span>
              </Button>
          </motion.div>

          {/* Hero Card - Total Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, delay: 0.05 }}
            style={{ marginBottom: '20px' }}
          >
            <TotalSummaryCard total={total} />
          </motion.div>

          {/* Balance Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, delay: 0.07 }}
            style={{ marginBottom: '20px' }}
          >
            <BalanceCard
              balance={balance}
              hasIncome={currentMonthIncomes.length > 0}
              onEditClick={() => setIncomeModalOpen(true)}
              onTransferClick={() => setTransferModalOpen(true)}
            />
          </motion.div>

          {/* Daily Snapshot */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, delay: 0.1 }}
            style={{ marginBottom: '20px' }}
          >
              <DailySpendingCard expenses={expenses} />
          </motion.div>

          {/* Category Chips - Horizontal Scroll */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, delay: 0.15 }}
            style={{ marginBottom: '20px' }}
          >
            <CategoryChips
                chartData={chartData}
                categories={categories}
                total={total}
              />
          </motion.div>

          {/* Gentle Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, delay: 0.2 }}
            style={{ marginBottom: '20px' }}
          >
            <InsightsCard expenses={expenses} />
          </motion.div>

          {/* Recent Transactions - iOS Table Style */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, delay: 0.25 }}
            style={{ marginBottom: '20px' }}
          >
              <RecentTransactionsCard
                expenses={expenses}
                categories={categories}
                onDelete={deleteExpense}
              />
          </motion.div>

          <button
            className={styles.fab}
            onClick={handleFabClick}
            onMouseDown={handleFabMouseDown}
            onMouseUp={handleFabMouseUp}
            onMouseLeave={handleFabMouseUp}
            onTouchStart={handleFabMouseDown}
            onTouchEnd={handleFabMouseUp}
          >
            <span className={styles.fabInner}>Thêm chi tiêu</span>
          </button>

          <AddExpenseModal
            open={open}
            onClose={() => setOpen(false)}
            categories={categories}
            onAdd={addExpense}
            onAddCategory={addCategory}
          />

          <QuickAddExpense
            open={quickAddOpen}
            onClose={() => setQuickAddOpen(false)}
            onOpenFullModal={() => {
              setQuickAddOpen(false)
              setOpen(true)
            }}
          />

          <IncomeModal
            open={incomeModalOpen}
            onClose={() => setIncomeModalOpen(false)}
            currentMonthIncomes={currentMonthIncomes}
            onAdd={async (month, year, value, byPerson, note) => {
              await addIncome(month, year, value, byPerson, note)
            }}
            onUpdate={async (incomeId, value, byPerson, note) => {
              await updateIncome(incomeId, value, byPerson, note)
            }}
            onDelete={async (incomeId) => {
              await deleteIncome(incomeId)
            }}
          />

          <TransferModal
            open={transferModalOpen}
            onClose={() => setTransferModalOpen(false)}
            currentMonthTransfers={currentMonthTransfers}
            onAdd={async (amount, fromPerson, toPerson, note, date) => {
              await addTransfer({
                amount,
                from_person: fromPerson,
                to_person: toPerson,
                note,
                date: date || new Date()
              })
            }}
            onUpdate={async (transferId, amount, fromPerson, toPerson, note) => {
              await updateTransfer(transferId, {
                amount,
                from_person: fromPerson,
                to_person: toPerson,
                note
              })
            }}
            onDelete={async (transferId) => {
              await deleteTransfer(transferId)
            }}
          />

          <div className={styles.footer}>GH × TM — cùng nhau quản lý chi tiêu</div>
        </div>
      </div>
  )
}

