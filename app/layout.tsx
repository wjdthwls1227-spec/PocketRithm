import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '포켓리즘 - 지출 회고로 만드는 나만의 소비 습관',
  description: '지출 패턴을 분석하고 회고를 통해 더 나은 소비 습관을 만드는 서비스',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>{children}</body>
    </html>
  )
}

