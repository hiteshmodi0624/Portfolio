'use client'

import { motion, useReducedMotion, useSpring } from 'motion/react'
import { useRef, type PointerEvent, type ReactNode } from 'react'

export interface TiltCardProps {
  children: ReactNode
  /** Resting tilt in degrees — the proof gallery scatters cards at lazy angles. */
  restRotate?: number
  maxTiltDeg?: number
  className?: string
}

/**
 * Hover-tilt wrapper for the proof gallery ("cards drift/tilt on hover").
 * Mouse-only: touch pointers are ignored (mobile-light variant), and reduced
 * motion zeroes both the tilt and the resting rotation.
 */
export function TiltCard({ children, restRotate = 0, maxTiltDeg = 8, className = '' }: TiltCardProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const prefersReducedMotion = useReducedMotion()
  const rotateX = useSpring(0, { stiffness: 180, damping: 18 })
  const rotateY = useSpring(0, { stiffness: 180, damping: 18 })

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (prefersReducedMotion || event.pointerType !== 'mouse' || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return
    const px = (event.clientX - rect.left) / rect.width - 0.5
    const py = (event.clientY - rect.top) / rect.height - 0.5
    rotateY.set(px * maxTiltDeg * 2)
    rotateX.set(-py * maxTiltDeg * 2)
  }

  function onPointerLeave() {
    rotateX.set(0)
    rotateY.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      style={{
        rotateX,
        rotateY,
        rotate: prefersReducedMotion ? 0 : restRotate,
        transformPerspective: 800,
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
