'use client'

import { Inter } from 'next/font/google'
import ClientLayout from './ClientLayout'

const inter = Inter({ subsets: ['latin'] })

export default function RootClientWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-[#001a11]`} suppressHydrationWarning>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  )
} 