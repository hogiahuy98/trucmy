import type { Metadata } from 'next'
import ServiceWorkerRegistration from './components/ServiceWorkerRegistration'

export const metadata: Metadata = {
  title: 'Ăn gì hôm nay',
  description: 'Ứng dụng chọn món, vote món và gợi ý món hằng ngày cho các cặp đôi.',
  manifest: '/an-gi/manifest',
  themeColor: '#A3C68C',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Ăn gì',
  },
  icons: {
    icon: [
      { url: '/icons/angi-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/angi-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/angi-192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
}

export default function AnGiLayout({
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

