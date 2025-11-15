'use client'

import { useMemo, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Search, RotateCcw, Trash2, Edit2 } from 'lucide-react'
import dayjs, { Dayjs } from 'dayjs'
import { toast } from 'sonner'
import { useFinanceStore } from '../store'
import LoadingIndicator from '../components/LoadingIndicator'
import ConfirmModal from '../components/ConfirmModal'
import AddExpenseModal from '../components/AddExpenseModal'
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
  const updateExpense = useFinanceStore((s) => s.updateExpense)
  const addExpense = useFinanceStore((s) => s.addExpense)
  const addCategory = useFinanceStore((s) => s.addCategory)
  const initialize = useFinanceStore((s) => s.initialize)
  const isLoading = useFinanceStore((s) => s.isLoading)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [hasInitialized, setHasInitialized] = useState(false)

  // Filter states
  const [startDate, setStartDate] = useState<Date | undefined>()
  const [endDate, setEndDate] = useState<Date | undefined>()
  const [selectedPerson, setSelectedPerson] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchText, setSearchText] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(20)
  const [sortField, setSortField] = useState<string>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Confirm modal states
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null)

  // Edit modal states
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null)

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
    if (startDate && endDate) {
      const start = dayjs(startDate).startOf('day')
      const end = dayjs(endDate).endOf('day')
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

    // Apply sorting
    filtered.sort((a, b) => {
      let compareResult = 0
      if (sortField === 'date') {
        compareResult = new Date(a.date).getTime() - new Date(b.date).getTime()
      } else if (sortField === 'amount') {
        compareResult = a.amount - b.amount
      }
      return sortOrder === 'asc' ? compareResult : -compareResult
    })

    return filtered
  }, [expenses, startDate, endDate, selectedPerson, selectedCategory, searchText, categories, sortField, sortOrder])

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
    setStartDate(undefined)
    setEndDate(undefined)
    setSelectedPerson('all')
    setSelectedCategory('all')
    setSearchText('')
    setCurrentPage(1)
  }

  const handleDeleteExpense = (expense: Expense) => {
    setExpenseToDelete(expense)
    setConfirmModalOpen(true)
  }

  const confirmDeleteExpense = async () => {
    if (!expenseToDelete) return

    try {
      await deleteExpense(expenseToDelete.id)
      toast.success('Đã xóa chi tiêu', {
        description: 'Chi tiêu đã được xóa thành công',
        duration: 2500,
      })
    } catch (error) {
      toast.error('Lỗi', {
        description: 'Không thể xóa chi tiêu',
        duration: 2500,
      })
    } finally {
      setExpenseToDelete(null)
    }
  }

  const handleEditExpense = (expense: Expense) => {
    setExpenseToEdit(expense)
    setEditModalOpen(true)
  }

  const handleCloseEditModal = () => {
    setEditModalOpen(false)
    setExpenseToEdit(null)
  }

  // Paginated data
  const paginatedExpenses = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    const end = start + pageSize
    return filteredExpenses.slice(start, end)
  }, [filteredExpenses, currentPage, pageSize])

  const totalPages = Math.ceil(filteredExpenses.length / pageSize)

  // Remove old column definitions - we'll use them inline
  /* const columns: ColumnsType<Expense> = [
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
  ] */

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

  // Remove old weekly column definitions
  /* const weeklyColumns: ColumnsType<WeeklyRow> = [
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
  ] */

  // Show loading indicator on first load
  if (isInitialLoad && (isLoading || !hasInitialized)) {
    return <LoadingIndicator />
  }

  return (
      <div className={styles.financeApp} style={{ background: '#FAF8F4' }}>
        <div className={styles.financeContainer}>
          <div className={styles.financeHeader}>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={() => router.push('/chi-tieu')}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft size={18} />
                  <span>Quay lại</span>
                </Button>
                <h2 className={styles.titleGradient} style={{ fontSize: '24px', fontWeight: 600 }}>
                  Thống kê chi tiêu
                </h2>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card style={{ padding: '20px', backgroundColor: '#EFECE6' }}>
              <div className="text-sm text-olive-grey mb-1">Tổng chi tiêu</div>
              <div className="text-2xl font-bold text-dark-olive">
                {formatVND(totals.total)}
              </div>
            </Card>
            <Card style={{ padding: '20px', backgroundColor: '#D8E2D0' }}>
              <div className="text-sm text-olive-grey mb-1">GH</div>
              <div className="text-2xl font-bold text-avocado-green">
                {formatVND(totals.byPerson.GH)}
              </div>
            </Card>
            <Card style={{ padding: '20px', backgroundColor: '#D8E2D0' }}>
              <div className="text-sm text-olive-grey mb-1">TM</div>
              <div className="text-2xl font-bold text-deep-avocado">
                {formatVND(totals.byPerson.TM)}
              </div>
            </Card>
            <Card style={{ padding: '20px', backgroundColor: '#D8E2D0' }}>
              <div className="text-sm text-olive-grey mb-1">Cả 2</div>
              <div className="text-2xl font-bold text-coral-soft">
                {formatVND(totals.byPerson.Both)}
              </div>
            </Card>
          </div>

          {/* Filters */}
          <Card style={{ padding: '20px', backgroundColor: '#EFECE6', marginBottom: '24px' }}>
            <div className="flex flex-col gap-4">
              <div className="text-sm font-medium text-dark-olive mb-2">Bộ lọc</div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs text-olive-grey mb-1 block">Từ ngày</label>
                  <Input
                    type="date"
                    value={startDate ? dayjs(startDate).format('YYYY-MM-DD') : ''}
                    onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value) : undefined)}
                  />
                </div>
                <div>
                  <label className="text-xs text-olive-grey mb-1 block">Đến ngày</label>
                  <Input
                    type="date"
                    value={endDate ? dayjs(endDate).format('YYYY-MM-DD') : ''}
                    onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : undefined)}
                  />
                </div>
                <div>
                  <label className="text-xs text-olive-grey mb-1 block">Người chi</label>
                  <Select
                    value={selectedPerson}
                    onChange={(e) => setSelectedPerson(e.target.value)}
                  >
                    <option value="all">Tất cả</option>
                    <option value="GH">GH</option>
                    <option value="TM">TM</option>
                    <option value="Both">Cả 2</option>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-olive-grey mb-1 block">Danh mục</label>
                  <Select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="all">Tất cả</option>
                    {categories.map((c) => (
                      <option key={c.key} value={c.key}>{c.label}</option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-olive-grey mb-1 block">Tìm kiếm</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-olive-grey" />
                  <Input
                    placeholder="Tìm trong ghi chú..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                      className="pl-10"
                  />
                  </div>
                </div>
              </div>
              <div>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RotateCcw size={16} />
                  <span>Đặt lại bộ lọc</span>
                </Button>
              </div>
            </div>
          </Card>

          {/* Weekly Statistics */}
          <Card style={{ padding: '20px', backgroundColor: '#EFECE6', marginBottom: '24px' }}>
            <div className="mb-3 text-sm font-semibold text-dark-olive">Thống kê theo tuần</div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tuần</TableHead>
                    <TableHead className="text-right">Tổng</TableHead>
                    <TableHead className="text-right">GH</TableHead>
                    <TableHead className="text-right">TM</TableHead>
                    <TableHead className="text-right">Cả 2</TableHead>
                    <TableHead className="text-right">Giao dịch</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {weeklyRows.map((row) => (
                    <TableRow key={row.key}>
                      <TableCell className="font-medium">{row.weekLabel}</TableCell>
                      <TableCell className="text-right font-semibold text-dark-olive">
                        {formatVND(row.total)}
                      </TableCell>
                      <TableCell className="text-right text-avocado-green">
                        {formatVND(row.GH)}
                      </TableCell>
                      <TableCell className="text-right text-deep-avocado">
                        {formatVND(row.TM)}
                      </TableCell>
                      <TableCell className="text-right text-coral-soft">
                        {formatVND(row.Both)}
                      </TableCell>
                      <TableCell className="text-right">{row.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>

          {/* Table */}
          <Card style={{ padding: '20px', backgroundColor: '#EFECE6' }}>
            <div className="mb-4 text-sm text-olive-grey">
              Hiển thị {filteredExpenses.length} / {expenses.length} giao dịch
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ngày</TableHead>
                    <TableHead className="text-right">Số tiền</TableHead>
                    <TableHead>Người chi</TableHead>
                    <TableHead>Danh mục</TableHead>
                    <TableHead>Ghi chú</TableHead>
                    <TableHead className="w-32"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedExpenses.map((expense) => {
                    const cat = categories.find((c) => c.key === expense.category)
                    const Icon = iconMap[cat?.icon || 'tag'] || TagIcon
                    const color = cat?.color || '#A3C68C'
                    const label = cat?.label || expense.category
                    
                    return (
                      <TableRow key={expense.id}>
                        <TableCell className="font-medium">
                          {dayjs(expense.date).format('DD/MM/YYYY')}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-dark-olive">
                          {formatVND(expense.amount)}
                        </TableCell>
                        <TableCell>
                          <span
                            className="px-2 py-1 rounded text-xs font-medium"
                            style={{
                              backgroundColor: expense.person === 'GH' ? '#A3C68C20' :
                                              expense.person === 'TM' ? '#6F8F5F20' : '#E69D8720',
                              color: expense.person === 'GH' ? '#A3C68C' :
                                     expense.person === 'TM' ? '#6F8F5F' : '#E69D87',
                            }}
                          >
                            {expense.person === 'Both' ? 'Cả 2' : expense.person}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center"
                              style={{
                                backgroundColor: `${color}20`,
                                color: color,
                              }}
                            >
                              <Icon size={14} />
                            </div>
                            <span>{label}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-olive-grey">
                          {expense.note || '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditExpense(expense)}
                              className="h-8 w-8 p-0 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Edit2 size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteExpense(expense)}
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-olive-grey">
                  Trang {currentPage} / {totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Trước
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Sau
                  </Button>
                </div>
              </div>
            )}
          </Card>

          <div className={styles.footer}>GH × TM — cùng nhau quản lý chi tiêu</div>
        </div>

        {/* Confirm Delete Modal */}
        <ConfirmModal
          open={confirmModalOpen}
          onClose={() => {
            setConfirmModalOpen(false)
            setExpenseToDelete(null)
          }}
          onConfirm={confirmDeleteExpense}
          title="Xác nhận xóa chi tiêu"
          description={
            expenseToDelete
              ? `Bạn có chắc muốn xóa chi tiêu ${formatVND(expenseToDelete.amount)} (${
                  categories.find((c) => c.key === expenseToDelete.category)?.label ||
                  expenseToDelete.category
                }) không? Hành động này không thể hoàn tác.`
              : ''
          }
          confirmText="Xóa"
          cancelText="Huỷ"
          variant="danger"
        />

        {/* Edit Expense Modal */}
        <AddExpenseModal
          open={editModalOpen}
          onClose={handleCloseEditModal}
          categories={categories}
          onAdd={addExpense}
          onUpdate={updateExpense}
          onAddCategory={addCategory}
          editExpense={expenseToEdit}
        />
      </div>
  )
}

