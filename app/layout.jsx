import './globals.css'
import { Toaster } from '@/components/ui/toaster'

export const metadata = {
  title: 'Score H&M',
  description: 'Theo dõi điểm yêu thương giữa H&M với Next.js',
  manifest: '/manifest.json',
  themeColor: '#FAF8F4',
  icons: {
    icon: '/icons/icon-192.svg',
    shortcut: '/icons/icon-192.svg',
    apple: '/icons/icon-512.svg',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}

