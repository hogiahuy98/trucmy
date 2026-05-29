'use client'

import { formatVND } from '../utils'

interface TotalSummaryCardProps {
  total: number
  ghAmount: number
  tmAmount: number
  ghPct: number
  tmPct: number
}

export default function TotalSummaryCard({ total, ghAmount, tmAmount, ghPct, tmPct }: TotalSummaryCardProps) {
  return (
    <div
      style={{
        backgroundColor: '#F2EFE9',
        borderRadius: '20px',
        padding: '24px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}
    >
      <div style={{ color: '#7A7060', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>
        Tháng này chi
      </div>
      <div
        style={{
          color: '#2D2A24',
          fontSize: '36px',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          lineHeight: '1.1',
          marginBottom: '16px',
        }}
      >
        {formatVND(total)}
      </div>

      {/* GH / TM split bar */}
      <div
        style={{
          height: '8px',
          borderRadius: '4px',
          overflow: 'hidden',
          backgroundColor: '#E5E7EB',
          display: 'flex',
          marginBottom: '12px',
        }}
      >
        <div style={{ flex: ghPct || 1, backgroundColor: '#A3C68C', borderRadius: '4px' }} />
        <div style={{ flex: tmPct || 1, backgroundColor: '#9B8FD4', borderRadius: '4px' }} />
      </div>

      {/* Person amounts */}
      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#A3C68C', flexShrink: 0 }} />
          <span style={{ fontSize: '13px', color: '#7A7060', fontWeight: 500 }}>GH</span>
          <span style={{ fontSize: '13px', color: '#2D2A24', fontWeight: 600 }}>{formatVND(ghAmount)}</span>
          <span style={{ fontSize: '12px', color: '#7A7060' }}>{ghPct}%</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#9B8FD4', flexShrink: 0 }} />
          <span style={{ fontSize: '13px', color: '#7A7060', fontWeight: 500 }}>TM</span>
          <span style={{ fontSize: '13px', color: '#2D2A24', fontWeight: 600 }}>{formatVND(tmAmount)}</span>
          <span style={{ fontSize: '12px', color: '#7A7060' }}>{tmPct}%</span>
        </div>
      </div>
    </div>
  )
}

