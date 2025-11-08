'use client'

import { Card, Space, Tag, Typography } from 'antd'
import { PiggyBank } from 'lucide-react'
import { formatVND } from '../utils'

const { Text, Title } = Typography

interface TotalSummaryCardProps {
  total: number
}

export default function TotalSummaryCard({ total }: TotalSummaryCardProps) {
  return (
    <Card className="rounded-2xl border border-slate-100 shadow-md">
      <Space direction="vertical" size={8} className="w-full">
        <Text type="secondary" className="text-sm">
          Tổng tháng này
        </Text>
        <Title level={2} className="!m-0 !text-2xl">
          {formatVND(total)}
        </Title>
        <Tag
          color="#ff4b6e"
          bordered={false}
          className="rounded-full border-0"
        >
          <PiggyBank size={14} className="mr-1.5 inline" /> Tiết kiệm càng nhiều càng vui 💖
        </Tag>
      </Space>
    </Card>
  )
}

