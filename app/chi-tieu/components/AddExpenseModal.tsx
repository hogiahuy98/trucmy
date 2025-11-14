'use client'

import { useState } from 'react'
import { Button, DatePicker, Input, Radio, Typography } from 'antd'
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

const iconMap: Record<string, React.ComponentType<{ size: number, strokeWidth: number }>> = {
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
      message: 'Đã ghi chi tiêu',
      description: `Cảm ơn vì sự chia sẻ 💛`,
      placement: 'bottomRight',
      duration: 2.5,
      style: {
        backgroundColor: '#FAF8F4',
        borderRadius: '12px',
      },
    })
  }

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
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              zIndex: 1000,
            }}
          />
          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: '#FAF8F4', // cream
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              boxShadow: '0 -4px 24px rgba(111, 143, 95, 0.12)',
              zIndex: 1001,
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '24px',
              paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
            }}
          >
            {/* Handle bar */}
            <div
              style={{
                width: '40px',
                height: '4px',
                backgroundColor: '#8B8F7A',
                borderRadius: '2px',
                margin: '0 auto 20px',
                opacity: 0.4,
              }}
            />
            <div
              style={{
                fontSize: '20px',
                fontWeight: 600,
                color: '#4A4F3B', // dark olive
                marginBottom: '24px',
                textAlign: 'center',
              }}
            >
              Thêm chi tiêu
            </div>
            <div style={{ marginBottom: '20px' }}>
              <Text
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: '#8B8F7A', // olive grey
                  fontSize: '13px',
                  fontWeight: 500,
                }}
              >
                Số tiền
              </Text>
              <Input
                size="large"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                placeholder="Nhập số (tự + .000đ)"
                suffix={
                  <span style={{ color: '#8B8F7A', fontSize: '13px' }}>
                    {prettyInput}
                  </span>
                }
                style={{
                  borderRadius: '12px',
                  backgroundColor: '#EFECE6', // warm linen
                  border: '1px solid rgba(163, 198, 140, 0.25)',
                }}
                inputMode="numeric"
              />
            </div>

            <div style={{ marginTop: '20px' }}>
              <Text
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: '#8B8F7A', // olive grey
                  fontSize: '13px',
                  fontWeight: 500,
                }}
              >
                Danh mục
              </Text>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                  gap: '8px',
                  marginTop: '8px',
                }}
              >
                {categories.map((c) => {
                  const Icon = iconMap[c.icon]
                  const active = category === c.key
                  return (
                    <motion.button
                      key={c.key}
                      type="button"
                      onClick={() => setCategory(c.key)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '10px 12px',
                        border: `1.5px solid ${active ? c.color : '#D8E2D0'}`,
                        borderRadius: '12px',
                        backgroundColor: active
                          ? `${c.color}25`
                          : '#EFECE6',
                        color: active ? c.color : '#8B8F7A',
                        fontWeight: active ? 600 : 500,
                        fontSize: '13px',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <Icon size={16} strokeWidth={1.5} /> {c.label}
                    </motion.button>
                  )
                })}
                <motion.button
                  type="button"
                  onClick={() => setCategory('custom')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 12px',
                    border: `1.5px solid ${
                      category === 'custom' ? '#A3C68C' : '#D8E2D0'
                    }`,
                    borderRadius: '12px',
                    backgroundColor:
                      category === 'custom' ? '#A3C68C25' : '#EFECE6',
                    color: category === 'custom' ? '#A3C68C' : '#8B8F7A',
                    fontWeight: category === 'custom' ? 600 : 500,
                    fontSize: '13px',
                  }}
                >
                  <Plus size={16} strokeWidth={1.5} /> Thêm
                </motion.button>
              </div>
              {category === 'custom' && (
                <Input
                  style={{
                    marginTop: '12px',
                    borderRadius: '12px',
                    backgroundColor: '#EFECE6',
                    border: '1px solid rgba(163, 198, 140, 0.25)',
                  }}
                  placeholder="Tên danh mục mới"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                />
              )}
            </div>

            <div style={{ marginTop: '20px' }}>
              <Text
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: '#8B8F7A', // olive grey
                  fontSize: '13px',
                  fontWeight: 500,
                }}
              >
                Ai chi trả?
              </Text>
              <Radio.Group
                value={person}
                onChange={(e) => setPerson(e.target.value)}
                style={{
                  display: 'flex',
                  gap: '8px',
                }}
              >
                <Radio.Button
                  value="GH"
                  style={{
                    borderRadius: '10px',
                    borderColor: '#D8E2D0',
                    backgroundColor:
                      person === 'GH' ? '#A3C68C' : '#EFECE6',
                    color: person === 'GH' ? 'white' : '#8B8F7A',
                    fontWeight: person === 'GH' ? 600 : 500,
                  }}
                >
                  GH
                </Radio.Button>
                <Radio.Button
                  value="Both"
                  style={{
                    borderRadius: '10px',
                    borderColor: '#D8E2D0',
                    backgroundColor:
                      person === 'Both' ? '#A3C68C' : '#EFECE6',
                    color: person === 'Both' ? 'white' : '#8B8F7A',
                    fontWeight: person === 'Both' ? 600 : 500,
                  }}
                >
                  Cả hai
                </Radio.Button>
                <Radio.Button
                  value="TM"
                  style={{
                    borderRadius: '10px',
                    borderColor: '#D8E2D0',
                    backgroundColor:
                      person === 'TM' ? '#A3C68C' : '#EFECE6',
                    color: person === 'TM' ? 'white' : '#8B8F7A',
                    fontWeight: person === 'TM' ? 600 : 500,
                  }}
                >
                  TM
                </Radio.Button>
              </Radio.Group>
            </div>

            <div
              style={{
                marginTop: '20px',
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
              }}
            >
              <div>
                <Text
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    color: '#8B8F7A', // olive grey
                    fontSize: '13px',
                    fontWeight: 500,
                  }}
                >
                  Ngày
                </Text>
                <DatePicker
                  value={date}
                  onChange={(v) => setDate(v || dayjs())}
                  format="DD/MM/YYYY"
                  style={{
                    width: '100%',
                    borderRadius: '12px',
                    backgroundColor: '#EFECE6',
                    border: '1px solid rgba(163, 198, 140, 0.25)',
                  }}
                />
              </div>
              <div>
                <Text
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    color: '#8B8F7A', // olive grey
                    fontSize: '13px',
                    fontWeight: 500,
                  }}
                >
                  Ghi chú
                </Text>
                <Input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Tuỳ chọn"
                  style={{
                    borderRadius: '12px',
                    backgroundColor: '#EFECE6',
                    border: '1px solid rgba(163, 198, 140, 0.25)',
                  }}
                />
              </div>
            </div>

            <div
              style={{
                marginTop: '28px',
                display: 'flex',
                gap: '12px',
                paddingBottom: '8px',
              }}
            >
              <Button
                onClick={onClose}
                style={{
                  flex: 1,
                  height: '48px',
                  borderRadius: '12px',
                  borderColor: '#D8E2D0',
                  color: '#8B8F7A',
                  fontWeight: 500,
                }}
              >
                Huỷ
              </Button>
              <motion.button
                onClick={handleAdd}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  flex: 1,
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: '#A3C68C', // avocado green
                  border: 'none',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '15px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(163, 198, 140, 0.25)',
                }}
              >
                Thêm
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

