declare module 'vanta/dist/vanta.dots.min.js' {
  import { Object3D } from 'three'

  export interface VantaDotsOptions {
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
    THREE: typeof import('three')
  }

  export interface VantaEffect extends Object3D {
    destroy: () => void
  }

  const VantaDots: (options: VantaDotsOptions) => VantaEffect
  export default VantaDots
} 