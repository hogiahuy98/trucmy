'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import type { UserRole } from '../types'

interface UserRoleSelectionProps {
  open: boolean
  onSelect: (role: UserRole) => void
}

export default function UserRoleSelection({
  open,
  onSelect,
}: UserRoleSelectionProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-[2000] backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-cream rounded-[20px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] z-[2001] p-6"
          >
            <h2 className="text-xl font-semibold text-dark-olive mb-2 text-center">
              Ai đang sử dụng app vậy nhỉ?
            </h2>
            <p className="text-sm text-olive-grey text-center mb-6">
              Chọn để bắt đầu cùng nhau quản lý bữa ăn
            </p>

            <div className="grid grid-cols-2 gap-4">
              {/* GH Card */}
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => onSelect('GH')}
                className="p-6 rounded-[16px] bg-warm-linen border-2 border-transparent hover:border-avocado-green transition-all text-center"
              >
                <div className="text-4xl mb-3">❤️</div>
                <div className="text-lg font-semibold text-dark-olive">GH</div>
                <div className="text-xs text-olive-grey mt-1">Huy</div>
              </motion.button>

              {/* TM Card */}
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => onSelect('TM')}
                className="p-6 rounded-[16px] bg-warm-linen border-2 border-transparent hover:border-coral-soft transition-all text-center"
              >
                <div className="text-4xl mb-3">💛</div>
                <div className="text-lg font-semibold text-dark-olive">TM</div>
                <div className="text-xs text-olive-grey mt-1">My</div>
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

