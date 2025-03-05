import './globals.css'
import RootClientWrapper from '@/components/RootClientWrapper'

export const metadata = {
  title: 'Jasmine AI',
  description: 'Your AI Assistant',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <RootClientWrapper>{children}</RootClientWrapper>
}
