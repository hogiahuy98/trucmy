'use client'

import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import type { Dish } from '../types'

interface TodayMealSummaryProps {
  dishes: Dish[]
  onAddClick: () => void
  onEditClick: () => void
}

export default function TodayMealSummary({
  dishes,
  onAddClick,
  onEditClick,
}: TodayMealSummaryProps) {
  const categoryEmojis: Record<string, string> = {
    nước: '🍜',
    khô: '🍛',
    healthy: '🥗',
    nhanh: '🍳',
    khác: '✏️',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: 0.05 }}
      className="rounded-[20px] p-6 mb-5"
      style={{ backgroundColor: '#D8E2D0' }} // sage
    >
      {dishes.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-dark-olive text-[15px] mb-4 leading-relaxed">
            Hôm nay chưa chọn món nào — mình thêm món nhé 🌱
          </p>
          <button
            onClick={onAddClick}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[14px] bg-avocado-green text-white font-medium text-[15px] transition-transform active:scale-95"
          >
            <Plus size={18} strokeWidth={2} />
            Chọn món hôm nay
          </button>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <h2 className="text-dark-olive font-semibold text-lg mb-3">
              Hôm nay tụi mình ăn 🥑
            </h2>
            <div className="space-y-2">
              {dishes.map((dish) => (
                <div
                  key={dish.id}
                  className="flex items-center gap-3 py-2"
                >
                  <span className="text-2xl">
                    {dish.emoji || categoryEmojis[dish.category] || '🍽️'}
                  </span>
                  <span className="text-dark-olive font-medium flex-1">
                    {dish.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={onAddClick}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[14px] bg-avocado-green text-white font-medium text-[15px] transition-transform active:scale-95"
            >
              <Plus size={16} strokeWidth={2} />
              Thêm món
            </button>
            <button
              onClick={onEditClick}
              className="px-4 py-2.5 rounded-[14px] bg-warm-linen text-dark-olive font-medium text-[15px] transition-transform active:scale-95"
            >
              Chỉnh sửa
            </button>
          </div>
        </>
      )}
    </motion.div>
  )
}

