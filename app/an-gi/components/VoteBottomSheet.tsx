'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Dish, UserRole } from '../types'

interface VoteBottomSheetProps {
  open: boolean
  onClose: () => void
  dishes: Dish[]
  userRole: UserRole
  currentVote?: { dish_id: number }
  onSubmit: (dishId: number) => Promise<void>
}

const categoryEmojis: Record<string, string> = {
  nước: '🍜',
  khô: '🍛',
  healthy: '🥗',
  nhanh: '🍳',
  khác: '✏️',
}

export default function VoteBottomSheet({
  open,
  onClose,
  dishes,
  userRole,
  currentVote,
  onSubmit,
}: VoteBottomSheetProps) {
  const [selectedDishId, setSelectedDishId] = useState<number | null>(
    currentVote?.dish_id || null
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setSelectedDishId(currentVote?.dish_id || null)
    }
  }, [open, currentVote])

  const handleSubmit = async () => {
    if (!selectedDishId) {
      toast.error('Mình chọn món trước nha 🌱', {
        duration: 2000,
      })
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(selectedDishId)
      toast.success('Đã vote rồi nha 💚', {
        duration: 1600,
      })
      onClose()
    } catch (error) {
      console.error('Failed to submit vote:', error)
      toast.error('Có lỗi xảy ra', {
        duration: 2000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (dishes.length === 0) {
    return null
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
              <h2 className="text-xl font-semibold text-dark-olive mb-6 text-center">
                Bữa nay mình ăn món gì nè? 🥑
              </h2>

              {/* Dishes List */}
              <div className="space-y-2 mb-6">
                {dishes.map((dish) => {
                  const isSelected = selectedDishId === dish.id
                  return (
                    <motion.button
                      key={dish.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedDishId(dish.id)}
                      className={`w-full flex items-center gap-3 p-4 rounded-[16px] text-left transition-all ${
                        isSelected
                          ? 'bg-avocado-green/20 border-2 border-avocado-green'
                          : 'bg-warm-linen border-2 border-transparent'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          isSelected
                            ? 'border-avocado-green bg-avocado-green'
                            : 'border-olive-grey/40'
                        }`}
                      >
                        {isSelected && (
                          <div className="w-2.5 h-2.5 rounded-full bg-white" />
                        )}
                      </div>
                      <span className="text-2xl flex-shrink-0">
                        {dish.emoji || categoryEmojis[dish.category] || '🍽️'}
                      </span>
                      <span className="text-dark-olive font-medium text-[15px] flex-1">
                        {dish.name}
                      </span>
                    </motion.button>
                  )
                })}
              </div>

              {/* CTA Button */}
              <Button
                onClick={handleSubmit}
                disabled={!selectedDishId || isSubmitting}
                className="w-full bg-avocado-green hover:bg-avocado-green/90 text-white font-medium rounded-[14px] h-12"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang gửi...
                  </>
                ) : (
                  'Gửi vote 💚'
                )}
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
            <h2 className="text-xl font-semibold text-dark-olive mb-6 text-center">
              Bữa nay mình ăn món gì nè? 🥑
            </h2>

            {/* Dishes List */}
            <div className="space-y-2 mb-6">
              {dishes.map((dish) => {
                const isSelected = selectedDishId === dish.id
                return (
                  <motion.button
                    key={dish.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedDishId(dish.id)}
                    className={`w-full flex items-center gap-3 p-4 rounded-[16px] text-left transition-all ${
                      isSelected
                        ? 'bg-avocado-green/20 border-2 border-avocado-green'
                        : 'bg-warm-linen border-2 border-transparent'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        isSelected
                          ? 'border-avocado-green bg-avocado-green'
                          : 'border-olive-grey/40'
                      }`}
                    >
                      {isSelected && (
                        <div className="w-2.5 h-2.5 rounded-full bg-white" />
                      )}
                    </div>
                    <span className="text-2xl flex-shrink-0">
                      {dish.emoji || categoryEmojis[dish.category] || '🍽️'}
                    </span>
                    <span className="text-dark-olive font-medium text-[15px] flex-1">
                      {dish.name}
                    </span>
                  </motion.button>
                )
              })}
            </div>

            {/* CTA Button */}
            <Button
              onClick={handleSubmit}
              disabled={!selectedDishId || isSubmitting}
              className="w-full bg-avocado-green hover:bg-avocado-green/90 text-white font-medium rounded-[14px] h-12"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                'Gửi vote 💚'
              )}
            </Button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

