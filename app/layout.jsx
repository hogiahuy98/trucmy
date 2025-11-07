import 'antd/dist/reset.css'
import './globals.css'

export const metadata = {
  title: 'Score GH × TM',
  description: 'Theo dõi điểm yêu thương giữa GH và TM với Next.js',
  manifest: '/manifest.json',
  themeColor: '#ff4b6e',
  icons: {
    icon: '/icons/icon-192.svg',
    shortcut: '/icons/icon-192.svg',
    apple: '/icons/icon-512.svg',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  )
}

