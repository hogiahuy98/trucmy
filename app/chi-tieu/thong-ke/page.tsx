'use client'

import { useMemo, useState, useEffect } from 'react'
import {
  ConfigProvider,
  Table,
  Card,
  Typography,
  Space,
  Tag,
  DatePicker,
  Select,
  Input,
  Button,
} from 'antd'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs, { Dayjs } from 'dayjs'
import { useFinanceStore } from '../store'
import LoadingIndicator from '../components/LoadingIndicator'
import type { Expense, Category } from '../types'
import { formatVND } from '../utils'
import styles from '../styles/finance.module.scss'
import {
  Coffee,
  Home,
  ShoppingCart,
  Clapperboard,
  Wifi,
  Utensils,
  Tag as TagIcon,
} from 'lucide-react'

const { Title } = Typography
const { RangePicker } = DatePicker

const theme = {
  token: {
    colorPrimary: '#ff4b6e',
    borderRadius: 16,
    colorBgContainer: '#ffffff',
  },
}

const iconMap: Record<string, React.ComponentType<{ size: number }>> = {
  coffee: Coffee,
  home: Home,
  'shopping-cart': ShoppingCart,
  clapperboard: Clapperboard,
  wifi: Wifi,
  utensils: Utensils,
  tag: TagIcon,
}

export default function ThongKePage() {
  const router = useRouter()
  const expenses = useFinanceStore((s) => s.expenses)
  const categories = useFinanceStore((s) => s.categories)
  const deleteExpense = useFinanceStore((s) => s.deleteExpense)
  const initialize = useFinanceStore((s) => s.initialize)
  const isLoading = useFinanceStore((s) => s.isLoading)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [hasInitialized, setHasInitialized] = useState(false)

  // Filter states
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null)
  const [selectedPerson, setSelectedPerson] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchText, setSearchText] = useState('')
  const [pageSize, setPageSize] = useState(20);

  // Initialize store on mount
  useEffect(() => {
    const init = async () => {
      setHasInitialized(true)
      await initialize()
    }
    init()
  }, [initialize])

  // Track when initial load completes
  useEffect(() => {
    if (hasInitialized && !isLoading && isInitialLoad) {
      setIsInitialLoad(false)
    }
  }, [hasInitialized, isLoading, isInitialLoad])

  // Filter expenses
  const filteredExpenses = useMemo(() => {
    let filtered = [...expenses]

    // Filter by date range
    if (dateRange && dateRange[0] && dateRange[1]) {
      const start = dateRange[0].startOf('day')
      const end = dateRange[1].endOf('day')
      filtered = filtered.filter((e) => {
        const expenseDate = dayjs(e.date)
        return expenseDate.isAfter(start) && expenseDate.isBefore(end)
      })
    }

    // Filter by person
    if (selectedPerson !== 'all') {
      filtered = filtered.filter((e) => e.person === selectedPerson)
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((e) => e.category === selectedCategory)
    }

    // Filter by search text (in note or category)
    if (searchText) {
      const lowerSearch = searchText.toLowerCase()
      filtered = filtered.filter((e) => {
        const note = (e.note || '').toLowerCase()
        const cat = categories.find((c) => c.key === e.category)
        const catLabel = (cat?.label || e.category).toLowerCase()
        return note.includes(lowerSearch) || catLabel.includes(lowerSearch)
      })
    }

    return filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return dateB - dateA // Newest first
    })
  }, [expenses, dateRange, selectedPerson, selectedCategory, searchText, categories])

  // Calculate totals
  const totals = useMemo(() => {
    const total = filteredExpenses.reduce((sum, e) => sum + e.amount, 0)
    const byPerson = filteredExpenses.reduce(
      (acc, e) => {
        if (e.person === 'GH') acc.GH += e.amount
        else if (e.person === 'TM') acc.TM += e.amount
        else if (e.person === 'Both') acc.Both += e.amount
        return acc
      },
      { GH: 0, TM: 0, Both: 0 }
    )
    return { total, byPerson }
  }, [filteredExpenses])

  const handleReset = () => {
    setDateRange(null)
    setSelectedPerson('all')
    setSelectedCategory('all')
    setSearchText('')
  }

  const columns: ColumnsType<Expense> = [
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      sorter: (a, b) => {
        const dateA = new Date(a.date).getTime()
        const dateB = new Date(b.date).getTime()
        return dateA - dateB
      },
      render: (date: string | Date) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      width: 150,
      sorter: (a, b) => a.amount - b.amount,
      render: (amount: number) => (
        <span className="font-semibold text-slate-900">{formatVND(amount)}</span>
      ),
      align: 'right',
    },
    {
      title: 'Người chi',
      dataIndex: 'person',
      key: 'person',
      width: 120,
      filters: [
        { text: 'GH', value: 'GH' },
        { text: 'TM', value: 'TM' },
        { text: 'Cả 2', value: 'Both' },
      ],
      onFilter: (value, record) => record.person === value,
      render: (person: 'GH' | 'TM' | 'Both') => {
        const colors = {
          GH: 'blue',
          TM: 'purple',
          Both: 'pink',
        }
        const labels = {
          GH: 'GH',
          TM: 'TM',
          Both: 'Cả 2',
        }
        return <Tag color={colors[person]}>{labels[person]}</Tag>
      },
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      width: 180,
      render: (category: string) => {
        const cat = categories.find((c) => c.key === category)
        const Icon = iconMap[cat?.icon || 'tag'] || TagIcon
        const color = cat?.color || '#94A3B8'
        const label = cat?.label || category

        return (
          <Space>
            <span
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: `${color}22`,
                color: color,
              }}
            >
              <Icon size={14} />
            </span>
            <span>{label}</span>
          </Space>
        )
      },
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
      ellipsis: true,
      render: (note: string | null) => (
        <span className="text-slate-600">{note || '-'}</span>
      ),
    },
  ]

  // Weekly aggregation
  interface WeeklyRow {
    key: string
    weekLabel: string
    startDate: Dayjs
    endDate: Dayjs
    total: number
    GH: number
    TM: number
    Both: number
    count: number
  }

  const weeklyRows: WeeklyRow[] = useMemo(() => {
    const weekMap = new Map<string, WeeklyRow>()
    for (const e of filteredExpenses) {
      const d = dayjs(e.date)
      const start = d.startOf('week') // Sunday-start week
      const end = d.endOf('week')
      const key = start.format('YYYY-[W]ww')
      const existing = weekMap.get(key)
      if (!existing) {
        weekMap.set(key, {
          key,
          weekLabel: `${start.format('DD/MM')} - ${end.format('DD/MM')}`,
          startDate: start,
          endDate: end,
          total: 0,
          GH: 0,
          TM: 0,
          Both: 0,
          count: 0,
        })
      }
      const row = weekMap.get(key)!
      row.total += e.amount
      row.count += 1
      if (e.person === 'GH') row.GH += e.amount
      else if (e.person === 'TM') row.TM += e.amount
      else if (e.person === 'Both') row.Both += e.amount
    }
    return Array.from(weekMap.values()).sort((a, b) =>
      b.startDate.valueOf() - a.startDate.valueOf()
    )
  }, [filteredExpenses])

  const weeklyColumns: ColumnsType<WeeklyRow> = [
    {
      title: 'Tuần',
      dataIndex: 'weekLabel',
      key: 'week',
      width: 180,
      sorter: (a, b) => a.startDate.valueOf() - b.startDate.valueOf(),
    },
    {
      title: 'Tổng',
      dataIndex: 'total',
      key: 'total',
      align: 'right',
      width: 150,
      sorter: (a, b) => a.total - b.total,
      render: (v: number) => <span className="font-semibold text-slate-900">{formatVND(v)}</span>,
    },
    {
      title: 'GH',
      dataIndex: 'GH',
      key: 'gh',
      align: 'right',
      width: 130,
      sorter: (a, b) => a.GH - b.GH,
      render: (v: number) => <span className="text-blue-600">{formatVND(v)}</span>,
    },
    {
      title: 'TM',
      dataIndex: 'TM',
      key: 'tm',
      align: 'right',
      width: 130,
      sorter: (a, b) => a.TM - b.TM,
      render: (v: number) => <span className="text-purple-600">{formatVND(v)}</span>,
    },
    {
      title: 'Cả 2',
      dataIndex: 'Both',
      key: 'both',
      align: 'right',
      width: 130,
      sorter: (a, b) => a.Both - b.Both,
      render: (v: number) => <span className="text-pink-600">{formatVND(v)}</span>,
    },
    {
      title: 'Giao dịch',
      dataIndex: 'count',
      key: 'count',
      width: 120,
      align: 'right',
      sorter: (a, b) => a.count - b.count,
    },
  ]

  // Show loading indicator on first load
  if (isInitialLoad && (isLoading || !hasInitialized)) {
    return <LoadingIndicator />
  }

  return (
    <ConfigProvider theme={theme}>
      <div className={styles.financeApp}>
        <div className={styles.financeContainer}>
          <div className={styles.financeHeader}>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-4">
                <Button
                  type="text"
                  icon={<ArrowLeft size={18} />}
                  onClick={() => router.push('/chi-tieu')}
                  className="flex items-center"
                  style={{
                    color: '#ff4b6e',
                    padding: '4px 8px',
                  }}
                >
                  Quay lại
                </Button>
                <Title level={2} className={styles.titleGradient}>
                  Thống kê chi tiêu
                </Title>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="rounded-2xl border border-slate-100 shadow-md">
              <div className="text-sm text-slate-600 mb-1">Tổng chi tiêu</div>
              <div className="text-2xl font-bold text-slate-900">
                {formatVND(totals.total)}
              </div>
            </Card>
            <Card className="rounded-2xl border border-slate-100 shadow-md">
              <div className="text-sm text-slate-600 mb-1">GH</div>
              <div className="text-2xl font-bold text-blue-600">
                {formatVND(totals.byPerson.GH)}

              </div>
            </Card>
            <Card className="rounded-2xl border border-slate-100 shadow-md">
              <div className="text-sm text-slate-600 mb-1">TM</div>
              <div className="text-2xl font-bold text-purple-600">
                {formatVND(totals.byPerson.TM)}
              </div>
            </Card>
            <Card className="rounded-2xl border border-slate-100 shadow-md">
              <div className="text-sm text-slate-600 mb-1">Cả 2</div>
              <div className="text-2xl font-bold text-pink-600">
                {formatVND(totals.byPerson.Both)}
              </div>
            </Card>
          </div>

          {/* Filters */}
          <Card className="rounded-2xl border border-slate-100 shadow-md mb-6">
            <Space direction="vertical" size="middle" className="w-full">
              <div className="text-sm font-medium text-slate-700 mb-2">Bộ lọc</div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Khoảng thời gian</div>
                  <RangePicker
                    value={dateRange}
                    onChange={(dates) => setDateRange(dates)}
                    format="DD/MM/YYYY"
                    className="w-full"
                    placeholder={['Từ ngày', 'Đến ngày']}
                  />
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Người chi</div>
                  <Select
                    value={selectedPerson}
                    onChange={setSelectedPerson}
                    className="w-full"
                    options={[
                      { label: 'Tất cả', value: 'all' },
                      { label: 'GH', value: 'GH' },
                      { label: 'TM', value: 'TM' },
                      { label: 'Cả 2', value: 'Both' },
                    ]}
                  />
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Danh mục</div>
                  <Select
                    value={selectedCategory}
                    onChange={setSelectedCategory}
                    className="w-full"
                    options={[
                      { label: 'Tất cả', value: 'all' },
                      ...categories.map((c) => ({
                        label: c.label,
                        value: c.key,
                      })),
                    ]}
                  />
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Tìm kiếm</div>
                  <Input
                    placeholder="Tìm trong ghi chú..."
                    prefix={<SearchOutlined className="text-slate-400" />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    allowClear
                  />
                </div>
              </div>
              <div>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={handleReset}
                  type="default"
                >
                  Đặt lại bộ lọc
                </Button>
              </div>
            </Space>
          </Card>

          {/* Weekly Statistics */}
          <Card className="rounded-2xl border border-slate-100 shadow-md mb-6">
            <div className="mb-3 text-sm font-semibold text-slate-700">Thống kê theo tuần</div>
            <Table
              columns={weeklyColumns}
              dataSource={weeklyRows}
              rowKey="key"
              pagination={false}
              size="small"
              className="[&_.ant-table-thead>tr>th]:bg-slate-50 [&_.ant-table-thead>tr>th]:font-semibold"
            />
          </Card>

          {/* Table */}
          <Card className="rounded-2xl border border-slate-100 shadow-md">
            <div className="mb-4 text-sm text-slate-600">
              Hiển thị {filteredExpenses.length} / {expenses.length} giao dịch
            </div>
            <Table
              columns={columns}
              dataSource={filteredExpenses}
              rowKey="id"
              pagination={{
                pageSize: pageSize,
                showSizeChanger: true,
                showTotal: (total) => `Tổng ${total} giao dịch`,
                pageSizeOptions: ['10', '20', '50', '100'],
                onShowSizeChange(current, size) {
                  setPageSize(size)
                },
              }}
              scroll={{ x: 800 }}
              className="[&_.ant-table-thead>tr>th]:bg-slate-50 [&_.ant-table-thead>tr>th]:font-semibold"
            />
          </Card>

          <div className={styles.footer}>H&M — build, measure, save 💰</div>
        </div>
      </div>
    </ConfigProvider>
  )
}

