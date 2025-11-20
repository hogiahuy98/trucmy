'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Edit2, Trash2, ArrowRightLeft } from 'lucide-react'
import { toast } from 'sonner'
import { formatVND } from '../utils'
import type { Transfer } from '../types'

interface TransferModalProps {
  open: boolean
  onClose: () => void
  currentMonthTransfers: Transfer[]
  onAdd: (amount: number, fromPerson: 'GH' | 'TM', toPerson: 'GH' | 'TM', note?: string, date?: Date) => Promise<void>
  onUpdate?: (transferId: number, amount: number, fromPerson: 'GH' | 'TM', toPerson: 'GH' | 'TM', note?: string) => Promise<void>
  onDelete?: (transferId: number) => Promise<void>
}

export default function TransferModal({
  open,
  onClose,
  currentMonthTransfers,
  onAdd,
  onUpdate,
  onDelete,
}: TransferModalProps) {
  const [valueInput, setValueInput] = useState('')
  const [fromPerson, setFromPerson] = useState<'GH' | 'TM'>('GH')
  const [toPerson, setToPerson] = useState<'GH' | 'TM'>('TM')
  const [noteInput, setNoteInput] = useState('')
  const [transferDate, setTransferDate] = useState(new Date().toISOString().split('T')[0])
  const [isLoading, setIsLoading] = useState(false)
  const [editingTransfer, setEditingTransfer] = useState<Transfer | null>(null)

  const valueInputRef = useRef<HTMLInputElement>(null)

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setValueInput('')
      setFromPerson('GH')
      setToPerson('TM')
      setNoteInput('')
      setTransferDate(new Date().toISOString().split('T')[0])
      setEditingTransfer(null)
      setTimeout(() => {
        valueInputRef.current?.focus()
      }, 100)
    }
    if (!open) {
      setIsLoading(false)
      setEditingTransfer(null)
    }
  }, [open])

  // Auto-switch toPerson when fromPerson changes
  useEffect(() => {
    if (!editingTransfer) {
      setToPerson(fromPerson === 'GH' ? 'TM' : 'GH')
    }
  }, [fromPerson, editingTransfer])

  const handleEdit = (transfer: Transfer) => {
    setEditingTransfer(transfer)
    setValueInput((transfer.amount / 1000).toString())
    setFromPerson(transfer.from_person)
    setToPerson(transfer.to_person)
    setNoteInput(transfer.note || '')
    setTransferDate(new Date(transfer.date).toISOString().split('T')[0])
    setTimeout(() => {
      valueInputRef.current?.focus()
    }, 100)
  }

  const handleCancelEdit = () => {
    setEditingTransfer(null)
    setValueInput('')
    setFromPerson('GH')
    setToPerson('TM')
    setNoteInput('')
    setTransferDate(new Date().toISOString().split('T')[0])
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

    if (fromPerson === toPerson) {
      toast.warning('Người chuyển và người nhận phải khác nhau!')
      return
    }

    setIsLoading(true)

    try {
      const amount = num * 1000
      const date = new Date(transferDate)

      if (editingTransfer && onUpdate) {
        await onUpdate(editingTransfer.id, amount, fromPerson, toPerson, noteInput.trim() || undefined)
        toast.success('Đã cập nhật chuyển tiền', {
          description: 'Giao dịch đã được cập nhật thành công',
          duration: 2500,
        })
        handleCancelEdit()
      } else {
        await onAdd(amount, fromPerson, toPerson, noteInput.trim() || undefined, date)
        toast.success('Đã thêm chuyển tiền', {
          description: `${fromPerson} → ${toPerson}: ${formatVND(amount)}`,
          duration: 2500,
        })
        setValueInput('')
        setNoteInput('')
        setTransferDate(new Date().toISOString().split('T')[0])
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

  const handleDelete = async (transfer: Transfer) => {
    if (!onDelete) return

    if (!confirm(`Xóa chuyển tiền ${transfer.from_person} → ${transfer.to_person}: ${formatVND(transfer.amount)}?`)) {
      return
    }

    try {
      await onDelete(transfer.id)
      toast.success('Đã xóa chuyển tiền', {
        duration: 2500,
      })
    } catch (error) {
      toast.error('Lỗi', {
        description: 'Không thể xóa chuyển tiền',
        duration: 2500,
      })
    }
  }

  const totalTransferred = currentMonthTransfers.reduce((sum, t) => sum + t.amount, 0)

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
              {editingTransfer ? 'Chỉnh sửa' : 'Thêm'} chuyển tiền
            </h3>

            {/* Existing Transfers List */}
            {currentMonthTransfers.length > 0 && (
              <div className="mb-6">
                <div className="text-sm font-medium text-olive-grey mb-3">
                  Chuyển tiền tháng này ({currentMonthTransfers.length}): Tổng {formatVND(totalTransferred)}
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {currentMonthTransfers.map((transfer) => (
                    <div
                      key={transfer.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-warm-linen border border-olive-grey/10"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium text-dark-olive">
                            {transfer.from_person} → {transfer.to_person}: {formatVND(transfer.amount)}
                          </span>
                        </div>
                        {transfer.note && (
                          <div className="text-xs text-olive-grey mt-1">{transfer.note}</div>
                        )}
                        <div className="text-xs text-olive-grey mt-1">
                          {new Date(transfer.date).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(transfer)}
                          className="p-1.5 rounded hover:bg-sage/50 transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit2 size={16} className="text-avocado-green" />
                        </button>
                        {onDelete && (
                          <button
                            onClick={() => handleDelete(transfer)}
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

            <div className="mb-5 grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-2 text-olive-grey text-[13px] font-medium">
                  Từ
                </label>
                <Select
                  value={fromPerson}
                  onChange={(e) => setFromPerson(e.target.value as 'GH' | 'TM')}
                  className="w-full text-base"
                >
                  <option value="GH">GH</option>
                  <option value="TM">TM</option>
                </Select>
              </div>
              <div>
                <label className="block mb-2 text-olive-grey text-[13px] font-medium">
                  Đến
                </label>
                <Select
                  value={toPerson}
                  onChange={(e) => setToPerson(e.target.value as 'GH' | 'TM')}
                  className="w-full text-base"
                  disabled={!editingTransfer}
                >
                  <option value="GH">GH</option>
                  <option value="TM">TM</option>
                </Select>
              </div>
            </div>

            <div className="mb-5">
              <label className="block mb-2 text-olive-grey text-[13px] font-medium">
                Ghi chú (tùy chọn)
              </label>
              <Input
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="VD: Hoàn tiền đi chợ..."
                className="text-base"
              />
            </div>

            <div className="mb-5">
              <label className="block mb-2 text-olive-grey text-[13px] font-medium">
                Ngày
              </label>
              <Input
                type="date"
                value={transferDate}
                onChange={(e) => setTransferDate(e.target.value)}
                className="text-base"
              />
            </div>

            <div className="mt-7 flex gap-3 pb-2">
              {editingTransfer && (
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
                className={editingTransfer ? 'flex-1 h-12' : 'h-12'}
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
                ) : editingTransfer ? (
                  'Cập nhật'
                ) : (
                  <>
                    <ArrowRightLeft size={16} className="mr-2" />
                    Chuyển tiền
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
            {/* Handle bar */}
            <div className="w-10 h-1 bg-olive-grey rounded-sm mx-auto mb-5 opacity-40" />

            <h3 className="text-xl font-semibold text-dark-olive mb-6 text-center">
              {editingTransfer ? 'Chỉnh sửa' : 'Thêm'} chuyển tiền
            </h3>

            {/* Existing Transfers List */}
            {currentMonthTransfers.length > 0 && (
              <div className="mb-6">
                <div className="text-sm font-medium text-olive-grey mb-3">
                  Chuyển tiền tháng này ({currentMonthTransfers.length}): Tổng {formatVND(totalTransferred)}
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {currentMonthTransfers.map((transfer) => (
                    <div
                      key={transfer.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-warm-linen border border-olive-grey/10"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium text-dark-olive">
                            {transfer.from_person} → {transfer.to_person}: {formatVND(transfer.amount)}
                          </span>
                        </div>
                        {transfer.note && (
                          <div className="text-xs text-olive-grey mt-1">{transfer.note}</div>
                        )}
                        <div className="text-xs text-olive-grey mt-1">
                          {new Date(transfer.date).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(transfer)}
                          className="p-1.5 rounded hover:bg-sage/50 transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit2 size={16} className="text-avocado-green" />
                        </button>
                        {onDelete && (
                          <button
                            onClick={() => handleDelete(transfer)}
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

            <div className="mb-5 grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-2 text-olive-grey text-[13px] font-medium">
                  Từ
                </label>
                <Select
                  value={fromPerson}
                  onChange={(e) => setFromPerson(e.target.value as 'GH' | 'TM')}
                  className="w-full text-base"
                >
                  <option value="GH">GH</option>
                  <option value="TM">TM</option>
                </Select>
              </div>
              <div>
                <label className="block mb-2 text-olive-grey text-[13px] font-medium">
                  Đến
                </label>
                <Select
                  value={toPerson}
                  onChange={(e) => setToPerson(e.target.value as 'GH' | 'TM')}
                  className="w-full text-base"
                  disabled={!editingTransfer}
                >
                  <option value="GH">GH</option>
                  <option value="TM">TM</option>
                </Select>
              </div>
            </div>

            <div className="mb-5">
              <label className="block mb-2 text-olive-grey text-[13px] font-medium">
                Ghi chú (tùy chọn)
              </label>
              <Input
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="VD: Hoàn tiền đi chợ..."
                className="text-base"
              />
            </div>

            <div className="mb-5">
              <label className="block mb-2 text-olive-grey text-[13px] font-medium">
                Ngày
              </label>
              <Input
                type="date"
                value={transferDate}
                onChange={(e) => setTransferDate(e.target.value)}
                className="text-base"
              />
            </div>

            <div className="mt-7 flex gap-3 pb-2">
              {editingTransfer && (
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
                className={editingTransfer ? 'flex-1 h-12' : 'h-12'}
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
                ) : editingTransfer ? (
                  'Cập nhật'
                ) : (
                  <>
                    <ArrowRightLeft size={16} className="mr-2" />
                    Chuyển tiền
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
