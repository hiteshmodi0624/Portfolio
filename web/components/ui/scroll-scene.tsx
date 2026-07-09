'use client'

import { useScroll, useReducedMotion, type MotionValue } from 'motion/react'
import { useRef, type ReactNode } from 'react'
import { useMediaQuery } from '@/lib/use-media'

export interface ScrollSceneProps {
  id?: string
  /** Landmark label — every beat keeps a stable aria-label for tests. */
  ariaLabel: string
  /** Pin duration: total section height in viewport-heights while scrubbing. */
  lengthSvh: number
  /** Scrubbed scene. Receives pin progress 0→1 while the viewport is inside the section. */
  scene: (progress: MotionValue<number>) => ReactNode
  /**
   * Static variant — FULLY readable with no scroll-scrubbing (spec §4:
   * reduced-motion + mobile-light variants are mandatory per scene).
   * Rendered on the server / first client paint (static-export HTML, SEO,
   * no-JS), under prefers-reduced-motion, and below 768px.
   */
  fallback: ReactNode
  className?: string
}

/**
 * Sticky pinning + useScroll scrub (spec §4). The scrubbed scene is a pure
 * client-side enhancement: the section always ships the readable fallback in
 * HTML and only swaps to the pinned scene after mount, when the viewport is
 * wide AND the visitor has not asked for reduced motion. MotionConfig cannot
 * strip style-bound motion values, so this gate is explicit by design.
 */
export function ScrollScene({
  id,
  ariaLabel,
  lengthSvh,
  scene,
  fallback,
  className = '',
}: ScrollSceneProps) {
  const ref = useRef<HTMLElement | null>(null)
  const prefersReducedMotion = useReducedMotion()
  const isWide = useMediaQuery('(min-width: 768px)')
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const scrub = isWide && !prefersReducedMotion

  return (
    <section
      id={id}
      ref={ref}
      aria-label={ariaLabel}
      className={className}
      style={scrub ? { height: `${lengthSvh * 100}svh` } : undefined}
    >
      {scrub ? (
        <div className="sticky top-0 flex h-svh flex-col items-center justify-center overflow-hidden px-6">
          {scene(scrollYProgress)}
        </div>
      ) : (
        fallback
      )}
    </section>
  )
}
