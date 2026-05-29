import { create } from 'zustand'

interface UIState {
  /** Cờ yêu cầu mở form thêm chi tiêu nhanh (từ quick action) */
  quickAddRequested: number
  requestQuickAdd: () => void
}

export const useUIStore = create<UIState>((set) => ({
  quickAddRequested: 0,
  requestQuickAdd: () => set((s) => ({ quickAddRequested: s.quickAddRequested + 1 })),
}))
