'use client'

import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import type { Dish } from '../types'

interface FavoriteDishesProps {
  dishes: Dish[]
  onAdd: (dishId: number) => void
}

export default function FavoriteDishes({
  dishes,
  onAdd,
}: FavoriteDishesProps) {
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
      transition={{ duration: 0.22, delay: 0.15 }}
      className="mb-5 "
    >
      <h2 className="text-dark-olive font-semibold text-lg mb-3 px-1">
        Món quen thuộc
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {dishes.map((dish) => (
          <motion.div
            key={dish.id}
            whileTap={{ scale: 0.98 }}
            className="rounded-[16px] p-4 bg-warm-linen flex flex-col justify-between"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">
                {dish.emoji || categoryEmojis[dish.category] || '🍽️'}
              </span>
              <span className="text-dark-olive font-medium text-[15px] flex-1">
                {dish.name}
              </span>
            </div>
            <button
              onClick={() => handleAdd(dish.id)}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-avocado-green/20 text-avocado-green font-medium text-start text-[14px] transition-transform active:scale-95"
            >
              <Plus size={14} strokeWidth={2} />
            </button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

