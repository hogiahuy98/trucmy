import 'antd/dist/reset.css'
import './globals.css'

export const metadata = {
  title: 'Score GH × TM',
  description: 'Theo dõi điểm yêu thương giữa GH và TM với Next.js',
}

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  )
}

