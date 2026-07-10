'use client'

import { motion } from 'motion/react'
import type { FinaleContent } from '@/content/schema'
import { fadeRise } from '@/lib/motion'
import { SparkleField } from '@/components/ui/sparkle-field'

export interface FinaleProps {
  finale: FinaleContent
}

/** Beat 8 — "Let's build your magic". The hero's sparkles return, denser,
 * gathering around the CTA. cal.com is a plain link in P1 (embed lands in P3).
 * Reduced motion is handled by the page-level `MotionConfig` (see
 * components/motion-provider): it degrades the transform to an instant snap
 * while keeping the opacity fade — this component stays plain variant
 * orchestration with no manual branching. */
export function Finale({ finale }: FinaleProps) {
  return (
    <section
      id="finale"
      aria-label="Contact"
      className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 text-center"
    >
      <SparkleField density={40} className="absolute inset-0 -z-10" />

      <motion.div
        variants={fadeRise}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
        className="flex flex-col items-center"
      >
        <h2 className="max-w-3xl font-display text-4xl font-semibold tracking-tight text-ink md:text-6xl">
          {finale.heading}
        </h2>
        <p className="mt-4 max-w-md text-muted">
          Tell me what&apos;s eating your week. I&apos;ll tell you what we can automate, and what
          your website could be doing for you.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <a
            href={finale.calUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-violet px-8 py-4 text-xl font-bold text-white shadow-lg shadow-violet/25 transition hover:bg-violet/90"
          >
            Book a call
          </a>
          <a
            href={`mailto:${finale.email}`}
            className="font-mono text-sm text-muted underline underline-offset-4 transition hover:text-ink"
          >
            {finale.email}
          </a>
        </div>
      </motion.div>

      <footer className="absolute bottom-6 text-xs text-muted">
        © Hitesh Modi · Built end-to-end by one engineer
      </footer>
    </section>
  )
}
