export type LoadingText = { text: string }

export type Position = {
  x: number
  y: number
}

export type WindowSize = {
  width: number
  height: number
}

export type Particle = {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  opacity: number
}

export type GlassyBlurSkeletonProps = {
  position: Position
  initialWindowSize: WindowSize
  opacity?: number
  blur?: number
  borderRadius?: string
}

export type WindowProps = {
  title: string
  children: React.ReactNode
  onClose: () => void
  initialPosition: { x: number; y: number }
  status?: React.ReactElement
}

export type WindowHeaderProps = {
  title: string
  onClose: () => void
  toggleWindowFullScreen: () => void
  toggleFullScreen: () => void
  onMouseDown: (e: React.MouseEvent) => void
  status?: React.ReactElement
  isSmallScreen: boolean
}
