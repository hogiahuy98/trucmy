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
    <Card
      className="rounded-2xl border-0 shadow-sm"
      style={{
        backgroundColor: '#D8E2D0', // sage
        border: 'none',
        borderRadius: '18px',
        boxShadow: '0 2px 12px rgba(111, 143, 95, 0.08)',
      }}
    >
      <Text
        style={{
          color: '#8B8F7A', // olive grey
          fontSize: '13px',
          fontWeight: 500,
        }}
      >
        Chia sẻ chi tiêu
      </Text>
      <div
        className="flex w-full h-4 rounded-full overflow-hidden mt-3"
        style={{ backgroundColor: '#EFECE6' }} // warm linen
      >
        <motion.div
          className="h-full"
          style={{ backgroundColor: '#A3C68C' }} // avocado green
          initial={{ width: 0 }}
          animate={{ width: `${ghPct}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        />
        <motion.div
          className="h-full"
          style={{ backgroundColor: '#6F8F5F' }} // deep avocado
          initial={{ width: 0 }}
          animate={{ width: `${tmPct}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 18, delay: 0.05 }}
        />
      </div>
      <div
        className="flex justify-between mt-3"
        style={{
          color: '#4A4F3B', // dark olive
          fontSize: '12px',
          fontWeight: 500,
        }}
      >
        <span>GH {ghPct}%</span>
        <span>TM {tmPct}%</span>
      </div>
    </Card>
  )
}

