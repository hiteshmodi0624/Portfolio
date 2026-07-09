'use client'

import type { ReactNode } from 'react'
import { MotionConfig } from 'motion/react'

export interface MotionProviderProps {
  children: ReactNode
}

/**
 * Root motion boundary for the page. `page.tsx` is a server component, so
 * this tiny client wrapper is the boundary that lets every beat share one
 * reduced-motion policy: `reducedMotion="user"` makes motion/react
 * automatically degrade transform-based animations (translate, scale,
 * rotate) to an instant snap while leaving opacity fades intact, whenever
 * the visitor's OS requests reduced motion. Beats themselves stay dumb —
 * plain `variants`/`initial`/`animate` — with no manual `reduce ? … : …`
 * branching (see spec §6).
 */
export function MotionProvider({ children }: MotionProviderProps) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}
