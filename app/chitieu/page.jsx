'use client'

import { useMemo, useState } from 'react'
import {
  ConfigProvider,
  Card,
  Button,
  Input,
  Radio,
  DatePicker,
  Typography,
  List,
  Tag,
  Progress,
  Space,
  Row,
  Col,
  Modal,
  notification,
} from 'antd'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Coffee,
  Home,
  ShoppingCart,
  Clapperboard,
  Wifi,
  Utensils,
  Tag as TagIcon,
  Plus,
  PiggyBank,
} from 'lucide-react'
import dayjs from 'dayjs'
import { useFinanceStore } from './store'

const { Title, Text } = Typography

const iconMap = {
  coffee: Coffee,
  home: Home,
  'shopping-cart': ShoppingCart,
  clapperboard: Clapperboard,
  wifi: Wifi,
  utensils: Utensils,
  tag: TagIcon,
}

const theme = {
  token: {
    colorPrimary: '#ff4b6e',
    borderRadius: 16,
    colorBgContainer: '#ffffff',
  },
}

function formatVND(amount) {
  return amount.toLocaleString('vi-VN') + 'đ'
}

function DonutChart({ data, colors }) {
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
    <svg width={140} height={140} viewBox="0 0 140 140">
      <g transform="translate(70,70)">
        <circle r={radius} fill="transparent" stroke="#f1f5f9" strokeWidth={20} />
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
        <circle r={34} fill="#ffffff" />
      </g>
    </svg>
  )
}

export default function FinancePage() {
  const categories = useFinanceStore((s) => s.categories)
  const addCategory = useFinanceStore((s) => s.addCategory)
  const expenses = useFinanceStore((s) => s.expenses)
  const addExpense = useFinanceStore((s) => s.addExpense)

  const [open, setOpen] = useState(false)
  const [amountInput, setAmountInput] = useState('')
  const [category, setCategory] = useState(categories[0]?.key || 'cafe')
  const [person, setPerson] = useState('TM')
  const [date, setDate] = useState(dayjs())
  const [note, setNote] = useState('')
  const [customCategory, setCustomCategory] = useState('')

  const { total, byPerson, categoryMap } = useMemo(() => useFinanceStore.getState().getMonthlySummary(), [expenses])

  const ghAmount = byPerson.GH + byPerson.Both / 2
  const tmAmount = byPerson.TM + byPerson.Both / 2
  const ghPct = total > 0 ? Math.round((ghAmount / total) * 100) : 0
  const tmPct = 100 - ghPct

  const colorPalette = categories.map((c) => c.color)
  const chartData = Object.keys(categoryMap).length
    ? categoryMap
    : { Cafe: 1 }

  const titleGradient = {
    background: 'linear-gradient(135deg, #ff93a9, #ff4b6e)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  }

  const handleAdd = () => {
    const num = parseInt((amountInput || '0').replace(/\D/g, ''), 10)
    if (!num || num <= 0) {
      notification.warning({
        message: 'Nhập số tiền hợp lệ nhé!',
        placement: 'bottomRight',
      })
      return
    }
    let usedCategory = category
    if (category === 'custom') {
      const label = customCategory.trim()
      if (!label) {
        notification.warning({ message: 'Nhập tên danh mục', placement: 'bottomRight' })
        return
      }
      addCategory(label)
      usedCategory = label.trim().toLowerCase().replace(/\s+/g, '-')
    }
    const amount = num * 1000
    const payload = {
      id: Date.now(),
      amount,
      person,
      category: usedCategory,
      note: note.trim(),
      date: date.toDate(),
    }
    addExpense(payload)
    setOpen(false)
    setAmountInput('')
    setNote('')
    setCustomCategory('')

    const catObj = categories.find((c) => c.key === usedCategory)
    const label = catObj?.label || customCategory || usedCategory
    notification.success({
      message: `Đã ghi: ${person} – ${formatVND(amount)} – ${label}`,
      placement: 'bottomRight',
    })
  }

  const prettyInput = amountInput ? `${parseInt(amountInput.replace(/\D/g, ''), 10).toLocaleString('vi-VN')}.000đ` : ''

  return (
    <ConfigProvider theme={theme}>
      <div className="finance-app">
        <div className="finance-container">
          <div className="finance-header">
            <Title level={2} style={titleGradient}>Quản lý chi tiêu</Title>
          </div>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Card className="panel">
                <Space direction="vertical" size={8} style={{ width: '100%' }}>
                  <Text type="secondary">Tổng tháng này</Text>
                  <Title level={2} style={{ margin: 0 }}>{formatVND(total)}</Title>
                  <Tag color="#ff4b6e" bordered={false} className="soft-tag">
                    <PiggyBank size={14} style={{ marginRight: 6 }} /> Tiết kiệm càng nhiều càng vui 💖
                  </Tag>
                </Space>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card className="panel">
                <Text type="secondary">GH vs TM</Text>
                <div className="split-bar">
                  <motion.div
                    className="bar-gh"
                    initial={{ width: 0 }}
                    animate={{ width: ghPct + '%' }}
                    transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                  />
                  <motion.div
                    className="bar-tm"
                    initial={{ width: 0 }}
                    animate={{ width: tmPct + '%' }}
                    transition={{ type: 'spring', stiffness: 120, damping: 18, delay: 0.05 }}
                  />
                </div>
                <div className="split-labels">
                  <span>GH {ghPct}%</span>
                  <span>TM {tmPct}%</span>
                </div>
              </Card>
            </Col>

            <Col xs={24} md={12}>
              <Card className="panel">
                <div className="panel-title">Phân bổ danh mục</div>
                <div className="donut-wrap">
                  <DonutChart data={chartData} colors={colorPalette} />
                  <div className="legend">
                    {Object.entries(chartData).map(([key, val], idx) => {
                      const cat = categories.find((c) => c.key === key) || { label: key, color: colorPalette[idx % colorPalette.length] }
                      const pct = total > 0 ? Math.round((val / total) * 100) : 0
                      return (
                        <div key={key} className="legend-item">
                          <span className="dot" style={{ backgroundColor: cat.color }} />
                          <span className="name">{cat.label}</span>
                          <span className="val">{pct}%</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </Card>
            </Col>

            <Col xs={24} md={12}>
              <Card className="panel">
                <div className="panel-title">Giao dịch gần đây</div>
                {expenses.length === 0 ? (
                  <div className="empty">Chưa có giao dịch. Bấm “Tốn tiền 💸” để thêm nhanh!</div>
                ) : (
                  <List
                    dataSource={expenses.slice(0, 6)}
                    renderItem={(item) => {
                      const cat = categories.find((c) => c.key === item.category)
                      const Icon = iconMap[cat?.icon || 'tag']
                      return (
                        <List.Item className="txn-item">
                          <Space>
                            <span className="icon-pill" style={{ backgroundColor: (cat?.color || '#94A3B8') + '22', color: cat?.color || '#64748B' }}>
                              <Icon size={16} />
                            </span>
                            <div className="txn-meta">
                              <div className="txn-line">
                                <span className="txn-cat">{cat?.label || item.category}</span>
                                <span className="dot-sep">•</span>
                                <span className="txn-person">{item.person}</span>
                              </div>
                              <div className="txn-note">{item.note || dayjs(item.date).format('DD/MM')}</div>
                            </div>
                          </Space>
                          <div className="txn-amt">{formatVND(item.amount)}</div>
                        </List.Item>
                      )
                    }}
                  />
                )}
              </Card>
            </Col>
          </Row>

          <button className="fab" onClick={() => setOpen(true)}>
            <span className="fab-inner">Tốn tiền 💸</span>
          </button>

          <AnimatePresence>
            {open && (
              <Modal
                open
                onCancel={() => setOpen(false)}
                footer={null}
                centered
                width={520}
                className="fancy-modal"
                destroyOnClose
              >
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ type: 'spring', stiffness: 160, damping: 18 }}>
                  <div className="modal-head">Thêm chi tiêu</div>
                  <div className="amount-wrap">
                    <Text type="secondary">Số tiền</Text>
                    <Input
                      size="large"
                      value={amountInput}
                      onChange={(e) => setAmountInput(e.target.value)}
                      placeholder="Nhập số (tự + .000đ)"
                      suffix={<span className="amount-preview">{prettyInput}</span>}
                      className="rounded"
                      inputMode="numeric"
                    />
                  </div>

                  <div className="section">
                    <Text type="secondary">Danh mục</Text>
                    <div className="pill-grid">
                      {categories.map((c) => {
                        const Icon = iconMap[c.icon]
                        const active = category === c.key
                        return (
                          <motion.button
                            key={c.key}
                            type="button"
                            className={`pill ${active ? 'active' : ''}`}
                            onClick={() => setCategory(c.key)}
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.98 }}
                            style={{ borderColor: active ? c.color : '#e5e7eb', backgroundColor: active ? c.color + '22' : '#fff', color: active ? c.color : '#64748b' }}
                          >
                            <Icon size={16} /> {c.label}
                          </motion.button>
                        )
                      })}
                      <motion.button
                        type="button"
                        className={`pill ${category === 'custom' ? 'active' : ''}`}
                        onClick={() => setCategory('custom')}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.98 }}
                        style={{ borderColor: category === 'custom' ? '#94A3B8' : '#e5e7eb', backgroundColor: category === 'custom' ? '#94A3B822' : '#fff', color: '#64748b' }}
                      >
                        <Plus size={16} /> Thêm
                      </motion.button>
                    </div>
                    {category === 'custom' && (
                      <Input
                        style={{ marginTop: 8 }}
                        placeholder="Tên danh mục mới"
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                      />
                    )}
                  </div>

                  <div className="section">
                    <Text type="secondary" style={{ marginRight: 8 }}>Người chi</Text>
                    <Radio.Group value={person} onChange={(e) => setPerson(e.target.value)}>
                      <Radio.Button value="GH">GH</Radio.Button>
                      <Radio.Button value="TM">TM</Radio.Button>
                      <Radio.Button value="Both">Cả 2</Radio.Button>
                    </Radio.Group>
                  </div>

                  <div className="section grid-2">
                    <div>
                      <Text type="secondary">Ngày</Text>
                      <DatePicker value={date} onChange={(v) => setDate(v || dayjs())} format="DD/MM/YYYY" style={{ width: '100%' }} />
                    </div>
                    <div>
                      <Text type="secondary">Ghi chú</Text>
                      <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Tuỳ chọn" />
                    </div>
                  </div>

                  <div className="modal-actions">
                    <Button onClick={() => setOpen(false)}>Huỷ</Button>
                    <Button type="primary" onClick={handleAdd}>
                      Ghi lại
                    </Button>
                  </div>
                </motion.div>
              </Modal>
            )}
          </AnimatePresence>

          <div className="footer">GH × TM — build, measure, save 💰</div>
        </div>
      </div>
    </ConfigProvider>
  )
}


