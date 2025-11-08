'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button, Card, Typography, Space, ConfigProvider } from 'antd'
import { Lock, RotateCcw } from 'lucide-react'

const { Title, Text } = Typography

const EMOJI_OPTIONS = ['🐶', '☕', '💋', '🐢', '🍕', '🌮', '🧋', '🎮', '🏠', '🛒']

// Fisher-Yates shuffle algorithm
function shuffleArray(array) {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Default pattern (có thể override bằng env)
const DEFAULT_PATTERN = ['🐶', '☕', '💋']
const PATTERN_LENGTH = 3

export default function AuthPage() {
  const router = useRouter()
  const [selectedPattern, setSelectedPattern] = useState([])
  const [isShaking, setIsShaking] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [emojiGrid] = useState(() => shuffleArray(EMOJI_OPTIONS))
  const [correctPattern] = useState(() => {
    // Có thể đọc từ env sau, hiện tại dùng default
    return DEFAULT_PATTERN
  })

  const handleEmojiClick = (emoji) => {
    if (selectedPattern.length >= PATTERN_LENGTH) return

    setSelectedPattern([...selectedPattern, emoji])
    setErrorMessage('')
  }

  const handleReset = () => {
    setSelectedPattern([])
    setErrorMessage('')
  }

  const handleUnlock = async () => {
    if (selectedPattern.length !== PATTERN_LENGTH) {
      setErrorMessage('Chọn đủ 3 emoji nhé! 💕')
      setIsShaking(true)
      setTimeout(() => setIsShaking(false), 500)
      return
    }

    // Check pattern
    const isCorrect = selectedPattern.every((emoji, index) => emoji === correctPattern[index])

    if (isCorrect) {
      // Set cookie (3 hours)
      const expires = new Date()
      expires.setTime(expires.getTime() + 3 * 60 * 60 * 1000)
      document.cookie = `gh_tm_auth=1; expires=${expires.toUTCString()}; path=/`

      // Redirect to chi-tieu
      router.push('/chi-tieu')
    } else {
      setErrorMessage('Sai rồi nha 😏 chỉ có H&M biết pattern này thôi.')
      setIsShaking(true)
      setTimeout(() => setIsShaking(false), 500)
      setSelectedPattern([])
    }
  }

  const theme = {
    token: {
      colorPrimary: '#ff4b6e',
      borderRadius: 12,
    },
  }

  return (
    <ConfigProvider theme={theme}>
      <div className="auth-container">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="auth-card-wrapper"
      >
        <Card className="auth-card">
          <div className="auth-header">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Title level={2} className="auth-title">
                H&M — Private Access
              </Title>
            </motion.div>
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Text className="auth-subtitle">
                Chọn đúng thứ tự 3 emoji (H&M biết thôi)
              </Text>
            </motion.div>
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="pattern-display"
          >
            <Space size="large">
              {Array.from({ length: PATTERN_LENGTH }).map((_, index) => (
                <motion.div
                  key={index}
                  className={`pattern-slot ${selectedPattern[index] ? 'filled' : ''}`}
                  animate={isShaking ? { x: [0, -10, 10, -10, 10, 0] } : {}}
                  transition={{ duration: 0.5 }}
                >
                  {selectedPattern[index] || '•'}
                </motion.div>
              ))}
            </Space>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="emoji-grid"
          >
            {emojiGrid.map((emoji, index) => (
              <motion.button
                key={index}
                type="button"
                className="emoji-btn"
                onClick={() => handleEmojiClick(emoji)}
                disabled={selectedPattern.length >= PATTERN_LENGTH}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.05 }}
              >
                {emoji}
              </motion.button>
            ))}
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="auth-actions"
          >
            <Space size="middle">
              <Button
                icon={<RotateCcw size={16} />}
                onClick={handleReset}
                disabled={selectedPattern.length === 0}
                className="reset-btn"
              >
                Reset
              </Button>
              <Button
                type="primary"
                icon={<Lock size={16} />}
                onClick={handleUnlock}
                disabled={selectedPattern.length !== PATTERN_LENGTH}
                className="unlock-btn"
              >
                Unlock
              </Button>
            </Space>
          </motion.div>

          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="error-message"
              >
                {errorMessage}
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </div>
    </ConfigProvider>
  )
}

