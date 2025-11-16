'use client'

import { motion } from 'framer-motion'
import { toast } from 'sonner'
import type { Dish } from '../types'

interface QuickSuggestionsProps {
  suggestions: Dish[]
  onAdd: (dishId: number) => void
}

export default function QuickSuggestions({
  suggestions,
  onAdd,
}: QuickSuggestionsProps) {
  const handleChipClick = (dish: Dish) => {
    onAdd(dish.id)
    toast.success('Đã thêm món cho hôm nay 🥑✨', {
      duration: 1600,
    })
  }

  if (suggestions.length === 0) {
    return null
  }

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
      transition={{ duration: 0.22, delay: 0.1 }}
      className="mb-5"
    >
      <div 
        className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {suggestions.slice(0, 8).map((dish) => (
          <motion.button
            key={dish.id}
            whileTap={{ scale: 0.96 }}
            onClick={() => handleChipClick(dish)}
            className="flex-shrink-0 px-4 py-2.5 rounded-[14px] font-medium text-[15px] transition-all snap-start bg-avocado-green text-white"
          >
            <span className="mr-2">
              {dish.emoji || categoryEmojis[dish.category] || '🍽️'}
            </span>
            {dish.name}
          </motion.button>
        ))}
      </div>
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </motion.div>
  )
}

