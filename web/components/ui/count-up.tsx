'use client'

import { animate, useInView, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

export interface CountUpProps {
  to: number
  /** 'plain' → 1,850 · 'compact' → 1M */
  notation?: 'plain' | 'compact'
  durationS?: number
  className?: string
}

const formatters = {
  plain: new Intl.NumberFormat('en-US'),
  compact: new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 0 }),
} as const

/**
 * "Counters count up on entry" (spec §3, beat 5). The static HTML carries the
 * FINAL value so no-JS, reduced-motion, and pre-scroll visitors always read
 * the real number; when the span scrolls into view with motion allowed, it
 * re-runs 0 → `to` once. Number formatting only — the numbers themselves come
 * from the stats content module, never from components.
 */
export function CountUp({ to, notation = 'plain', durationS = 1.4, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement | null>(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })
  const prefersReducedMotion = useReducedMotion()
  const [display, setDisplay] = useState(() => formatters[notation].format(to))

  useEffect(() => {
    if (!inView || prefersReducedMotion) return
    const controls = animate(0, to, {
      duration: durationS,
      ease: 'easeOut',
      onUpdate: (latest) => setDisplay(formatters[notation].format(Math.round(latest))),
    })
    return () => controls.stop()
  }, [inView, prefersReducedMotion, to, durationS, notation])

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  )
}
