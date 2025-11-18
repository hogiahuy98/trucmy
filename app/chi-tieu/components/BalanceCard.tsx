'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Wallet } from 'lucide-react'
import { formatVND } from '../utils'
import type { BalanceSummary } from '../types'

interface BalanceCardProps {
  balance: BalanceSummary
  hasIncome: boolean
  onEditClick: () => void
}

export default function BalanceCard({ balance, hasIncome, onEditClick }: BalanceCardProps) {
  const [showBreakdown, setShowBreakdown] = useState(false)

  const getRemainingColorClass = () => {
    if (balance.remaining < 0) return 'text-red-500'
    if (balance.remaining < balance.totalIncome * 0.1) return 'text-amber-500'
    return 'text-avocado-green'
  }


  return (
    <div
      className="bg-warm-linen rounded-2xl p-6 shadow-[0_2px_16px_rgba(111,143,95,0.08)] cursor-pointer"
      onClick={onEditClick}
    >
      <div className="flex items-center gap-2 mb-3">
        <Wallet size={18} className="text-avocado-green" strokeWidth={1.5} />
        <div className="text-olive-grey text-sm font-medium">
          Số tiền còn lại
        </div>
      </div>

      <div className={`${getRemainingColorClass()} text-4xl font-bold tracking-tight leading-tight mb-4`}>
        {formatVND(balance.remaining)}
      </div>

      <div className="flex flex-col gap-2 mb-3">
        <div className="flex justify-between text-sm">
          <span className="text-olive-grey">Thu nhập:</span>
          <span className="text-dark-olive font-medium">{formatVND(balance.totalIncome)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-olive-grey">Chi tiêu:</span>
          <span className="text-dark-olive font-medium">{formatVND(balance.totalExpenses)}</span>
        </div>
      </div>

      {balance.byPerson && (
        <div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowBreakdown(!showBreakdown)
            }}
            className="flex items-center gap-1.5 bg-transparent border-none text-olive-grey text-xs font-medium cursor-pointer py-1"
          >
            {showBreakdown ? (
              <>
                <ChevronUp size={14} />
                <span>Ẩn chi tiết</span>
              </>
            ) : (
              <>
                <ChevronDown size={14} />
                <span>Xem chi tiết theo người</span>
              </>
            )}
          </button>

          {showBreakdown && (
            <div className="mt-3 pt-3 border-t border-olive-grey/20 flex flex-col gap-3">
              <div>
                <div className="text-xs text-olive-grey mb-1.5">GH</div>
                <div className="flex flex-col gap-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-olive-grey">Thu nhập:</span>
                    <span className="text-dark-olive">{formatVND(balance.byPerson.GH.income)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-olive-grey">Chi tiêu:</span>
                    <span className="text-dark-olive">{formatVND(balance.byPerson.GH.expenses)}</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-xs text-olive-grey mb-1.5">TM</div>
                <div className="flex flex-col gap-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-olive-grey">Thu nhập:</span>
                    <span className="text-dark-olive">{formatVND(balance.byPerson.TM.income)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-olive-grey">Chi tiêu:</span>
                    <span className="text-dark-olive">{formatVND(balance.byPerson.TM.expenses)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Always show "Add Income" button */}
      <div className="mt-4 pt-4 border-t border-olive-grey/20">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onEditClick()
          }}
          className="w-full bg-avocado-green text-white border-none rounded-xl py-3 px-6 text-base font-semibold cursor-pointer transition-opacity hover:opacity-90 flex items-center justify-center gap-2"
        >
          <Wallet size={18} />
          Thêm thu nhập
        </button>
      </div>
    </div>
  )
}
