'use client'

import { useEffect, useState } from 'react'
import ClientOnly from './ClientOnly'

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <div suppressHydrationWarning>
      {children}
    </div>
  )
} 