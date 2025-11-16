'use client'

import { motion } from 'framer-motion'
import { toast } from 'sonner'
import type { Dish } from '../types'

interface RecentPicksProps {
  dishes: Dish[]
  onAdd: (dishId: number) => void
}

export default function RecentPicks({
  dishes,
  onAdd,
}: RecentPicksProps) {
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
    toast.success('Đã thêm món hôm nay 🌿', {
      duration: 1600,
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: 0.25 }}
      className="mb-5"
    >
      <h2 className="text-dark-olive font-semibold text-lg mb-3 px-1">
        Gần đây tụi mình ăn
      </h2>
      <div className="rounded-[16px] overflow-hidden bg-warm-linen">
        {dishes.map((dish, index) => (
          <motion.button
            key={dish.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleAdd(dish.id)}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors active:bg-avocado-green/10"
            style={{
              borderBottom: index < dishes.length - 1 
                ? '1px solid rgba(0, 0, 0, 0.05)' 
                : 'none',
            }}
          >
            <span className="text-xl flex-shrink-0">
              {dish.emoji || categoryEmojis[dish.category] || '🍽️'}
            </span>
            <span className="text-dark-olive font-medium text-[15px] flex-1">
              {dish.name}
            </span>
            <span className="text-olive-grey text-[13px]">→</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}

