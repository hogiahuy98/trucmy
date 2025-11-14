'use client'

import { Card } from 'antd'
import DonutChart from './DonutChart'
import type { Category } from '../types'

interface CategoryChartCardProps {
  chartData: Record<string, number>
  categories: Category[]
  colorPalette: string[]
  total: number
}

export default function CategoryChartCard({
  chartData,
  categories,
  colorPalette,
  total,
}: CategoryChartCardProps) {
  return (
    <Card
      className="rounded-2xl border-0 shadow-sm"
      style={{
        backgroundColor: '#EFECE6', // warm linen
        border: 'none',
        borderRadius: '18px',
        boxShadow: '0 2px 12px rgba(111, 143, 95, 0.08)',
      }}
    >
      <div
        style={{
          color: '#8B8F7A', // olive grey
          fontSize: '13px',
          fontWeight: 500,
          marginBottom: '16px',
        }}
      >
        Phân bổ danh mục
      </div>
      <div className="flex items-center gap-6">
        <DonutChart data={chartData} colors={colorPalette} />
        <div className="flex flex-col gap-2">
          {Object.entries(chartData).map(([key, val], idx) => {
            const cat =
              categories.find((c) => c.key === key) || {
                label: key,
                color: colorPalette[idx % colorPalette.length],
              }
            const pct = total > 0 ? Math.round((val / total) * 100) : 0
            return (
              <div key={key} className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                <span
                  style={{
                    fontSize: '13px',
                    color: '#4A4F3B', // dark olive
                  }}
                >
                  {cat.label}
                </span>
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#4A4F3B', // dark olive
                    marginLeft: 'auto',
                  }}
                >
                  {pct}%
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}

