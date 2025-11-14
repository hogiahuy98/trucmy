'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to chi-tieu page
    router.push('/chi-tieu')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-dark-olive mb-4">
          Đang chuyển hướng...
        </h1>
        <p className="text-olive-grey">
          Chuyển đến trang quản lý chi tiêu
        </p>
      </div>
    </div>
  )
}
