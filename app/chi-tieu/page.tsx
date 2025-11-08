'use client'

import { useMemo, useState, useEffect } from 'react'
import { ConfigProvider, Row, Col, notification } from 'antd'
import { Typography } from 'antd'
import { useFinanceStore } from './store'
import TotalSummaryCard from './components/TotalSummaryCard'
import PersonSplitCard from './components/PersonSplitCard'
import CategoryChartCard from './components/CategoryChartCard'
import RecentTransactionsCard from './components/RecentTransactionsCard'
import AddExpenseModal from './components/AddExpenseModal'
import LoadingIndicator from './components/LoadingIndicator'
import styles from './styles/finance.module.scss'

const { Title } = Typography

const theme = {
  token: {
    colorPrimary: '#ff4b6e',
    borderRadius: 16,
    colorBgContainer: '#ffffff',
  },
}

export default function FinancePage() {
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
      notification.error({
        message: 'Lỗi đồng bộ',
        description: syncError,
        placement: 'bottomRight',
        duration: 4,
      })
    }
  }, [syncError])

  useEffect(() => {
    if (!isOnline && pendingMutations.length > 0) {
      notification.info({
        message: 'Đang offline',
        description: `${pendingMutations.length} thay đổi sẽ được đồng bộ khi online`,
        placement: 'bottomRight',
        duration: 3,
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
    <ConfigProvider theme={theme}>
      <div className={styles.financeApp}>
        <div className={styles.financeContainer}>
          <div className={styles.financeHeader}>
            <Title level={2} className={styles.titleGradient}>
              Quản lý chi tiêu
            </Title>
          </div>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <TotalSummaryCard total={total} />
            </Col>
            <Col xs={24} md={12}>
              <PersonSplitCard ghPct={ghPct} tmPct={tmPct} />
            </Col>

            <Col xs={24} md={12}>
              <CategoryChartCard
                chartData={chartData}
                categories={categories}
                colorPalette={colorPalette}
                total={total}
              />
            </Col>

            <Col xs={24} md={12}>
              <RecentTransactionsCard
                expenses={expenses}
                categories={categories}
                onDelete={deleteExpense}
              />
            </Col>
          </Row>

          <button className={styles.fab} onClick={() => setOpen(true)}>
            <span className={styles.fabInner}>Tốn tiền 💸</span>
          </button>

          <AddExpenseModal
            open={open}
            onClose={() => setOpen(false)}
            categories={categories}
            onAdd={addExpense}
            onAddCategory={addCategory}
          />

          <div className={styles.footer}>H&M — build, measure, save 💰</div>
        </div>
      </div>
    </ConfigProvider>
  )
}

