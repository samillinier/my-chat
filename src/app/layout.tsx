import './globals.css'
import { Inter } from 'next/font/google'
import AppWrapper from '@/components/AppWrapper'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Jasmine AI',
  description: 'Your AI Assistant',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-[#001a11]`} suppressHydrationWarning>
        <AppWrapper>
          {children}
        </AppWrapper>
      </body>
    </html>
  )
}
