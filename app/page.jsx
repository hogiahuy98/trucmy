'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  ConfigProvider,
  Card,
  Button,
  Input,
  Progress,
  Tag,
  List,
  Modal,
  Space,
  Typography,
  message,
  Row,
  Col,
} from 'antd'
import {
  HeartOutlined,
  ShareAltOutlined,
  TrophyOutlined,
  BookOutlined,
} from '@ant-design/icons'

const { Title, Text } = Typography

const LEVELS = [
  { min: 0, max: 9, name: 'GH Mới Vào Nghề', emoji: '🌱', nextLevel: 10 },
  { min: 10, max: 29, name: 'GH Biết Lắng Nghe', emoji: '👂', nextLevel: 30 },
  { min: 30, max: 59, name: 'Trái Tim Ấm Áp', emoji: '🤍', nextLevel: 60 },
  { min: 60, max: 99, name: 'Bậc Thầy Yêu Thương', emoji: '🏆', nextLevel: 100 },
  { min: 100, max: 199, name: 'Tận Tâm Vô Đối', emoji: '💎', nextLevel: 200 },
  { min: 200, max: Infinity, name: 'GH Certified™', emoji: '👑', nextLevel: Infinity },
]

const ACHIEVEMENTS = [
  { score: 1, name: 'Bước Đầu Tiên', description: 'Ghi điểm lần đầu', emoji: '🎯', icon: '🎯' },
  { score: 10, name: 'GH Biết Lắng Nghe', description: 'Đạt 10 điểm', emoji: '👂', icon: '👂' },
  { score: 25, name: 'Trái Tim Ấm Áp', description: 'Đạt 25 điểm', emoji: '🤍', icon: '🤍' },
  { score: 50, name: 'Nửa Trăm Yêu Thương', description: 'Đạt 50 điểm', emoji: '🌸', icon: '🌸' },
  { score: 100, name: 'Bậc Thầy Yêu Thương', description: 'Đạt 100 điểm', emoji: '🏆', icon: '🏆' },
  { score: 200, name: 'Tận Tâm Vô Đối', description: 'Đạt 200 điểm', emoji: '💎', icon: '💎' },
]

const COMMON_REASONS = [
  'Rửa chén',
  'Khen TM đẹp',
  'Nấu ăn',
  'Massage',
  'Mua quà',
  'Lắng nghe',
  'Dọn nhà',
  'Đưa đón TM',
]

const LOCAL_STORAGE_KEYS = {
  score: 'gh-tm-score',
  log: 'gh-tm-log',
  achievements: 'gh-tm-achievements',
}

const customTheme = {
  token: {
    colorPrimary: '#ff69b4',
    colorSuccess: '#ff69b4',
    colorWarning: '#ffb6c1',
    borderRadius: 12,
  },
}

export default function HomePage() {
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(LEVELS[0])
  const [activityLog, setActivityLog] = useState([])
  const [unlockedAchievements, setUnlockedAchievements] = useState([])
  const [showReasonModal, setShowReasonModal] = useState(false)
  const [reason, setReason] = useState('')
  const [hearts, setHearts] = useState([])
  const [showAchievement, setShowAchievement] = useState(null)

  useEffect(() => {
    const savedScore = localStorage.getItem(LOCAL_STORAGE_KEYS.score)
    const savedLog = localStorage.getItem(LOCAL_STORAGE_KEYS.log)
    const savedAchievements = localStorage.getItem(LOCAL_STORAGE_KEYS.achievements)

    if (savedScore) {
      const parsedScore = parseInt(savedScore, 10)
      setScore(parsedScore)
      updateLevel(parsedScore)
    }

    if (savedLog) {
      try {
        const parsedLog = JSON.parse(savedLog)
        setActivityLog(parsedLog)
      } catch (error) {
        console.error('Failed to parse saved activity log', error)
      }
    }

    if (savedAchievements) {
      try {
        setUnlockedAchievements(JSON.parse(savedAchievements))
      } catch (error) {
        console.error('Failed to parse saved achievements', error)
      }
    }
  }, [])

  const updateLevel = (newScore) => {
    const newLevel = LEVELS.find((l) => newScore >= l.min && newScore <= l.max) || LEVELS[0]
    setLevel(newLevel)
  }

  const saveData = (newScore, newLog, newAchievements) => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.score, newScore.toString())
    localStorage.setItem(LOCAL_STORAGE_KEYS.log, JSON.stringify(newLog))
    localStorage.setItem(LOCAL_STORAGE_KEYS.achievements, JSON.stringify(newAchievements))
  }

  const checkAchievements = (newScore) => {
    const newUnlocked = [...unlockedAchievements]
    let hasNewAchievement = false
    let newAchievement = null

    ACHIEVEMENTS.forEach((achievement) => {
      if (newScore >= achievement.score && !unlockedAchievements.find((a) => a.score === achievement.score)) {
        newUnlocked.push(achievement)
        hasNewAchievement = true
        newAchievement = achievement
      }
    })

    if (hasNewAchievement) {
      setUnlockedAchievements(newUnlocked)
      setShowAchievement(newAchievement)
      setTimeout(() => setShowAchievement(null), 3000)
    }

    return newUnlocked
  }

  const createFlyingHeart = () => {
    const heart = {
      id: Date.now(),
      x: Math.random() * 100,
      y: 50,
    }
    setHearts((prev) => [...prev, heart])
    setTimeout(() => {
      setHearts((prev) => prev.filter((h) => h.id !== heart.id))
    }, 2000)
  }

  const playSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = 800
      oscillator.type = 'sine'

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.2)
    } catch (error) {
      // Sound not supported or blocked
    }
  }

  const getTimeAgo = (date) => {
    const now = new Date()
    const diff = Math.floor((now - date) / 1000)

    if (diff < 60) return 'Vừa xong'
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`
    return `${Math.floor(diff / 86400)} ngày trước`
  }

  const handleIncreaseScore = (finalReason) => {
    const newScore = score + 1
    const reasonText = finalReason || reason.trim() || COMMON_REASONS[Math.floor(Math.random() * COMMON_REASONS.length)]
    const now = new Date()

    const newLog = [
      {
        id: Date.now(),
        reason: reasonText,
        date: now.toLocaleString('vi-VN'),
        timestamp: now,
        timeAgo: 'Vừa xong',
      },
      ...activityLog,
    ]

    const newAchievements = checkAchievements(newScore)

    setScore(newScore)
    updateLevel(newScore)
    setActivityLog(newLog)
    setReason('')
    setShowReasonModal(false)

    createFlyingHeart()
    playSound()

    saveData(newScore, newLog, newAchievements)
  }

  const handleShare = () => {
    const shareMessage = `GH hiện đang ở Level ${level.name} ${level.emoji} với ${score} điểm dành cho TM 💖`

    if (navigator.share) {
      navigator
        .share({
          title: 'Score GH × TM',
          text: shareMessage,
        })
        .catch(() => {
          copyToClipboard(shareMessage)
        })
    } else {
      copyToClipboard(shareMessage)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        message.success('Đã copy! 💗')
      })
      .catch(() => {
        message.info(text)
      })
  }

  const progress = useMemo(() => {
    if (level.nextLevel === Infinity) {
      return { percentage: 100, current: 0, total: 0 }
    }
    const range = level.nextLevel - level.min
    const progressValue = score - level.min
    const percentage = Math.min(100, (progressValue / range) * 100)
    return { percentage, current: progressValue, total: range }
  }, [level, score])

  const isAchievementUnlocked = (achievement) => unlockedAchievements.some((a) => a.score === achievement.score)

  return (
    <ConfigProvider theme={customTheme}>
      <div className="app">
        <div className="container">
          <div className="header-section">
            <Title level={1} className="main-title">
              Score GH × TM <span className="heart-title">💗💗</span>
            </Title>
            <Text className="subtitle">Ghi điểm mỗi khi GH làm điều tốt cho TM</Text>
          </div>

          <Card className="score-display-card">
            <div className="score-number">{score}</div>
            <Text className="score-label">điểm yêu thương</Text>
          </Card>

          <Tag className="level-badge">
            <span className="level-emoji">{level.emoji}</span>
            {level.name}
          </Tag>

          <div className="progress-section">
            <Progress
              percent={progress.percentage}
              strokeColor={{
                '0%': '#ff1493',
                '100%': '#ff69b4',
              }}
              showInfo={false}
              className="progress-bar"
            />
            <Text className="progress-text">
              {progress.total > 0 ? `${progress.current}/${progress.total} điểm đến cấp tiếp theo` : 'Đã đạt cấp tối đa! 🎉'}
            </Text>
          </div>

          <Space direction="vertical" size="middle" style={{ width: '100%', marginBottom: 32 }}>
            <Button
              type="primary"
              size="large"
              icon={<HeartOutlined />}
              onClick={() => setShowReasonModal(true)}
              block
              className="main-action-button"
            >
              +1 điểm yêu thương 💗
            </Button>

            <Button
              type="default"
              icon={<ShareAltOutlined />}
              onClick={handleShare}
              block
              className="share-button"
            >
              Chia sẻ thành tích
            </Button>
          </Space>

          <div className="achievements-section">
            <Title level={3} className="section-title">
              <TrophyOutlined /> Thành Tựu <span>🏅</span>
            </Title>
            <Row gutter={[16, 16]}>
              {ACHIEVEMENTS.map((achievement) => {
                const unlocked = isAchievementUnlocked(achievement)
                return (
                  <Col xs={12} sm={8} key={achievement.score}>
                    <Card className={`achievement-card ${unlocked ? 'unlocked' : 'locked'}`} hoverable>
                      <div className="achievement-icon">{achievement.icon}</div>
                      <div className="achievement-name">{achievement.name}</div>
                      <div className="achievement-description">{achievement.description}</div>
                    </Card>
                  </Col>
                )
              })}
            </Row>
          </div>

          <div className="activity-log-section">
            <Title level={3} className="section-title">
              <BookOutlined /> Nhật ký yêu thương <span>📖</span>
            </Title>
            {activityLog.length === 0 ? (
              <div className="empty-log">Chưa có hoạt động nào... Hãy bắt đầu ngay! 💗</div>
            ) : (
              <List
                dataSource={activityLog.slice(0, 10)}
                renderItem={(item) => {
                  const timeAgo = item.timestamp ? getTimeAgo(new Date(item.timestamp)) : item.timeAgo
                  return (
                    <List.Item className="log-item">
                      <Space>
                        <span className="log-heart">♡</span>
                        <Text strong>{item.reason}</Text>
                        <Text type="secondary" className="log-time">
                          {timeAgo}
                        </Text>
                      </Space>
                    </List.Item>
                  )
                }}
              />
            )}
          </div>
        </div>

        <Modal
          open={showReasonModal}
          onCancel={() => {
            setShowReasonModal(false)
            setReason('')
          }}
          footer={null}
          centered
          className="reason-modal"
          width={400}
          destroyOnClose
        >
          <div className="modal-content">
            <Title level={3} className="modal-title">
              Vì sao? <span>💗</span>
            </Title>
            <Text className="modal-question">GH đã làm gì tốt cho TM?</Text>

            <Input
              placeholder="Vì sao? (Rửa chén, khen TM đẹp...)"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              onPressEnter={() => handleIncreaseScore()}
              className="reason-input"
              size="large"
            />

            <div className="quick-reasons-grid">
              {COMMON_REASONS.map((item, index) => (
                <Button key={index} className="quick-reason-btn" onClick={() => handleIncreaseScore(item)}>
                  {item}
                </Button>
              ))}
            </div>

            <div className="modal-actions">
              <Button
                onClick={() => {
                  handleIncreaseScore()
                }}
                className="skip-button"
              >
                Bỏ qua
              </Button>
              <Button
                type="primary"
                onClick={() => {
                  if (!reason.trim()) {
                    message.warning('Vui lòng nhập lý do hoặc chọn một lý do nhanh!')
                    return
                  }
                  handleIncreaseScore()
                }}
                className="confirm-button"
              >
                Xác nhận
              </Button>
            </div>
          </div>
        </Modal>

        {hearts.map((heart) => (
          <div
            key={heart.id}
            className="flying-heart"
            style={{
              left: `${heart.x}%`,
              top: `${heart.y}%`,
            }}
          >
            💗
          </div>
        ))}

        <Modal open={!!showAchievement} footer={null} closable={false} centered width={400} className="achievement-popup-modal">
          {showAchievement && (
            <Space direction="vertical" size="large" style={{ textAlign: 'center', width: '100%' }}>
              <div style={{ fontSize: '4rem' }}>{showAchievement.emoji}</div>
              <Title level={3} style={{ margin: 0, color: '#8b6914' }}>
                Thành tích mới!
              </Title>
              <Title level={2} style={{ margin: 0, color: '#8b6914' }}>
                {showAchievement.name}
              </Title>
            </Space>
          )}
        </Modal>
      </div>
    </ConfigProvider>
  )
}

