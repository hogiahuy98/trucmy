'use client'

import { Spin } from 'antd'
import { ConfigProvider } from 'antd'
import styles from '../styles/loading.module.scss'

const theme = {
  token: {
    colorPrimary: '#ff4b6e',
  },
}

export default function LoadingIndicator() {
  return (
    <ConfigProvider theme={theme}>
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <Spin size="large" />
          <p className={styles.loadingText}>Đang tải dữ liệu...</p>
        </div>
      </div>
    </ConfigProvider>
  )
}

