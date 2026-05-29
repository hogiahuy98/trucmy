'use client'

import { motion } from 'framer-motion'
import type { Category } from '../types'
import { formatVND } from '../utils'

interface CategoryChipsProps {
  chartData: Record<string, number>
  categories: Category[]
  total: number
}

export default function CategoryChips({
  chartData,
  categories,
  total,
}: CategoryChipsProps) {
  const sortedCategories = Object.entries(chartData)
    .map(([key, value]) => {
      const cat = categories.find((c) => c.key === key) || {
        label: key,
        color: '#A3C68C',
        icon: 'tag',
      }
      return {
        key,
        label: cat.label,
        color: cat.color,
        amount: value,
        percentage: total > 0 ? Math.round((value / total) * 100) : 0,
      }
    })
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10)

  if (sortedCategories.length === 0) {
    return null
  }

  return (
    <div style={{ padding: '0 4px' }}>
      <div
        style={{
          color: '#8B8F7A',
          fontSize: '13px',
          fontWeight: 500,
          marginBottom: '12px',
          paddingLeft: '4px',
        }}
      >
        Danh mục
      </div>
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          scrollPadding: '0 20px',
          padding: '0 4px',
          WebkitOverflowScrolling: 'touch',
        }}
        className="hide-scrollbar"
      >
        {sortedCategories.map((cat, idx) => (
          <motion.div
            key={cat.key}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.18, delay: idx * 0.03 }}
            style={{
              flexShrink: 0,
              scrollSnapAlign: 'start',
              minWidth: '120px',
              padding: '12px 16px',
              backgroundColor: `${cat.color}18`,
              borderRadius: '16px',
              border: `1.5px solid ${cat.color}44`,
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            <div
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#4A4F3B',
                lineHeight: '1.2',
              }}
            >
              {cat.label}
            </div>
            <div
              style={{
                fontSize: '16px',
                fontWeight: 700,
                color: cat.color,
                lineHeight: '1.2',
              }}
            >
              {formatVND(cat.amount)}
            </div>
            <div
              style={{
                fontSize: '12px',
                color: '#8B8F7A',
                marginTop: '2px',
              }}
            >
              {cat.percentage}%
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

