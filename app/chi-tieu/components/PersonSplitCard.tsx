'use client'

import { Card, Typography } from 'antd'
import { motion } from 'framer-motion'

const { Text } = Typography

interface PersonSplitCardProps {
  ghPct: number
  tmPct: number
}

export default function PersonSplitCard({ ghPct, tmPct }: PersonSplitCardProps) {
  return (
    <Card className="rounded-2xl border border-slate-100 shadow-md">
      <Text type="secondary" className="text-sm">H vs M</Text>
      <div className="flex w-full h-3.5 bg-slate-100 rounded-full overflow-hidden mt-2">
        <motion.div
          className="h-full bg-[#ff4b6e]"
          initial={{ width: 0 }}
          animate={{ width: `${ghPct}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        />
        <motion.div
          className="h-full bg-[#ffd1db]"
          initial={{ width: 0 }}
          animate={{ width: `${tmPct}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 18, delay: 0.05 }}
        />
      </div>
      <div className="flex justify-between mt-2 text-slate-500 text-xs">
        <span>GH {ghPct}%</span>
        <span>TM {tmPct}%</span>
      </div>
    </Card>
  )
}

