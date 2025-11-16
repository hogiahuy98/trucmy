'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Plus, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Dish, TodayMeal } from '../types'

interface EditTodayMenuModalProps {
  open: boolean
  onClose: () => void
  todayMeals: TodayMeal[]
  onRemove: (todayMealId: number) => Promise<void>
  onAdd: (dishId: number) => Promise<void>
  allDishes: Dish[]
}

export default function EditTodayMenuModal({
  open,
  onClose,
  todayMeals,
  onRemove,
  onAdd,
  allDishes,
}: EditTodayMenuModalProps) {
  const [isRemoving, setIsRemoving] = useState<number | null>(null)
  const [showAddMenu, setShowAddMenu] = useState(false)

  const handleRemove = async (todayMealId: number) => {
    setIsRemoving(todayMealId)
    try {
      await onRemove(todayMealId)
      toast.success('Đã xóa món 🌿', {
        duration: 1600,
      })
    } catch (error) {
      console.error('Failed to remove meal:', error)
      toast.error('Có lỗi xảy ra', {
        duration: 2000,
      })
    } finally {
      setIsRemoving(null)
    }
  }

  const handleAdd = async (dishId: number) => {
    try {
      await onAdd(dishId)
      toast.success('Đã thêm món 🥑✨', {
        duration: 1600,
      })
      setShowAddMenu(false)
    } catch (error) {
      console.error('Failed to add meal:', error)
      toast.error('Có lỗi xảy ra', {
        duration: 2000,
      })
    }
  }

  const categoryEmojis: Record<string, string> = {
    nước: '🍜',
    khô: '🍛',
    healthy: '🥗',
    nhanh: '🍳',
    khác: '✏️',
  }

  const todayDishes = todayMeals
    .map((m) => m.dish)
    .filter((d): d is Dish => d !== undefined)

  // Get dishes not already in today
  const availableDishes = allDishes.filter(
    (d) => !todayDishes.some((td) => td.id === d.id)
  )

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

          {/* Mobile Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30, duration: 0.28 }}
            className="md:hidden fixed bottom-0 left-0 right-0 bg-cream rounded-t-[24px] shadow-[0_-4px_24px_rgba(0,0,0,0.05)] z-[1001] max-h-[85vh] overflow-y-auto"
            style={{
              paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle bar */}
            <div className="w-9 h-1 bg-[#C8C2BA] rounded-sm mx-auto mt-4 mb-6 opacity-60" />

            <div className="px-6 pb-6">
              {/* Header */}
              <h2 className="text-xl font-semibold text-dark-olive mb-6">
                Chỉnh món hôm nay
              </h2>

              {/* Today's meals */}
              <div className="space-y-2 mb-4">
                {todayDishes.map((dish) => {
                  const todayMeal = todayMeals.find((m) => m.dish?.id === dish.id)
                  if (!todayMeal) return null

                  return (
                    <div
                      key={dish.id}
                      className="flex items-center gap-3 p-3 rounded-[12px] bg-warm-linen"
                    >
                      <span className="text-xl">
                        {dish.emoji || categoryEmojis[dish.category] || '🍽️'}
                      </span>
                      <span className="text-dark-olive font-medium flex-1">
                        {dish.name}
                      </span>
                      <button
                        onClick={() => handleRemove(todayMeal.id)}
                        disabled={isRemoving === todayMeal.id}
                        className="p-1.5 rounded-[8px] text-coral-soft hover:bg-coral-soft/10 transition-colors disabled:opacity-50"
                      >
                        {isRemoving === todayMeal.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <X size={18} strokeWidth={2} />
                        )}
                      </button>
                    </div>
                  )
                })}
              </div>

              {/* Add menu */}
              {showAddMenu ? (
                <div className="mb-4">
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {availableDishes.length === 0 ? (
                      <p className="text-olive-grey text-sm text-center py-4">
                        Không còn món nào để thêm
                      </p>
                    ) : (
                      availableDishes.map((dish) => (
                        <button
                          key={dish.id}
                          onClick={() => handleAdd(dish.id)}
                          className="w-full flex items-center gap-3 p-3 rounded-[12px] bg-sage hover:bg-sage/80 transition-colors text-left"
                        >
                          <span className="text-xl">
                            {dish.emoji || categoryEmojis[dish.category] || '🍽️'}
                          </span>
                          <span className="text-dark-olive font-medium flex-1">
                            {dish.name}
                          </span>
                          <Plus size={18} strokeWidth={2} className="text-avocado-green" />
                        </button>
                      ))
                    )}
                  </div>
                  <button
                    onClick={() => setShowAddMenu(false)}
                    className="mt-3 text-olive-grey text-sm"
                  >
                    Đóng
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddMenu(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-[12px] bg-avocado-green/20 text-avocado-green font-medium mb-4"
                >
                  <Plus size={18} strokeWidth={2} />
                  Thêm món
                </button>
              )}

              {/* Actions */}
              <Button
                onClick={onClose}
                className="w-full bg-avocado-green hover:bg-avocado-green/90 text-white font-medium rounded-[14px]"
              >
                Lưu
              </Button>
            </div>
          </motion.div>

          {/* Desktop Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="hidden md:block fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-cream rounded-[20px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] z-[1001] max-h-[85vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <h2 className="text-xl font-semibold text-dark-olive mb-6">
              Chỉnh món hôm nay
            </h2>

            {/* Today's meals */}
            <div className="space-y-2 mb-4">
              {todayDishes.map((dish) => {
                const todayMeal = todayMeals.find((m) => m.dish?.id === dish.id)
                if (!todayMeal) return null

                return (
                  <div
                    key={dish.id}
                    className="flex items-center gap-3 p-3 rounded-[12px] bg-warm-linen"
                  >
                    <span className="text-xl">
                      {dish.emoji || categoryEmojis[dish.category] || '🍽️'}
                    </span>
                    <span className="text-dark-olive font-medium flex-1">
                      {dish.name}
                    </span>
                    <button
                      onClick={() => handleRemove(todayMeal.id)}
                      disabled={isRemoving === todayMeal.id}
                      className="p-1.5 rounded-[8px] text-coral-soft hover:bg-coral-soft/10 transition-colors disabled:opacity-50"
                    >
                      {isRemoving === todayMeal.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <X size={18} strokeWidth={2} />
                      )}
                    </button>
                  </div>
                )
              })}
            </div>

            {/* Add menu */}
            {showAddMenu ? (
              <div className="mb-4">
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {availableDishes.length === 0 ? (
                    <p className="text-olive-grey text-sm text-center py-4">
                      Không còn món nào để thêm
                    </p>
                  ) : (
                    availableDishes.map((dish) => (
                      <button
                        key={dish.id}
                        onClick={() => handleAdd(dish.id)}
                        className="w-full flex items-center gap-3 p-3 rounded-[12px] bg-sage hover:bg-sage/80 transition-colors text-left"
                      >
                        <span className="text-xl">
                          {dish.emoji || categoryEmojis[dish.category] || '🍽️'}
                        </span>
                        <span className="text-dark-olive font-medium flex-1">
                          {dish.name}
                        </span>
                        <Plus size={18} strokeWidth={2} className="text-avocado-green" />
                      </button>
                    ))
                  )}
                </div>
                <button
                  onClick={() => setShowAddMenu(false)}
                  className="mt-3 text-olive-grey text-sm"
                >
                  Đóng
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAddMenu(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-[12px] bg-avocado-green/20 text-avocado-green font-medium mb-4"
              >
                <Plus size={18} strokeWidth={2} />
                Thêm món
              </button>
            )}

            {/* Actions */}
            <Button
              onClick={onClose}
              className="w-full bg-avocado-green hover:bg-avocado-green/90 text-white font-medium rounded-[14px]"
            >
              Lưu
            </Button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

