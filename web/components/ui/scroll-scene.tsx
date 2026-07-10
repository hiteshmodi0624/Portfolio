'use client'

import { supportsFlags, useScroll, useReducedMotion, type MotionValue } from 'motion/react'
import { useRef, type ReactNode } from 'react'
import { useMediaQuery } from '@/lib/use-media'

/**
 * Force motion/react off the native ViewTimeline/ScrollTimeline acceleration
 * path for every `useScroll` call in this module.
 *
 * Root cause (p2-task-10 report, "Fix round 1"): `useScroll`'s `['start
 * start', 'end end']` offset — the standard "pin the whole section, scrub
 * start-to-end" pattern — maps (via motion/react's own offset-to-range
 * preset table) to the CSS named range `contain 0%`–`contain 100%`. Per the
 * scroll-driven-animations spec, "contain" is only well-defined while the
 * *entire* subject box fits inside the scrollport at some scroll position —
 * true for typical reveal-on-scroll elements, but never true here: every
 * `ScrollScene` pins a subject 3 viewport-heights tall specifically so it can
 * be scrubbed *through*, not "contained". Confirmed by direct repro against
 * the production build (real, continuous mouse-wheel scrolling, no
 * Playwright-only scroll pattern): Chromium's native acceleration produces a
 * non-monotonic progress curve for this offset+geometry combination — e.g. a
 * pinned card's derived opacity rises then falls back toward 0 as real
 * scrollY only ever increases — independent of any mount-timing race (an
 * earlier fix attempt that re-keyed the section on the fallback→scrub swap,
 * forcing a fresh `useScroll` registration against already-settled geometry,
 * produced byte-identical results, ruling out a stale-geometry-at-creation
 * theory). `supportsFlags` is `motion-dom`'s own public, typed override for
 * exactly this kind of environment mismatch (see
 * node_modules/motion-dom/dist/es/utils/supports/flags.mjs) — setting it
 * forces every `useScroll` in the app onto the equally-correct, JS
 * `scroll`-listener path, which tracks this offset correctly.
 */
supportsFlags.scrollTimeline = false
supportsFlags.viewTimeline = false

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
