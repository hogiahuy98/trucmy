'use client'

import { Button, Card, List, Popconfirm, Space } from 'antd'
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
      <Card className="rounded-2xl border border-slate-100 shadow-md">
        <div className="text-sm font-medium text-slate-600 mb-4">
          Giao dịch gần đây
        </div>
        <div className="text-center py-8 text-slate-400 text-sm">
          Chưa có giao dịch. Bấm "Tốn tiền 💸" để thêm nhanh!
        </div>
      </Card>
    )
  }

  return (
    <Card className="rounded-2xl border border-slate-100 shadow-md">
      <div className="text-sm font-medium text-slate-600 mb-4">
        Giao dịch gần đây
      </div>
      <List
        dataSource={expenses.slice(0, 6)}
        renderItem={(item) => {
          const cat = categories.find((c) => c.key === item.category)
          const Icon = iconMap[cat?.icon || 'tag'] || TagIcon
          const iconColor = cat?.color || '#94A3B8'
          return (
            <List.Item className="!px-0 !py-3 border-b border-slate-100 last:border-0">
              <Space className="flex-1">
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: `${iconColor}22`,
                    color: iconColor,
                  }}
                >
                  <Icon size={16} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-sm">
                    <span className="font-medium text-slate-900">
                      {cat?.label || item.category}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-600">{item.person}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {item.note || dayjs(item.date).format('DD/MM')}
                  </div>
                </div>
              </Space>
              <Space>
                <div className="font-semibold text-slate-900">
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
                    icon={<Trash2 size={14} />}
                    className="hover:bg-red-50"
                  />
                </Popconfirm>
              </Space>
            </List.Item>
          )
        }}
      />
    </Card>
  )
}

