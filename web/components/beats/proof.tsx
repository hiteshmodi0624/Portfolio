'use client'

import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import type { ProofContent, TickerItem } from '@/content/schema'
import { fadeRise, staggerContainer } from '@/lib/motion'
import { useMediaQuery } from '@/lib/use-media'
import { CountUp } from '@/components/ui/count-up'
import { GlassCard } from '@/components/ui/glass-card'
import { TiltCard } from '@/components/ui/tilt-card'

export interface ProofProps {
  proof: ProofContent
  ticker: TickerItem[]
}

/** Lazy scatter angles for the floating gallery. */
const REST_ROTATIONS = [-2, 1.5, -1, 2.5, -1.5, 1]

/** Beat 5 — "Built before. Shipped before." Floating tilted gallery with a
 * results ticker whose numbers flow from the stats content module. Parallax
 * and tilt are gated (wide viewport + motion allowed); reduced motion and
 * mobile get the same content with opacity fades only. */
export function Proof({ proof, ticker }: ProofProps) {
  const ref = useRef<HTMLElement | null>(null)
  const prefersReducedMotion = useReducedMotion()
  const isWide = useMediaQuery('(min-width: 768px)')
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const drift = useTransform(scrollYProgress, [0, 1], [32, -32])
  const parallax = isWide && !prefersReducedMotion

  return (
    <section ref={ref} aria-label="Proof" className="relative overflow-hidden px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <motion.header
          variants={fadeRise}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          className="text-center"
        >
          <h2 className="font-display text-4xl font-semibold tracking-tight text-ink md:text-5xl">
            {proof.heading}
          </h2>
          <p className="mt-4 text-muted">{proof.lede}</p>
        </motion.header>

        <motion.ul
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="mt-14 grid list-none gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {proof.projects.map((project, index) => (
            <motion.li key={project.slug} variants={fadeRise}>
              <motion.div style={parallax && index % 2 === 1 ? { y: drift } : undefined} className="h-full">
                <TiltCard restRotate={REST_ROTATIONS[index % REST_ROTATIONS.length]} className="h-full">
                  <GlassCard className="flex h-full flex-col p-6 text-left">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="font-display text-xl font-semibold text-ink">{project.name}</h3>
                      {project.kind === 'client' ? (
                        <span className="rounded-full bg-wash-sky px-2.5 py-0.5 text-xs text-muted">
                          client work
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm text-muted">{project.tagline}</p>
                    <p className="mt-4 text-sm font-medium text-ink">{project.outcome}</p>
                    {project.url ? (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-auto pt-4 font-mono text-xs text-muted underline underline-offset-4 transition hover:text-ink"
                      >
                        {new URL(project.url).hostname} ↗
                      </a>
                    ) : null}
                  </GlassCard>
                </TiltCard>
              </motion.div>
            </motion.li>
          ))}
        </motion.ul>

        <dl className="mt-16 grid gap-4 sm:grid-cols-3">
          {ticker.map((item) => (
            <GlassCard key={item.id} className="flex flex-col-reverse p-6 text-center">
              <dt className="mt-1 text-sm text-muted">{item.label}</dt>
              <dd className="font-display text-4xl font-semibold text-ink">
                <CountUp to={item.value} notation={item.notation} />
                {item.suffix}
              </dd>
            </GlassCard>
          ))}
        </dl>
      </div>
    </section>
  )
}
