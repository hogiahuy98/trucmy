'use client'

import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import type { Dish } from '../types'

interface TryNewSectionProps {
  dishes: Dish[]
  onAdd: (dishId: number) => void
}

export default function TryNewSection({
  dishes,
  onAdd,
}: TryNewSectionProps) {
  const categoryEmojis: Record<string, string> = {
    nước: '🍜',
    khô: '🍛',
    healthy: '🥗',
    nhanh: '🍳',
    khác: '✏️',
  }

  if (dishes.length === 0) {
    return null
  }

  const handleAdd = (dishId: number) => {
    onAdd(dishId)
    toast.success('Đã thêm món cho hôm nay 🥑✨', {
      duration: 1600,
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: 0.2 }}
      className="mb-5"
    >
      <h2 className="text-dark-olive font-semibold text-lg mb-3 px-1">
        Món muốn thử
      </h2>
      <div className="space-y-3">
        {dishes.map((dish) => (
          <motion.div
            key={dish.id}
            whileTap={{ scale: 0.98 }}
            className="rounded-[16px] p-4"
            style={{
              backgroundColor: '#F3B48C20', // citrus peach with opacity
            }}
          >
            <div className="flex items-start gap-3 mb-3">
              <span className="text-2xl flex-shrink-0">
                {dish.emoji || categoryEmojis[dish.category] || '🍽️'}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-dark-olive font-medium text-[15px] mb-1">
                  {dish.name}
                </div>
                {dish.wishlist_note && (
                  <div className="text-olive-grey text-[13px]">
                    {dish.wishlist_note}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => handleAdd(dish.id)}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-[12px] bg-avocado-green text-white font-medium text-[14px] transition-transform active:scale-95"
            >
              <Plus size={14} strokeWidth={2} />
              Thêm vào hôm nay
            </button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

