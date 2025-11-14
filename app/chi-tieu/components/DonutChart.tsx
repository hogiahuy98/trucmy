'use client'

import { motion } from 'framer-motion'

interface DonutChartProps {
  data: Record<string, number>
  colors: string[]
}

export default function DonutChart({ data, colors }: DonutChartProps) {
  const total = Object.values(data).reduce((s, v) => s + v, 0)
  let cumulative = 0
  const radius = 48
  const circumference = 2 * Math.PI * radius
  const segments = Object.entries(data).map(([key, value], idx) => {
    const fraction = total > 0 ? value / total : 0
    const length = fraction * circumference
    const dasharray = `${length} ${circumference - length}`
    const dashoffset = -cumulative
    cumulative += length
    return { key, dasharray, dashoffset, color: colors[idx % colors.length], value }
  })

  return (
    <svg width={140} height={140} viewBox="0 0 140 140" className="w-[140px] h-[140px]">
      <g transform="translate(70,70)">
        <circle
          r={radius}
          fill="transparent"
          stroke="#D8E2D0"
          strokeWidth={20}
        />
        {segments.map((s) => (
          <motion.circle
            key={s.key}
            r={radius}
            fill="transparent"
            stroke={s.color}
            strokeWidth={20}
            strokeDasharray={s.dasharray}
            strokeDashoffset={s.dashoffset}
            transform="-90 rotate(0)"
            initial={{ strokeDasharray: `0 ${circumference}` }}
            animate={{ strokeDasharray: s.dasharray }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          />
        ))}
        <circle r={34} fill="#FAF8F4" />
      </g>
    </svg>
  )
}

