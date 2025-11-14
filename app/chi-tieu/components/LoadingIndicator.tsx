'use client'

import { Loader2 } from 'lucide-react'
import styles from '../styles/loading.module.scss'

export default function LoadingIndicator() {
  return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
        <Loader2 className="w-12 h-12 animate-spin text-avocado-green" />
          <p className={styles.loadingText}>Đang tải dữ liệu...</p>
        </div>
      </div>
  )
}

