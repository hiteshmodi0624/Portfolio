'use client'

import { motion, useReducedMotion } from 'motion/react'
import type { HeroContent } from '@/content/schema'
import { fadeRise, staggerContainer } from '@/lib/motion'
import { SparkleField } from '@/components/ui/sparkle-field'

export interface HeroProps {
  hero: HeroContent
}

/** Beat 1 — "A little magic for your business." Words materialize; gradient
 * breathes; sparkles drift and gently follow the cursor. Under reduced motion
 * everything renders statically: no transforms, no sparkles. */
export function Hero({ hero }: HeroProps) {
  const reduce = useReducedMotion()
  const words = hero.h1.split(' ')

  return (
    <section
      aria-label="Intro"
      className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 text-center"
    >
      <div aria-hidden="true" className="hero-wash -z-10" />
      <SparkleField followCursor density={28} className="absolute inset-0 -z-10" />

      <p className="inline-flex items-center gap-2 rounded-full border border-violet/30 bg-white/60 px-4 py-1.5 text-sm text-muted backdrop-blur">
        <span aria-hidden="true" className="badge-dot h-2 w-2 rounded-full bg-violet" />
        {hero.availability}
      </p>

      <motion.h1
        variants={reduce ? undefined : staggerContainer}
        initial={reduce ? false : 'hidden'}
        animate="visible"
        className="mt-8 max-w-4xl font-display text-5xl font-semibold tracking-tight text-ink md:text-7xl"
      >
        {words.map((word, index) => (
          <motion.span
            key={`${word}-${index}`}
            variants={reduce ? undefined : fadeRise}
            className={`inline-block ${word.startsWith('magic') ? 'text-violet' : ''}`}
          >
            {word}
            {/* , not a plain space: trailing whitespace inside an
                inline-block span collapses and would glue the words together */}
            {index < words.length - 1 ? ' ' : ''}
          </motion.span>
        ))}
      </motion.h1>

      <p className="mt-6 max-w-xl text-lg text-muted">{hero.sub}</p>

      <a
        href={hero.ctaHref}
        className="mt-10 rounded-full bg-violet px-8 py-4 text-xl font-bold text-white shadow-lg shadow-violet/25 transition hover:bg-violet/90"
      >
        {hero.ctaLabel}
      </a>

      <a
        href={hero.ctaHref}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 font-mono text-sm text-muted transition hover:text-ink"
      >
        {hero.scrollCue}
      </a>
    </section>
  )
}