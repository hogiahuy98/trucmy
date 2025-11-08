'use client'

import { useState } from 'react'
import { Button, DatePicker, Input, Modal, Radio, Space, Typography } from 'antd'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Coffee,
  Home,
  ShoppingCart,
  Clapperboard,
  Wifi,
  Utensils,
  Tag as TagIcon,
  Plus,
} from 'lucide-react'
import dayjs, { Dayjs } from 'dayjs'
import { notification } from 'antd'
import type { Category } from '../types'

const { Text } = Typography

const iconMap: Record<string, React.ComponentType<{ size: number }>> = {
  coffee: Coffee,
  home: Home,
  'shopping-cart': ShoppingCart,
  clapperboard: Clapperboard,
  wifi: Wifi,
  utensils: Utensils,
  tag: TagIcon,
}

interface AddExpenseModalProps {
  open: boolean
  onClose: () => void
  categories: Category[]
  onAdd: (expense: {
    id: number
    amount: number
    person: 'GH' | 'TM' | 'Both'
    category: string
    note: string
    date: Date
  }) => Promise<void>
  onAddCategory: (label: string) => Promise<void>
}

export default function AddExpenseModal({
  open,
  onClose,
  categories,
  onAdd,
  onAddCategory,
}: AddExpenseModalProps) {
  const [amountInput, setAmountInput] = useState('')
  const [category, setCategory] = useState(categories[0]?.key || 'cafe')
  const [person, setPerson] = useState<'GH' | 'TM' | 'Both'>('TM')
  const [date, setDate] = useState<Dayjs>(dayjs())
  const [note, setNote] = useState('')
  const [customCategory, setCustomCategory] = useState('')

  const prettyInput = amountInput
    ? `${parseInt(amountInput.replace(/\D/g, ''), 10).toLocaleString('vi-VN')}.000đ`
    : ''

  const handleAdd = async () => {
    const num = parseInt((amountInput || '0').replace(/\D/g, ''), 10)
    if (!num || num <= 0) {
      notification.warning({
        message: 'Nhập số tiền hợp lệ nhé!',
        placement: 'bottomRight',
      })
      return
    }

    let usedCategory = category
    if (category === 'custom') {
      const label = customCategory.trim()
      if (!label) {
        notification.warning({
          message: 'Nhập tên danh mục',
          placement: 'bottomRight',
        })
        return
      }
      await onAddCategory(label)
      usedCategory = label.trim().toLowerCase().replace(/\s+/g, '-')
    }

    const amount = num * 1000
    const payload = {
      id: Date.now(),
      amount,
      person,
      category: usedCategory,
      note: note.trim(),
      date: date.toDate(),
    }

    await onAdd(payload)
    onClose()
    setAmountInput('')
    setNote('')
    setCustomCategory('')

    const catObj = categories.find((c) => c.key === usedCategory)
    const label = catObj?.label || customCategory || usedCategory
    notification.success({
      message: `Đã ghi: ${person} – ${amount.toLocaleString('vi-VN')}đ – ${label}`,
      placement: 'bottomRight',
    })
  }

  return (
    <AnimatePresence>
      {open && (
        <Modal
          open
          onCancel={onClose}
          footer={null}
          centered
          width={520}
          className="[&_.ant-modal-content]:rounded-2xl [&_.ant-modal-content]:border [&_.ant-modal-content]:border-slate-100 [&_.ant-modal-content]:shadow-[0_16px_60px_rgba(15,23,42,0.12)]"
          destroyOnClose
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 160, damping: 18 }}
          >
            <div className="text-lg font-extrabold text-slate-900 mb-3">
              Thêm chi tiêu
            </div>
            <div className="mb-3">
              <Text type="secondary" className="block mb-0">
                Số tiền
              </Text>
              <Input
                size="large"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                placeholder="Nhập số (tự + .000đ)"
                suffix={
                  <span className="text-slate-400">{prettyInput}</span>
                }
                className="[&_.ant-input]:rounded-[10px]"
                inputMode="numeric"
              />
            </div>

            <div className="mt-3">
              <Text type="secondary" className="block mb-0">
                Danh mục
              </Text>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-2 mt-1.5">
                {categories.map((c) => {
                  const Icon = iconMap[c.icon]
                  const active = category === c.key
                  return (
                    <motion.button
                      key={c.key}
                      type="button"
                      className={`inline-flex items-center gap-1.5 py-2 px-2.5 border rounded-full flex-none transition-colors ${
                        active ? 'font-bold' : ''
                      }`}
                      onClick={() => setCategory(c.key)}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        borderColor: active ? c.color : '#e5e7eb',
                        backgroundColor: active ? `${c.color}22` : '#fff',
                        color: active ? c.color : '#64748b',
                      }}
                    >
                      <Icon size={16} /> {c.label}
                    </motion.button>
                  )
                })}
                <motion.button
                  type="button"
                  className={`inline-flex items-center gap-1.5 py-2 px-2.5 border rounded-full flex-none transition-colors ${
                    category === 'custom' ? 'font-bold' : ''
                  }`}
                  onClick={() => setCategory('custom')}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    borderColor: category === 'custom' ? '#94A3B8' : '#e5e7eb',
                    backgroundColor:
                      category === 'custom' ? '#94A3B822' : '#fff',
                    color: '#64748b',
                  }}
                >
                  <Plus size={16} /> Thêm
                </motion.button>
              </div>
              {category === 'custom' && (
                <Input
                  className="mt-2! py-2!"
                  placeholder="Tên danh mục mới"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                />
              )}
            </div>

            <div className="mt-3">
              <Space className="mb-0">
                <Text type="secondary" className="mr-2">
                  Người chi
                </Text>
              </Space>
              <Radio.Group
                value={person}
                onChange={(e) => setPerson(e.target.value)}
              >
                <Radio.Button value="GH">GH</Radio.Button>
                <Radio.Button value="Both">Cả 2</Radio.Button>
                <Radio.Button value="TM">TM</Radio.Button>
              </Radio.Group>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3 max-[600px]:grid-cols-1">
              <div>
                <Text type="secondary" className="block mb-0">
                  Ngày
                </Text>
                <DatePicker
                  value={date}
                  onChange={(v) => setDate(v || dayjs())}
                  format="DD/MM/YYYY"
                  className="w-full"
                />
              </div>
              <div>
                <Text type="secondary" className="block mb-0">
                  Ghi chú
                </Text>
                <Input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Tuỳ chọn"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <Button onClick={onClose}>Huỷ</Button>
              <Button type="primary" onClick={handleAdd}>
                Ghi lại
              </Button>
            </div>
          </motion.div>
        </Modal>
      )}
    </AnimatePresence>
  )
}

