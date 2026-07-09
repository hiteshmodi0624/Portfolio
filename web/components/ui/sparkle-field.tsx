'use client'

import { useEffect, useRef, useState } from 'react'

interface Sparkle {
  x: number
  y: number
  radius: number
  vx: number
  vy: number
  baseAlpha: number
  phase: number
  color: string
}

const SPARKLE_COLORS = ['#7C5CFF', '#4DABF7', '#F783AC'] // violet, sky, blush

export interface SparkleFieldProps {
  /** How many sparkles to render (absolute count). */
  density?: number
  /** Sparkles drift gently toward the cursor (hero only). */
  followCursor?: boolean
  className?: string
}

/**
 * Lightweight 2D-canvas sparkle layer. Decorative only (aria-hidden,
 * pointer-events-none). Renders nothing under prefers-reduced-motion.
 */
export function SparkleField({
  density = 28,
  followCursor = false,
  className = '',
}: SparkleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  // null = unknown (also the SSR value, so hydration matches), then boolean.
  const [motionAllowed, setMotionAllowed] = useState<boolean | null>(null)

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setMotionAllowed(!query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (motionAllowed !== true) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return // jsdom and very old browsers: skip animation, keep element

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let sparkles: Sparkle[] = []
    let frame = 0
    const pointer = { x: -1, y: -1, active: false }

    function seed() {
      if (!canvas) return
      canvas.width = canvas.clientWidth * dpr
      canvas.height = canvas.clientHeight * dpr
      sparkles = Array.from({ length: density }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: (0.6 + Math.random() * 1.6) * dpr,
        vx: (Math.random() - 0.5) * 0.15 * dpr,
        vy: (Math.random() - 0.5) * 0.15 * dpr,
        baseAlpha: 0.25 + Math.random() * 0.55,
        phase: Math.random() * Math.PI * 2,
        color: SPARKLE_COLORS[Math.floor(Math.random() * SPARKLE_COLORS.length)],
      }))
    }

    function onPointerMove(event: PointerEvent) {
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      pointer.x = (event.clientX - rect.left) * dpr
      pointer.y = (event.clientY - rect.top) * dpr
      pointer.active = true
    }

    function tick() {
      if (!canvas || !ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const s of sparkles) {
        s.phase += 0.02
        if (followCursor && pointer.active) {
          // gentle attraction, capped so sparkles drift rather than chase
          s.vx = Math.max(-0.4 * dpr, Math.min(0.4 * dpr, s.vx + (pointer.x - s.x) * 0.000015))
          s.vy = Math.max(-0.4 * dpr, Math.min(0.4 * dpr, s.vy + (pointer.y - s.y) * 0.000015))
        }
        s.x = (s.x + s.vx + canvas.width) % canvas.width
        s.y = (s.y + s.vy + canvas.height) % canvas.height
        ctx.globalAlpha = s.baseAlpha * (0.5 + 0.5 * Math.sin(s.phase))
        ctx.fillStyle = s.color
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
      frame = window.requestAnimationFrame(tick)
    }

    seed()
    frame = window.requestAnimationFrame(tick)
    window.addEventListener('resize', seed)
    if (followCursor) window.addEventListener('pointermove', onPointerMove)

    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('resize', seed)
      if (followCursor) window.removeEventListener('pointermove', onPointerMove)
    }
  }, [motionAllowed, density, followCursor])

  if (motionAllowed !== true) return null

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none ${className}`}
    />
  )
}
