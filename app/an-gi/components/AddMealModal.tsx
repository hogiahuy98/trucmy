'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { MealCategory } from '../types'

interface AddMealModalProps {
  open: boolean
  onClose: () => void
  onAdd: (dish: {
    name: string
    category: MealCategory
    emoji?: string
    note?: string
    is_favorite?: boolean
    is_wishlist?: boolean
    wishlist_note?: string
  }) => Promise<void>
}

const CATEGORIES: { value: MealCategory; label: string; emoji: string }[] = [
  { value: 'nước', label: 'Nước', emoji: '🍜' },
  { value: 'khô', label: 'Khô', emoji: '🍛' },
  { value: 'healthy', label: 'Healthy', emoji: '🥗' },
  { value: 'nhanh', label: 'Nhanh', emoji: '🍳' },
  { value: 'khác', label: 'Khác', emoji: '✏️' },
]

export default function AddMealModal({
  open,
  onClose,
  onAdd,
}: AddMealModalProps) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState<MealCategory>('khác')
  const [emoji, setEmoji] = useState('')
  const [note, setNote] = useState('')
  const [isFavorite, setIsFavorite] = useState(false)
  const [isWishlist, setIsWishlist] = useState(false)
  const [wishlistNote, setWishlistNote] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [shake, setShake] = useState(false)
  const nameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      // Reset form
      setName('')
      setCategory('khác')
      setEmoji('')
      setNote('')
      setIsFavorite(false)
      setIsWishlist(false)
      setWishlistNote('')
      setIsLoading(false)
      setShake(false)
      
      // Focus name input after animation
      setTimeout(() => {
        nameInputRef.current?.focus()
      }, 300)
    }
  }, [open])

  const handleSubmit = async () => {
    if (!name.trim()) {
      setShake(true)
      setTimeout(() => setShake(false), 600)
      toast.error('Mình cần tên món nha 🌱', {
        duration: 2000,
      })
      return
    }

    setIsLoading(true)
    try {
      await onAdd({
        name: name.trim(),
        category,
        emoji: emoji.trim() || undefined,
        note: note.trim() || undefined,
        is_favorite: isFavorite,
        is_wishlist: isWishlist,
        wishlist_note: isWishlist && wishlistNote.trim() ? wishlistNote.trim() : undefined,
      })
      
      toast.success('Thêm món thành công — cảm ơn vì chia sẻ cùng nhau 🥑✨', {
        duration: 2000,
      })
      
      onClose()
    } catch (error) {
      console.error('Failed to add dish:', error)
      toast.error('Có lỗi xảy ra, thử lại nha 🌱', {
        duration: 2000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
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
              <h2 className="text-xl font-semibold text-dark-olive mb-6">
                Thêm món mới
              </h2>

              {/* Form */}
              <div className="space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-dark-olive mb-2">
                    Tên món <span className="text-coral-soft">*</span>
                  </label>
                  <motion.div
                    animate={shake ? { x: [-6, 6, -6, 6, 0] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    <Input
                      ref={nameInputRef}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ví dụ: Phở bò, Salad bò..."
                      className="w-full"
                    />
                  </motion.div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-dark-olive mb-3">
                    Phân loại món
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.value}
                        onClick={() => setCategory(cat.value)}
                        className={`px-4 py-2.5 rounded-[14px] font-medium text-[15px] transition-all ${
                          category === cat.value
                            ? 'bg-avocado-green text-white'
                            : 'bg-warm-linen text-dark-olive'
                        }`}
                      >
                        <span className="mr-2">{cat.emoji}</span>
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Emoji (optional) */}
                <div>
                  <label className="block text-sm font-medium text-dark-olive mb-2">
                    Emoji (tùy chọn)
                  </label>
                  <Input
                    value={emoji}
                    onChange={(e) => setEmoji(e.target.value)}
                    placeholder="🍜"
                    maxLength={2}
                    className="w-full"
                  />
                </div>

                {/* Note (optional) */}
                <div>
                  <label className="block text-sm font-medium text-dark-olive mb-2">
                    Ghi chú (tùy chọn)
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Ghi chú về món này..."
                    rows={3}
                    className="w-full px-3 py-2 rounded-[12px] border border-olive-grey/20 bg-white text-dark-olive placeholder:text-olive-grey resize-none focus:outline-none focus:ring-2 focus:ring-avocado-green/30"
                  />
                </div>

                {/* Favorite & Wishlist Toggles */}
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setIsFavorite(!isFavorite)}
                    className={`w-full flex items-center justify-between p-3 rounded-[12px] transition-all ${
                      isFavorite
                        ? 'bg-avocado-green/20 border-2 border-avocado-green'
                        : 'bg-warm-linen border-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">⭐</span>
                      <span className="text-dark-olive font-medium text-[15px]">
                        Món quen thuộc
                      </span>
                    </div>
                    <div
                      className={`w-10 h-6 rounded-full transition-colors ${
                        isFavorite ? 'bg-avocado-green' : 'bg-olive-grey/30'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                          isFavorite ? 'translate-x-4' : 'translate-x-0.5'
                        }`}
                        style={{ marginTop: '2px' }}
                      />
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsWishlist(!isWishlist)}
                    className={`w-full flex items-center justify-between p-3 rounded-[12px] transition-all ${
                      isWishlist
                        ? 'bg-coral-soft/20 border-2 border-coral-soft'
                        : 'bg-warm-linen border-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">💫</span>
                      <span className="text-dark-olive font-medium text-[15px]">
                        Món muốn thử
                      </span>
                    </div>
                    <div
                      className={`w-10 h-6 rounded-full transition-colors ${
                        isWishlist ? 'bg-coral-soft' : 'bg-olive-grey/30'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                          isWishlist ? 'translate-x-4' : 'translate-x-0.5'
                        }`}
                        style={{ marginTop: '2px' }}
                      />
                    </div>
                  </button>

                  {isWishlist && (
                    <div>
                      <label className="block text-sm font-medium text-dark-olive mb-2">
                        Ghi chú (tùy chọn)
                      </label>
                      <Input
                        value={wishlistNote}
                        onChange={(e) => setWishlistNote(e.target.value)}
                        placeholder="Ví dụ: Từ TikTok, Vợ thích..."
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1"
                  disabled={isLoading}
                >
                  Huỷ
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading || !name.trim()}
                  className="flex-1 bg-avocado-green hover:bg-avocado-green/90 text-white font-medium rounded-[14px]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    'Lưu món'
                  )}
                </Button>
              </div>
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
              Thêm món mới
            </h2>

            {/* Form */}
            <div className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-dark-olive mb-2">
                  Tên món <span className="text-coral-soft">*</span>
                </label>
                <motion.div
                  animate={shake ? { x: [-6, 6, -6, 6, 0] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <Input
                    ref={nameInputRef}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ví dụ: Phở bò, Salad bò..."
                    className="w-full"
                  />
                </motion.div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-dark-olive mb-3">
                  Phân loại món
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setCategory(cat.value)}
                      className={`px-4 py-2.5 rounded-[14px] font-medium text-[15px] transition-all ${
                        category === cat.value
                          ? 'bg-avocado-green text-white'
                          : 'bg-warm-linen text-dark-olive'
                      }`}
                    >
                      <span className="mr-2">{cat.emoji}</span>
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Emoji */}
              <div>
                <label className="block text-sm font-medium text-dark-olive mb-2">
                  Emoji (tùy chọn)
                </label>
                <Input
                  value={emoji}
                  onChange={(e) => setEmoji(e.target.value)}
                  placeholder="🍜"
                  maxLength={2}
                  className="w-full"
                />
              </div>

              {/* Note */}
              <div>
                <label className="block text-sm font-medium text-dark-olive mb-2">
                  Ghi chú (tùy chọn)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ghi chú về món này..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-[12px] border border-olive-grey/20 bg-white text-dark-olive placeholder:text-olive-grey resize-none focus:outline-none focus:ring-2 focus:ring-avocado-green/30"
                />
              </div>

              {/* Favorite & Wishlist Toggles */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`w-full flex items-center justify-between p-3 rounded-[12px] transition-all ${
                    isFavorite
                      ? 'bg-avocado-green/20 border-2 border-avocado-green'
                      : 'bg-warm-linen border-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">⭐</span>
                    <span className="text-dark-olive font-medium text-[15px]">
                      Món quen thuộc
                    </span>
                  </div>
                  <div
                    className={`w-10 h-6 rounded-full transition-colors ${
                      isFavorite ? 'bg-avocado-green' : 'bg-olive-grey/30'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                        isFavorite ? 'translate-x-4' : 'translate-x-0.5'
                      }`}
                      style={{ marginTop: '2px' }}
                    />
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setIsWishlist(!isWishlist)}
                  className={`w-full flex items-center justify-between p-3 rounded-[12px] transition-all ${
                    isWishlist
                      ? 'bg-coral-soft/20 border-2 border-coral-soft'
                      : 'bg-warm-linen border-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">💫</span>
                    <span className="text-dark-olive font-medium text-[15px]">
                      Món muốn thử
                    </span>
                  </div>
                  <div
                    className={`w-10 h-6 rounded-full transition-colors ${
                      isWishlist ? 'bg-coral-soft' : 'bg-olive-grey/30'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                        isWishlist ? 'translate-x-4' : 'translate-x-0.5'
                      }`}
                      style={{ marginTop: '2px' }}
                    />
                  </div>
                </button>

                {isWishlist && (
                  <div>
                    <label className="block text-sm font-medium text-dark-olive mb-2">
                      Ghi chú (tùy chọn)
                    </label>
                    <Input
                      value={wishlistNote}
                      onChange={(e) => setWishlistNote(e.target.value)}
                      placeholder="Ví dụ: Từ TikTok, Vợ thích..."
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1"
                disabled={isLoading}
              >
                Huỷ
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isLoading || !name.trim()}
                className="flex-1 bg-avocado-green hover:bg-avocado-green/90 text-white font-medium rounded-[14px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  'Lưu món'
                )}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

