import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Svg, { Path, Circle } from 'react-native-svg'

interface DonutChartProps {
  data: Record<string, number>
  colors: string[]
  size?: number
  strokeWidth?: number
}

function polarToCartesian(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const start = polarToCartesian(cx, cy, r, endDeg)
  const end = polarToCartesian(cx, cy, r, startDeg)
  const large = endDeg - startDeg > 180 ? 1 : 0
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 0 ${end.x} ${end.y}`
}

export default function DonutChart({ data, colors, size = 120, strokeWidth = 22 }: DonutChartProps) {
  const entries = Object.entries(data).filter(([, v]) => v > 0)
  const total = entries.reduce((sum, [, v]) => sum + v, 0)
  const cx = size / 2
  const cy = size / 2
  const r = (size - strokeWidth) / 2

  if (total === 0) {
    return (
      <Svg width={size} height={size}>
        <Circle cx={cx} cy={cy} r={r} stroke="#E5E7EB" strokeWidth={strokeWidth} fill="none" />
      </Svg>
    )
  }

  let current = 0
  const paths = entries.map(([key, value], i) => {
    const pct = value / total
    const startDeg = current * 360
    const endDeg = (current + pct) * 360 - 1
    current += pct
    const color = colors[i % colors.length] || '#94A3B8'
    return <Path key={key} d={arcPath(cx, cy, r, startDeg, endDeg)} stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" />
  })

  return (
    <Svg width={size} height={size}>
      {paths}
    </Svg>
  )
}
