'use client'

import { useMemo, useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { BarChart3 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useFinanceStore } from './store'
import TotalSummaryCard from './components/TotalSummaryCard'
import RecentTransactionsCard from './components/RecentTransactionsCard'
import DailySpendingCard from './components/DailySpendingCard'
import InsightsCard from './components/InsightsCard'
import CategoryChips from './components/CategoryChips'
import AddExpenseModal from './components/AddExpenseModal'
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

  const [open, setOpen] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [hasInitialized, setHasInitialized] = useState(false)

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

  const { total, byPerson, categoryMap } = useMemo(
    () => useFinanceStore.getState().getMonthlySummary(),
    [expenses]
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

          <button className={styles.fab} onClick={() => setOpen(true)}>
            <span className={styles.fabInner}>Thêm chi tiêu</span>
          </button>

          <AddExpenseModal
            open={open}
            onClose={() => setOpen(false)}
            categories={categories}
            onAdd={addExpense}
            onAddCategory={addCategory}
          />

          <div className={styles.footer}>GH × TM — cùng nhau quản lý chi tiêu</div>
        </div>
      </div>
  )
}

