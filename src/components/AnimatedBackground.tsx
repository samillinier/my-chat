'use client'

import { useEffect, useRef } from 'react'
import ClientOnly from './ClientOnly'

declare global {
  interface Window {
    VANTA?: {
      DOTS: (options: {
        el: HTMLElement
        mouseControls?: boolean
        touchControls?: boolean
        gyroControls?: boolean
        minHeight?: number
        minWidth?: number
        scale?: number
        scaleMobile?: number
        color?: number
        color2?: number
        backgroundColor?: number
        size?: number
        spacing?: number
        showLines?: boolean
        points?: number
        maxDistance?: number
        backgroundAlpha?: number
      }) => {
        destroy: () => void
      }
    }
  }
}

interface Props {
  children: React.ReactNode
}

export default function AnimatedBackground({ children }: Props) {
  const vantaRef = useRef<HTMLDivElement>(null)
  const effectRef = useRef<any>(null)

  useEffect(() => {
    const loadScripts = async () => {
      try {
        // Load Three.js
        const threeScript = document.createElement('script')
        threeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js'
        document.head.appendChild(threeScript)

        await new Promise((resolve) => {
          threeScript.onload = resolve
        })

        // Load Vanta.js
        const vantaScript = document.createElement('script')
        vantaScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/vanta/0.5.24/vanta.dots.min.js'
        document.head.appendChild(vantaScript)

        await new Promise((resolve) => {
          vantaScript.onload = resolve
        })

        // Initialize Vanta effect
        if (vantaRef.current && !effectRef.current && window.VANTA) {
          console.log('Initializing Vanta effect...')
          effectRef.current = window.VANTA.DOTS({
            el: vantaRef.current,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.00,
            minWidth: 200.00,
            scale: 1.00,
            scaleMobile: 1.00,
            color: 0x00ff88,
            color2: 0x000a04,
            backgroundColor: 0x001a0e,
            size: 1.90,
            spacing: 29.00,
            showLines: true
          })
          console.log('Vanta effect initialized successfully')
        }
      } catch (error) {
        console.error('Failed to initialize Vanta:', error)
      }
    }

    loadScripts()

    return () => {
      if (effectRef.current) {
        console.log('Cleaning up Vanta effect')
        effectRef.current.destroy()
        effectRef.current = null
      }
    }
  }, [])

  return (
    <ClientOnly>
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-[#001a0e] to-black">
        <div 
          ref={vantaRef} 
          className="absolute inset-0"
          style={{ 
            opacity: 0.8,
            mixBlendMode: 'lighten'
          }}
        />
      </div>
      {children}
    </ClientOnly>
  )
} 