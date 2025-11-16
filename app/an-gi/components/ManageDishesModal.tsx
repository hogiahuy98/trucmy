'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, Edit2, Trash2, Star, Sparkles, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Dish, MealCategory } from '../types'

interface ManageDishesModalProps {
  open: boolean
  onClose: () => void
  dishes: Dish[]
  onUpdate: (dishId: number, updates: Partial<Dish>) => Promise<void>
  onDelete: (dishId: number) => Promise<void>
}

const CATEGORIES: { value: MealCategory; label: string; emoji: string }[] = [
  { value: 'nước', label: 'Nước', emoji: '🍜' },
  { value: 'khô', label: 'Khô', emoji: '🍛' },
  { value: 'healthy', label: 'Healthy', emoji: '🥗' },
  { value: 'nhanh', label: 'Nhanh', emoji: '🍳' },
  { value: 'khác', label: 'Khác', emoji: '✏️' },
]

export default function ManageDishesModal({
  open,
  onClose,
  dishes,
  onUpdate,
  onDelete,
}: ManageDishesModalProps) {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editCategory, setEditCategory] = useState<MealCategory>('khác')
  const [editEmoji, setEditEmoji] = useState('')
  const [editNote, setEditNote] = useState('')
  const [editIsFavorite, setEditIsFavorite] = useState(false)
  const [editIsWishlist, setEditIsWishlist] = useState(false)
  const [editWishlistNote, setEditWishlistNote] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Reset search when modal closes
  useEffect(() => {
    if (!open) {
      setSearchQuery('')
      setEditingId(null)
      setEditName('')
      setEditCategory('khác')
      setEditEmoji('')
      setEditNote('')
      setEditIsFavorite(false)
      setEditIsWishlist(false)
      setEditWishlistNote('')
    }
  }, [open])

  // Sort dishes by name and filter by search
  const sortedDishes = [...dishes]
    .sort((a, b) => a.name.localeCompare(b.name))
    .filter((dish) =>
      dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dish.note?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dish.wishlist_note?.toLowerCase().includes(searchQuery.toLowerCase())
    )

  const categoryEmojis: Record<string, string> = {
    nước: '🍜',
    khô: '🍛',
    healthy: '🥗',
    nhanh: '🍳',
    khác: '✏️',
  }

  const startEdit = (dish: Dish) => {
    setEditingId(dish.id)
    setEditName(dish.name)
    setEditCategory(dish.category)
    setEditEmoji(dish.emoji || '')
    setEditNote(dish.note || '')
    setEditIsFavorite(dish.is_favorite)
    setEditIsWishlist(dish.is_wishlist)
    setEditWishlistNote(dish.wishlist_note || '')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditName('')
    setEditCategory('khác')
    setEditEmoji('')
    setEditNote('')
    setEditIsFavorite(false)
    setEditIsWishlist(false)
    setEditWishlistNote('')
  }

  const handleSave = async (dishId: number) => {
    if (!editName.trim()) {
      toast.error('Mình cần tên món nha 🌱', {
        duration: 2000,
      })
      return
    }

    setIsUpdating(true)
    try {
      await onUpdate(dishId, {
        name: editName.trim(),
        category: editCategory,
        emoji: editEmoji.trim() || null,
        note: editNote.trim() || null,
        is_favorite: editIsFavorite,
        is_wishlist: editIsWishlist,
        wishlist_note: editIsWishlist && editWishlistNote.trim() ? editWishlistNote.trim() : null,
      })
      toast.success('Đã cập nhật món 🥑✨', {
        duration: 1600,
      })
      cancelEdit()
    } catch (error) {
      console.error('Failed to update dish:', error)
      toast.error('Có lỗi xảy ra', {
        duration: 2000,
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async (dishId: number) => {
    if (!confirm('Bạn có chắc muốn xóa món này không?')) {
      return
    }

    setDeletingId(dishId)
    try {
      await onDelete(dishId)
      toast.success('Đã xóa món 🌿', {
        duration: 1600,
      })
    } catch (error) {
      console.error('Failed to delete dish:', error)
      toast.error('Có lỗi xảy ra', {
        duration: 2000,
      })
    } finally {
      setDeletingId(null)
    }
  }

  const handleToggleFavorite = async (dish: Dish) => {
    try {
      await onUpdate(dish.id, {
        is_favorite: !dish.is_favorite,
      })
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
    }
  }

  const handleToggleWishlist = async (dish: Dish) => {
    try {
      await onUpdate(dish.id, {
        is_wishlist: !dish.is_wishlist,
      })
    } catch (error) {
      console.error('Failed to toggle wishlist:', error)
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
            className="md:hidden fixed bottom-0 left-0 right-0 bg-cream rounded-t-[24px] shadow-[0_-4px_24px_rgba(0,0,0,0.05)] z-[1001] max-h-[90vh] overflow-y-auto"
            style={{
              paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle bar */}
            <div className="w-9 h-1 bg-[#C8C2BA] rounded-sm mx-auto mt-4 mb-6 opacity-60" />

            <div className="px-6 pb-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-dark-olive">
                  Quản lý món
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-warm-linen transition-colors"
                >
                  <X size={20} strokeWidth={2} className="text-dark-olive" />
                </button>
              </div>

              {/* Search */}
              <div className="mb-4">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm món..."
                  className="w-full"
                />
              </div>

              {/* Dishes List */}
              <div className="space-y-3">
                {sortedDishes.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-olive-grey">
                      {searchQuery ? 'Không tìm thấy món nào 🌱' : 'Chưa có món nào 🌱'}
                    </p>
                  </div>
                ) : (
                  sortedDishes.map((dish) => (
                    <div
                      key={dish.id}
                      className="rounded-[16px] p-4 bg-warm-linen"
                    >
                      {editingId === dish.id ? (
                        /* Edit Mode */
                        <div className="space-y-4">
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder="Tên món"
                            className="w-full"
                          />

                          <div>
                            <label className="block text-xs font-medium text-dark-olive mb-2">
                              Phân loại
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {CATEGORIES.map((cat) => (
                                <button
                                  key={cat.value}
                                  onClick={() => setEditCategory(cat.value)}
                                  className={`px-3 py-1.5 rounded-[10px] text-xs font-medium transition-all ${
                                    editCategory === cat.value
                                      ? 'bg-avocado-green text-white'
                                      : 'bg-white text-dark-olive'
                                  }`}
                                >
                                  <span className="mr-1">{cat.emoji}</span>
                                  {cat.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          <Input
                            value={editEmoji}
                            onChange={(e) => setEditEmoji(e.target.value)}
                            placeholder="Emoji"
                            maxLength={2}
                            className="w-full"
                          />

                          <textarea
                            value={editNote}
                            onChange={(e) => setEditNote(e.target.value)}
                            placeholder="Ghi chú"
                            rows={2}
                            className="w-full px-3 py-2 rounded-[10px] border border-olive-grey/20 bg-white text-dark-olive text-sm resize-none focus:outline-none focus:ring-2 focus:ring-avocado-green/30"
                          />

                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditIsFavorite(!editIsFavorite)}
                              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-[10px] text-xs font-medium transition-all ${
                                editIsFavorite
                                  ? 'bg-avocado-green/20 text-avocado-green border-2 border-avocado-green'
                                  : 'bg-white text-dark-olive border border-olive-grey/20'
                              }`}
                            >
                              <Star size={14} fill={editIsFavorite ? 'currentColor' : 'none'} />
                              Quen thuộc
                            </button>
                            <button
                              onClick={() => setEditIsWishlist(!editIsWishlist)}
                              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-[10px] text-xs font-medium transition-all ${
                                editIsWishlist
                                  ? 'bg-coral-soft/20 text-coral-soft border-2 border-coral-soft'
                                  : 'bg-white text-dark-olive border border-olive-grey/20'
                              }`}
                            >
                              <Sparkles size={14} fill={editIsWishlist ? 'currentColor' : 'none'} />
                              Muốn thử
                            </button>
                          </div>

                          {editIsWishlist && (
                            <Input
                              value={editWishlistNote}
                              onChange={(e) => setEditWishlistNote(e.target.value)}
                              placeholder="Ghi chú wishlist"
                              className="w-full text-sm"
                            />
                          )}

                          <div className="flex gap-2">
                            <Button
                              onClick={cancelEdit}
                              variant="outline"
                              className="flex-1 text-sm"
                              disabled={isUpdating}
                            >
                              Huỷ
                            </Button>
                            <Button
                              onClick={() => handleSave(dish.id)}
                              disabled={isUpdating || !editName.trim()}
                              className="flex-1 bg-avocado-green hover:bg-avocado-green/90 text-white text-sm"
                            >
                              {isUpdating ? (
                                <>
                                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                  Đang lưu...
                                </>
                              ) : (
                                'Lưu'
                              )}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        /* View Mode */
                        <div>
                          <div className="flex items-start gap-3 mb-3">
                            <span className="text-2xl flex-shrink-0">
                              {dish.emoji || categoryEmojis[dish.category] || '🍽️'}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="text-dark-olive font-medium text-[15px] mb-1">
                                {dish.name}
                              </div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs px-2 py-0.5 rounded-full bg-sage text-dark-olive">
                                  {CATEGORIES.find((c) => c.value === dish.category)?.label}
                                </span>
                                {dish.is_favorite && (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-avocado-green/20 text-avocado-green flex items-center gap-1">
                                    <Star size={10} fill="currentColor" />
                                    Quen thuộc
                                  </span>
                                )}
                                {dish.is_wishlist && (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-coral-soft/20 text-coral-soft flex items-center gap-1">
                                    <Sparkles size={10} fill="currentColor" />
                                    Muốn thử
                                  </span>
                                )}
                              </div>
                              {dish.note && (
                                <div className="text-xs text-olive-grey mt-1">
                                  {dish.note}
                                </div>
                              )}
                              {dish.wishlist_note && (
                                <div className="text-xs text-coral-soft mt-1">
                                  💫 {dish.wishlist_note}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleToggleFavorite(dish)}
                              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-[10px] text-xs font-medium transition-all ${
                                dish.is_favorite
                                  ? 'bg-avocado-green/20 text-avocado-green'
                                  : 'bg-white text-dark-olive border border-olive-grey/20'
                              }`}
                            >
                              <Star size={14} fill={dish.is_favorite ? 'currentColor' : 'none'} />
                              {dish.is_favorite ? 'Bỏ' : 'Thêm'} quen thuộc
                            </button>
                            <button
                              onClick={() => handleToggleWishlist(dish)}
                              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-[10px] text-xs font-medium transition-all ${
                                dish.is_wishlist
                                  ? 'bg-coral-soft/20 text-coral-soft'
                                  : 'bg-white text-dark-olive border border-olive-grey/20'
                              }`}
                            >
                              <Sparkles size={14} fill={dish.is_wishlist ? 'currentColor' : 'none'} />
                              {dish.is_wishlist ? 'Bỏ' : 'Thêm'} muốn thử
                            </button>
                            <button
                              onClick={() => startEdit(dish)}
                              className="px-3 py-2 rounded-[10px] bg-white text-dark-olive border border-olive-grey/20 hover:bg-sage transition-colors"
                            >
                              <Edit2 size={14} strokeWidth={2} />
                            </button>
                            <button
                              onClick={() => handleDelete(dish.id)}
                              disabled={deletingId === dish.id}
                              className="px-3 py-2 rounded-[10px] bg-white text-coral-soft border border-coral-soft/30 hover:bg-coral-soft/10 transition-colors disabled:opacity-50"
                            >
                              {deletingId === dish.id ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <Trash2 size={14} strokeWidth={2} />
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>

          {/* Desktop Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="hidden md:block fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-cream rounded-[20px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] z-[1001] max-h-[85vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-dark-olive">
                Quản lý món
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-warm-linen transition-colors"
              >
                <X size={20} strokeWidth={2} className="text-dark-olive" />
              </button>
            </div>

            {/* Search */}
            <div className="mb-4">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm món..."
                className="w-full"
              />
            </div>

            {/* Dishes List */}
            <div className="space-y-3">
              {sortedDishes.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-olive-grey">
                    {searchQuery ? 'Không tìm thấy món nào 🌱' : 'Chưa có món nào 🌱'}
                  </p>
                </div>
              ) : (
                sortedDishes.map((dish) => (
                  <div
                    key={dish.id}
                    className="rounded-[16px] p-4 bg-warm-linen"
                  >
                    {editingId === dish.id ? (
                      /* Edit Mode */
                      <div className="space-y-4">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Tên món"
                          className="w-full"
                        />

                        <div>
                          <label className="block text-xs font-medium text-dark-olive mb-2">
                            Phân loại
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {CATEGORIES.map((cat) => (
                              <button
                                key={cat.value}
                                onClick={() => setEditCategory(cat.value)}
                                className={`px-3 py-1.5 rounded-[10px] text-xs font-medium transition-all ${
                                  editCategory === cat.value
                                    ? 'bg-avocado-green text-white'
                                    : 'bg-white text-dark-olive'
                                }`}
                              >
                                <span className="mr-1">{cat.emoji}</span>
                                {cat.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <Input
                          value={editEmoji}
                          onChange={(e) => setEditEmoji(e.target.value)}
                          placeholder="Emoji"
                          maxLength={2}
                          className="w-full"
                        />

                        <textarea
                          value={editNote}
                          onChange={(e) => setEditNote(e.target.value)}
                          placeholder="Ghi chú"
                          rows={2}
                          className="w-full px-3 py-2 rounded-[10px] border border-olive-grey/20 bg-white text-dark-olive text-sm resize-none focus:outline-none focus:ring-2 focus:ring-avocado-green/30"
                        />

                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditIsFavorite(!editIsFavorite)}
                            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-[10px] text-xs font-medium transition-all ${
                              editIsFavorite
                                ? 'bg-avocado-green/20 text-avocado-green border-2 border-avocado-green'
                                : 'bg-white text-dark-olive border border-olive-grey/20'
                            }`}
                          >
                            <Star size={14} fill={editIsFavorite ? 'currentColor' : 'none'} />
                            Quen thuộc
                          </button>
                          <button
                            onClick={() => setEditIsWishlist(!editIsWishlist)}
                            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-[10px] text-xs font-medium transition-all ${
                              editIsWishlist
                                ? 'bg-coral-soft/20 text-coral-soft border-2 border-coral-soft'
                                : 'bg-white text-dark-olive border border-olive-grey/20'
                            }`}
                          >
                            <Sparkles size={14} fill={editIsWishlist ? 'currentColor' : 'none'} />
                            Muốn thử
                          </button>
                        </div>

                        {editIsWishlist && (
                          <Input
                            value={editWishlistNote}
                            onChange={(e) => setEditWishlistNote(e.target.value)}
                            placeholder="Ghi chú wishlist"
                            className="w-full text-sm"
                          />
                        )}

                        <div className="flex gap-2">
                          <Button
                            onClick={cancelEdit}
                            variant="outline"
                            className="flex-1 text-sm"
                            disabled={isUpdating}
                          >
                            Huỷ
                          </Button>
                          <Button
                            onClick={() => handleSave(dish.id)}
                            disabled={isUpdating || !editName.trim()}
                            className="flex-1 bg-avocado-green hover:bg-avocado-green/90 text-white text-sm"
                          >
                            {isUpdating ? (
                              <>
                                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                Đang lưu...
                              </>
                            ) : (
                              'Lưu'
                            )}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      /* View Mode */
                      <div>
                        <div className="flex items-start gap-3 mb-3">
                          <span className="text-2xl flex-shrink-0">
                            {dish.emoji || categoryEmojis[dish.category] || '🍽️'}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="text-dark-olive font-medium text-[15px] mb-1">
                              {dish.name}
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs px-2 py-0.5 rounded-full bg-sage text-dark-olive">
                                {CATEGORIES.find((c) => c.value === dish.category)?.label}
                              </span>
                              {dish.is_favorite && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-avocado-green/20 text-avocado-green flex items-center gap-1">
                                  <Star size={10} fill="currentColor" />
                                  Quen thuộc
                                </span>
                              )}
                              {dish.is_wishlist && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-coral-soft/20 text-coral-soft flex items-center gap-1">
                                  <Sparkles size={10} fill="currentColor" />
                                  Muốn thử
                                </span>
                              )}
                            </div>
                            {dish.note && (
                              <div className="text-xs text-olive-grey mt-1">
                                {dish.note}
                              </div>
                            )}
                            {dish.wishlist_note && (
                              <div className="text-xs text-coral-soft mt-1">
                                💫 {dish.wishlist_note}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleToggleFavorite(dish)}
                            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-[10px] text-xs font-medium transition-all ${
                              dish.is_favorite
                                ? 'bg-avocado-green/20 text-avocado-green'
                                : 'bg-white text-dark-olive border border-olive-grey/20'
                            }`}
                          >
                            <Star size={14} fill={dish.is_favorite ? 'currentColor' : 'none'} />
                            {dish.is_favorite ? 'Bỏ' : 'Thêm'} quen thuộc
                          </button>
                          <button
                            onClick={() => handleToggleWishlist(dish)}
                            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-[10px] text-xs font-medium transition-all ${
                              dish.is_wishlist
                                ? 'bg-coral-soft/20 text-coral-soft'
                                : 'bg-white text-dark-olive border border-olive-grey/20'
                            }`}
                          >
                            <Sparkles size={14} fill={dish.is_wishlist ? 'currentColor' : 'none'} />
                            {dish.is_wishlist ? 'Bỏ' : 'Thêm'} muốn thử
                          </button>
                          <button
                            onClick={() => startEdit(dish)}
                            className="px-3 py-2 rounded-[10px] bg-white text-dark-olive border border-olive-grey/20 hover:bg-sage transition-colors"
                          >
                            <Edit2 size={14} strokeWidth={2} />
                          </button>
                          <button
                            onClick={() => handleDelete(dish.id)}
                            disabled={deletingId === dish.id}
                            className="px-3 py-2 rounded-[10px] bg-white text-coral-soft border border-coral-soft/30 hover:bg-coral-soft/10 transition-colors disabled:opacity-50"
                          >
                            {deletingId === dish.id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Trash2 size={14} strokeWidth={2} />
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

