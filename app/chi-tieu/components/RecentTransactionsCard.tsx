'use client'

import { Button, Popconfirm } from 'antd'
import { Trash2 } from 'lucide-react'
import dayjs from 'dayjs'
import {
  Coffee,
  Home,
  ShoppingCart,
  Clapperboard,
  Wifi,
  Utensils,
  Tag as TagIcon,
} from 'lucide-react'
import { notification } from 'antd'
import type { Category, Expense } from '../types'
import { formatVND } from '../utils'

const iconMap: Record<string, React.ComponentType<{ size: number }>> = {
  coffee: Coffee,
  home: Home,
  'shopping-cart': ShoppingCart,
  clapperboard: Clapperboard,
  wifi: Wifi,
  utensils: Utensils,
  tag: TagIcon,
}

interface RecentTransactionsCardProps {
  expenses: Expense[]
  categories: Category[]
  onDelete: (id: number) => Promise<void>
}

export default function RecentTransactionsCard({
  expenses,
  categories,
  onDelete,
}: RecentTransactionsCardProps) {
  const handleDelete = async (id: number) => {
    await onDelete(id)
    notification.success({
      message: 'Đã xóa chi tiêu',
      placement: 'bottomRight',
    })
  }

  if (expenses.length === 0) {
    return (
      <div style={{ padding: '0 4px' }}>
        <div
          style={{
            color: '#8B8F7A',
            fontSize: '14px',
            fontWeight: 500,
            marginBottom: '12px',
            paddingLeft: '4px',
          }}
        >
          Giao dịch gần đây
        </div>
        <div
          style={{
            backgroundColor: '#EFECE6',
            borderRadius: '20px',
            padding: '40px 20px',
            textAlign: 'center',
            color: '#8B8F7A',
            fontSize: '16px',
          }}
        >
          Chưa có giao dịch. Bấm "Thêm chi tiêu" để bắt đầu
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '0 4px' }}>
      <div
        style={{
          color: '#8B8F7A',
          fontSize: '14px',
          fontWeight: 500,
          marginBottom: '12px',
          paddingLeft: '4px',
        }}
      >
        Giao dịch gần đây
      </div>
      <div
        style={{
          backgroundColor: '#EFECE6',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 2px 16px rgba(111, 143, 95, 0.08)',
        }}
      >
        {expenses.slice(0, 8).map((item, idx) => {
          const cat = categories.find((c) => c.key === item.category)
          const Icon = iconMap[cat?.icon || 'tag'] || TagIcon
          const iconColor = cat?.color || '#A3C68C'
          const isLast = idx === expenses.slice(0, 8).length - 1
          return (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '16px 20px',
                borderBottom: isLast
                  ? 'none'
                  : '1px solid rgba(139, 143, 122, 0.12)',
                gap: '12px',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  backgroundColor: `${iconColor}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon size={20} strokeWidth={1.5} style={{ color: iconColor }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '4px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '16px',
                      fontWeight: 500,
                      color: '#4A4F3B',
                    }}
                  >
                    {cat?.label || item.category}
                  </span>
                  <span style={{ color: '#8B8F7A', fontSize: '14px' }}>•</span>
                  <span
                    style={{
                      fontSize: '14px',
                      color: '#6F8F5F',
                      fontWeight: 500,
                    }}
                  >
                    {item.person}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: '14px',
                    color: '#8B8F7A',
                  }}
                >
                  {item.note || dayjs(item.date).format('DD/MM/YYYY')}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#4A4F3B',
                  }}
                >
                  {formatVND(item.amount)}
                </div>
                <Popconfirm
                  title="Xóa chi tiêu này?"
                  description="Hành động này không thể hoàn tác"
                  onConfirm={() => handleDelete(item.id)}
                  okText="Xóa"
                  cancelText="Huỷ"
                  okButtonProps={{ danger: true }}
                >
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<Trash2 size={16} strokeWidth={1.5} />}
                    style={{
                      opacity: 0.5,
                      width: '32px',
                      height: '32px',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    className="hover:opacity-100"
                  />
                </Popconfirm>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

