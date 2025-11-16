import type { Metadata } from 'next'
import ServiceWorkerRegistration from './components/ServiceWorkerRegistration'

export const metadata: Metadata = {
  title: 'Chi tiêu Huy My',
  description: 'Ứng dụng quản lý chi tiêu cho các cặp đôi, theo dõi chi tiêu hàng ngày và thống kê.',
  manifest: '/chi-tieu/manifest',
  themeColor: '#A3C68C',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Chi tiêu',
  },
  icons: {
    icon: [
      { url: '/icons/rabbit-svgrepo-com.svg', sizes: '192x192', type: 'image/svg+xml' },
      { url: '/icons/rabbit-svgrepo-com.svg', sizes: '512x512', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/icons/rabbit-svgrepo-com.svg', sizes: '192x192', type: 'image/svg+xml' },
    ],
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
}

export default function ChiTieuLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* PWA Meta Tags - These will be added to <head> by Next.js metadata */}
      <ServiceWorkerRegistration />
      {children}
    </>
  )
}

