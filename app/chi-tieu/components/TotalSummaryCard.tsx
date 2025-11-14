'use client'

import { formatVND } from '../utils'

interface TotalSummaryCardProps {
  total: number
}

export default function TotalSummaryCard({ total }: TotalSummaryCardProps) {
  return (
    <div
      style={{
        backgroundColor: '#D8E2D0', // sage
        borderRadius: '20px',
        padding: '24px',
        boxShadow: '0 2px 16px rgba(111, 143, 95, 0.1)',
      }}
    >
      <div
        style={{
          color: '#8B8F7A',
          fontSize: '14px',
          fontWeight: 500,
          marginBottom: '8px',
        }}
      >
        Tổng chi tiêu tháng này
      </div>
      <div
        style={{
          color: '#4A4F3B',
          fontSize: '36px',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          lineHeight: '1.1',
        }}
      >
        {formatVND(total)}
      </div>
    </div>
  )
}

