'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Edit2, Trash2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { formatVND } from '../utils'
import type { Income } from '../types'

interface IncomeModalProps {
  open: boolean
  onClose: () => void
  currentMonthIncomes: Income[]
  onAdd: (month: number, year: number, value: number, byPerson: 'GH' | 'TM', note?: string) => Promise<void>
  onUpdate?: (incomeId: number, value: number, byPerson: 'GH' | 'TM', note?: string) => Promise<void>
  onDelete?: (incomeId: number) => Promise<void>
}

export default function IncomeModal({
  open,
  onClose,
  currentMonthIncomes,
  onAdd,
  onUpdate,
  onDelete,
}: IncomeModalProps) {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth())
  const [year, setYear] = useState(now.getFullYear())
  const [valueInput, setValueInput] = useState('')
  const [byPerson, setByPerson] = useState<'GH' | 'TM'>('GH')
  const [noteInput, setNoteInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [editingIncome, setEditingIncome] = useState<Income | null>(null)

  const valueInputRef = useRef<HTMLInputElement>(null)

  // Filter incomes for selected month/year
  const selectedMonthIncomes = currentMonthIncomes.filter(
    (i) => i.month === month && i.year === year
  )

  // Reset form when modal opens or month/year changes
  useEffect(() => {
    if (open) {
      setValueInput('')
      setByPerson('GH')
      setNoteInput('')
      setEditingIncome(null)
      // Auto-focus after a short delay
      setTimeout(() => {
        valueInputRef.current?.focus()
      }, 100)
    }
    // Reset loading when modal closes
    if (!open) {
      setIsLoading(false)
      setEditingIncome(null)
    }
  }, [open, month, year])

  // Pre-fill form when editing
  const handleEdit = (income: Income) => {
    setEditingIncome(income)
    setValueInput((income.value / 1000).toString())
    setByPerson(income.by_person)
    setNoteInput(income.note || '')
    setTimeout(() => {
      valueInputRef.current?.focus()
    }, 100)
  }

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingIncome(null)
    setValueInput('')
    setByPerson('GH')
    setNoteInput('')
  }

  const prettyInput = valueInput
    ? `${parseInt(valueInput.replace(/\D/g, ''), 10).toLocaleString('vi-VN')}.000đ`
    : ''

  const handleSave = async () => {
    const num = parseInt((valueInput || '0').replace(/\D/g, ''), 10)

    if (num <= 0) {
      toast.warning('Nhập số tiền hợp lệ nhé!')
      return
    }

    setIsLoading(true)

    try {
      const amount = num * 1000

      if (editingIncome && onUpdate) {
        await onUpdate(editingIncome.id, amount, byPerson, noteInput.trim() || undefined)
        toast.success('Đã cập nhật thu nhập', {
          description: 'Thu nhập đã được cập nhật thành công',
          duration: 2500,
        })
        handleCancelEdit()
      } else {
        await onAdd(month, year, amount, byPerson, noteInput.trim() || undefined)
        toast.success('Đã thêm thu nhập', {
          description: 'Thu nhập đã được thêm thành công',
          duration: 2500,
        })
        setValueInput('')
        setByPerson('GH')
        setNoteInput('')
      }
    } catch (error) {
      toast.error('Lỗi', {
        description: 'Có lỗi xảy ra, vui lòng thử lại',
        duration: 2500,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (income: Income) => {
    if (!onDelete) return

    if (!confirm(`Xóa thu nhập ${income.by_person === 'GH' ? 'GH' : 'TM'}: ${formatVND(income.value)}?`)) {
      return
    }

    try {
      await onDelete(income.id)
      toast.success('Đã xóa thu nhập', {
        duration: 2500,
      })
    } catch (error) {
      toast.error('Lỗi', {
        description: 'Không thể xóa thu nhập',
        duration: 2500,
      })
    }
  }

  const monthNames = [
    'Tháng 1',
    'Tháng 2',
    'Tháng 3',
    'Tháng 4',
    'Tháng 5',
    'Tháng 6',
    'Tháng 7',
    'Tháng 8',
    'Tháng 9',
    'Tháng 10',
    'Tháng 11',
    'Tháng 12',
  ]

  const totalForSelectedMonth = selectedMonthIncomes.reduce(
    (sum, i) => sum + i.value,
    0
  )

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 z-[1000]"
          />

          {/* Desktop Modal - Centered Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="hidden md:block fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-cream rounded-2xl shadow-[0_8px_32px_rgba(111,143,95,0.16)] z-[1001] max-h-[85vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold text-dark-olive mb-6 text-center md:text-left">
              {editingIncome ? 'Chỉnh sửa' : 'Thêm'} thu nhập {monthNames[month]} {year}
            </h3>

            {/* Existing Incomes List */}
            {selectedMonthIncomes.length > 0 && (
              <div className="mb-6">
                <div className="text-sm font-medium text-olive-grey mb-3">
                  Thu nhập đã thêm ({selectedMonthIncomes.length}): Tổng {formatVND(totalForSelectedMonth)}
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedMonthIncomes.map((income) => (
                    <div
                      key={income.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-warm-linen border border-olive-grey/10"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium text-dark-olive">
                            {income.by_person}: {formatVND(income.value)}
                          </span>
                        </div>
                        {income.note && (
                          <div className="text-xs text-olive-grey mt-1">{income.note}</div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(income)}
                          className="p-1.5 rounded hover:bg-sage/50 transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit2 size={16} className="text-avocado-green" />
                        </button>
                        {onDelete && (
                          <button
                            onClick={() => handleDelete(income)}
                            className="p-1.5 rounded hover:bg-red-50 transition-colors"
                            title="Xóa"
                          >
                            <Trash2 size={16} className="text-red-500" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Form */}
            <div className="mb-5">
              <label className="block mb-2 text-olive-grey text-[13px] font-medium">
                Số tiền
              </label>
              <div className="relative">
                <Input
                  ref={valueInputRef}
                  value={valueInput}
                  onChange={(e) => setValueInput(e.target.value)}
                  placeholder="Nhập số (tự + .000đ)"
                  inputMode="numeric"
                  className="pr-32 text-base"
                />
                {prettyInput && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-olive-grey text-[13px] pointer-events-none">
                    {prettyInput}
                  </span>
                )}
              </div>
            </div>

            <div className="mb-5">
              <label className="block mb-2 text-olive-grey text-[13px] font-medium">
                Của ai
              </label>
              <Select
                value={byPerson}
                onChange={(e) => setByPerson(e.target.value as 'GH' | 'TM')}
                className="w-full text-base"
              >
                <option value="GH">GH</option>
                <option value="TM">TM</option>
              </Select>
            </div>

            <div className="mb-5">
              <label className="block mb-2 text-olive-grey text-[13px] font-medium">
                Ghi chú (tùy chọn)
              </label>
              <Input
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="VD: Lương tháng 1, Thưởng..."
                className="text-base"
              />
            </div>

            <div className="mb-5 grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-2 text-olive-grey text-[13px] font-medium">
                  Tháng
                </label>
                <Select
                  value={month}
                  onChange={(e) => setMonth(parseInt(e.target.value, 10))}
                  className="w-full text-base"
                >
                  {monthNames.map((name, idx) => (
                    <option key={idx} value={idx}>
                      {name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="block mb-2 text-olive-grey text-[13px] font-medium">
                  Năm
                </label>
                <Input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value, 10) || new Date().getFullYear())}
                  min={2020}
                  max={2100}
                  className="text-base"
                />
              </div>
            </div>

            <div className="mt-7 flex gap-3 pb-2">
              {editingIncome && (
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                  className="h-12"
                  disabled={isLoading}
                >
                  Huỷ chỉnh sửa
                </Button>
              )}
              <Button
                variant="outline"
                onClick={onClose}
                className={editingIncome ? 'flex-1 h-12' : 'h-12'}
                disabled={isLoading}
              >
                Đóng
              </Button>
              <Button
                variant="default"
                onClick={handleSave}
                className="flex-1 h-12"
                disabled={isLoading || !valueInput}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang lưu...
                  </>
                ) : editingIncome ? (
                  'Cập nhật'
                ) : (
                  <>
                    <Plus size={16} className="mr-2" />
                    Thêm
                  </>
                )}
              </Button>
            </div>
          </motion.div>

          {/* Mobile Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="md:hidden fixed bottom-0 left-0 right-0 bg-cream rounded-t-3xl shadow-[0_-4px_24px_rgba(111,143,95,0.12)] z-[1001] max-h-[90vh] overflow-y-auto p-6"
            style={{
              paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle bar - only on mobile */}
            <div className="w-10 h-1 bg-olive-grey rounded-sm mx-auto mb-5 opacity-40" />

            <h3 className="text-xl font-semibold text-dark-olive mb-6 text-center">
              {editingIncome ? 'Chỉnh sửa' : 'Thêm'} thu nhập {monthNames[month]} {year}
            </h3>

            {/* Existing Incomes List */}
            {selectedMonthIncomes.length > 0 && (
              <div className="mb-6">
                <div className="text-sm font-medium text-olive-grey mb-3">
                  Thu nhập đã thêm ({selectedMonthIncomes.length}): Tổng {formatVND(totalForSelectedMonth)}
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedMonthIncomes.map((income) => (
                    <div
                      key={income.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-warm-linen border border-olive-grey/10"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium text-dark-olive">
                            {income.by_person}: {formatVND(income.value)}
                          </span>
                        </div>
                        {income.note && (
                          <div className="text-xs text-olive-grey mt-1">{income.note}</div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(income)}
                          className="p-1.5 rounded hover:bg-sage/50 transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit2 size={16} className="text-avocado-green" />
                        </button>
                        {onDelete && (
                          <button
                            onClick={() => handleDelete(income)}
                            className="p-1.5 rounded hover:bg-red-50 transition-colors"
                            title="Xóa"
                          >
                            <Trash2 size={16} className="text-red-500" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Form */}
            <div className="mb-5">
              <label className="block mb-2 text-olive-grey text-[13px] font-medium">
                Số tiền
              </label>
              <div className="relative">
                <Input
                  ref={valueInputRef}
                  value={valueInput}
                  onChange={(e) => setValueInput(e.target.value)}
                  placeholder="Nhập số (tự + .000đ)"
                  inputMode="numeric"
                  className="pr-32 text-base"
                />
                {prettyInput && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-olive-grey text-[13px] pointer-events-none">
                    {prettyInput}
                  </span>
                )}
              </div>
            </div>

            <div className="mb-5">
              <label className="block mb-2 text-olive-grey text-[13px] font-medium">
                Của ai
              </label>
              <Select
                value={byPerson}
                onChange={(e) => setByPerson(e.target.value as 'GH' | 'TM')}
                className="w-full text-base"
              >
                <option value="GH">GH</option>
                <option value="TM">TM</option>
              </Select>
            </div>

            <div className="mb-5">
              <label className="block mb-2 text-olive-grey text-[13px] font-medium">
                Ghi chú (tùy chọn)
              </label>
              <Input
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="VD: Lương tháng 1, Thưởng..."
                className="text-base"
              />
            </div>

            <div className="mb-5 grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-2 text-olive-grey text-[13px] font-medium">
                  Tháng
                </label>
                <Select
                  value={month}
                  onChange={(e) => setMonth(parseInt(e.target.value, 10))}
                  className="w-full text-base"
                >
                  {monthNames.map((name, idx) => (
                    <option key={idx} value={idx}>
                      {name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="block mb-2 text-olive-grey text-[13px] font-medium">
                  Năm
                </label>
                <Input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value, 10) || new Date().getFullYear())}
                  min={2020}
                  max={2100}
                  className="text-base"
                />
              </div>
            </div>

            <div className="mt-7 flex gap-3 pb-2">
              {editingIncome && (
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                  className="h-12"
                  disabled={isLoading}
                >
                  Huỷ
                </Button>
              )}
              <Button
                variant="outline"
                onClick={onClose}
                className={editingIncome ? 'flex-1 h-12' : 'h-12'}
                disabled={isLoading}
              >
                Đóng
              </Button>
              <Button
                variant="default"
                onClick={handleSave}
                className="flex-1 h-12"
                disabled={isLoading || !valueInput}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang lưu...
                  </>
                ) : editingIncome ? (
                  'Cập nhật'
                ) : (
                  <>
                    <Plus size={16} className="mr-2" />
                    Thêm
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
