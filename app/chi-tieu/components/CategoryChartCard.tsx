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
    <Card className="rounded-2xl border border-slate-100 shadow-md">
      <div className="text-sm font-medium text-slate-600 mb-4">Phân bổ danh mục</div>
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
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-sm text-slate-700">{cat.label}</span>
                <span className="text-sm font-medium text-slate-900 ml-auto">
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

