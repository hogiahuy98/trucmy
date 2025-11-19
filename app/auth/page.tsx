'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'

const ICONS = [
  { id: 'game', emoji: '🎮', label: 'Game' },
  { id: 'kiss', emoji: '💋', label: 'Kiss' },
  { id: 'dog', emoji: '🐶', label: 'Dog' },
  { id: 'boba', emoji: '🧋', label: 'Boba' },
  { id: 'home', emoji: '🏡', label: 'Home' },
  { id: 'cart', emoji: '🛒', label: 'Cart' },
  { id: 'taco', emoji: '🌮', label: 'Taco' },
  { id: 'pizza', emoji: '🍕', label: 'Pizza' },
  { id: 'coffee', emoji: '☕', label: 'Coffee' },
  { id: 'turtle', emoji: '🐢', label: 'Turtle' },
]

const CORRECT_PASSWORD = ['dog', 'coffee', 'kiss'] // Đổi thành password của bạn

export default function AuthPage() {
  const router = useRouter()
  const [selected, setSelected] = useState<string[]>([])
  const [isShaking, setIsShaking] = useState(false)

  const handleIconClick = (iconId: string) => {
    if (selected.includes(iconId)) {
      // Bỏ chọn nếu đã chọn
      setSelected(selected.filter(id => id !== iconId))
    } else if (selected.length < 3) {
      // Thêm vào danh sách
      const newSelected = [...selected, iconId]
      setSelected(newSelected)
    }
  }

  const checkPassword = (selectedIcons: string[]) => {
    const isCorrect = JSON.stringify(selectedIcons) === JSON.stringify(CORRECT_PASSWORD)
    
    if (isCorrect) {
      toast.success('Chào mừng trở lại! 💛', {
        description: 'Đang chuyển tới trang chi tiêu...',
      })
      setTimeout(() => {
        const expires = new Date()
        expires.setTime(expires.getTime() + 3 * 60 * 60 * 1000)
        document.cookie = `gh_tm_auth=1; expires=${expires.toUTCString()}; path=/`
        router.push('/chi-tieu')
      }, 800)
    } else {
      setIsShaking(true)
      toast.error('Không đúng rồi 🥺', {
        description: 'Thử lại nhé',
      })
      setTimeout(() => {
        setSelected([])
        setIsShaking(false)
      }, 600)
    }
  }

  const handleReset = () => {
    setSelected([])
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: '#FBF0F2' }}>
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.04, 0.06, 0.04],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ background: '#E88B9C' }}
          className="absolute -top-1/2 -left-1/2 w-full h-full rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.03, 0.05, 0.03],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          style={{ background: '#F5A9B8' }}
          className="absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full blur-3xl"
        />
      </div>

      {/* Main Auth Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-lg"
      >
        <Card className="shadow-[0_8px_32px_rgba(232,139,156,0.15)] overflow-hidden" style={{ background: '#FFFBFC', border: '1px solid #F5E5E9' }}>
          <div className="p-8">
            {/* Title */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center mb-8"
            >
              <h1 className="text-2xl font-bold mb-2" style={{ color: '#E88B9C' }}>
                H&M — Private Access
              </h1>
              <p className="text-sm" style={{ color: '#8A8A8A' }}>
                Chọn đúng thứ tự 3 emoji (H&M biết thôi)
              </p>
            </motion.div>

            {/* Selected Indicators */}
            <div className="flex justify-center gap-3 mb-6">
              {[0, 1, 2].map((index) => {
                const iconId = selected[index]
                const iconData = ICONS.find(i => i.id === iconId)
                const emoji = iconData?.emoji
                
                return (
                  <motion.div
                    key={index}
                    animate={isShaking ? {
                      x: [-10, 10, -10, 10, 0],
                      transition: { duration: 0.4 }
                    } : {}}
                    className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{ 
                      border: '2px dashed #D5D5D5',
                      background: '#F8F6F7'
                    }}
                  >
                    {emoji ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="text-3xl"
                      >
                        {emoji}
                      </motion.div>
                    ) : (
                      <div className="w-2 h-2 rounded-full" style={{ background: '#C5C5C5' }} />
                    )}
                  </motion.div>
                )
              })}
            </div>

            {/* Icon Grid */}
            <div className="grid grid-cols-5 gap-3 mb-6">
              {ICONS.map((item, index) => {
                const isSelected = selected.includes(item.id)
                const selectionOrder = selected.indexOf(item.id) + 1
                
                return (
                  <motion.button
                    key={item.id}
                    type="button"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + index * 0.03 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleIconClick(item.id)}
                    className="relative aspect-square rounded-2xl transition-all flex items-center justify-center text-3xl"
                    style={{
                      border: isSelected ? '2px solid #E88B9C' : '1px solid #E8E8E8',
                      backgroundColor: isSelected ? '#FCE8EC' : '#FFFFFF',
                    }}
                  >
                    {item.emoji}
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-white text-xs font-semibold flex items-center justify-center shadow-md"
                        style={{ background: '#E88B9C' }}
                      >
                        {selectionOrder}
                      </motion.div>
                    )}
                  </motion.button>
                )
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                type="button"
                onClick={handleReset}
                className="flex-1 py-3.5 px-6 rounded-2xl text-sm font-medium transition-all flex items-center justify-center gap-2"
                style={{
                  background: '#F0F0F0',
                  color: '#6A6A6A',
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                  <path d="M21 3v5h-5" />
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                </svg>
                Reset
              </motion.button>
              
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                type="button"
                onClick={() => selected.length === 3 && checkPassword(selected)}
                disabled={selected.length !== 3}
                className="flex-1 py-3.5 px-6 rounded-2xl text-sm font-medium transition-all flex items-center justify-center gap-2"
                style={{
                  background: selected.length === 3 ? '#E88B9C' : '#F5D4DA',
                  color: selected.length === 3 ? '#FFFFFF' : '#C4A1A8',
                  cursor: selected.length === 3 ? 'pointer' : 'not-allowed',
                }}
                whileHover={selected.length === 3 ? { scale: 1.02 } : {}}
                whileTap={selected.length === 3 ? { scale: 0.98 } : {}}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Unlock
              </motion.button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
