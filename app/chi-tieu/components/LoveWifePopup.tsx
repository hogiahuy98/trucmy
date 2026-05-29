'use client'

import React, { useEffect, useState } from 'react'

const STORAGE_KEY = 'love-wife-popup-dismissed'

export function LoveWifePopup() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const dismissed = window.localStorage.getItem(STORAGE_KEY)
      if (!dismissed) {
        setOpen(true)
      }
    } catch {
      // Nếu localStorage không khả dụng thì bỏ qua, không hiển thị popup để tránh lỗi UX
    }
  }, [])

  const handleClose = () => {
    setOpen(false)
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(STORAGE_KEY, 'true')
    } catch {
      // Bỏ qua lỗi ghi localStorage
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/25">
      <div className="w-[90%] max-w-xs rounded-xl border border-[var(--color-primary-light)] bg-[var(--color-cream)] px-6 py-5 text-center shadow-lg shadow-black/10">
        <h2 className="mb-2 text-lg font-semibold text-[var(--color-deep-avocado)]">
          Yêu vợ thiệt nhiều 💕
        </h2>
        <p className="mb-4 text-sm leading-relaxed text-[var(--color-olive-grey)]">
          Đi chi tiêu nhớ nghĩ đến vợ, nhớ thương vợ, và đừng quên nói lời yêu
          mỗi ngày nha.
        </p>
        <button
          type="button"
          onClick={handleClose}
          className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[var(--color-coral-soft)] via-[var(--color-primary)] to-[var(--color-deep-avocado)] px-4 py-2 text-sm font-semibold text-white shadow-md shadow-black/20 transition hover:brightness-105 active:translate-y-px"
        >
          Iu chồng
        </button>
      </div>
    </div>
  )
}

