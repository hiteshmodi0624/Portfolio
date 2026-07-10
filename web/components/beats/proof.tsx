'use client'

import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import type { ProofContent } from '@/content/schema'
import { fadeRise, staggerContainer } from '@/lib/motion'
import { displayHost } from '@/lib/url'
import { useMediaQuery } from '@/lib/use-media'
import { GlassCard } from '@/components/ui/glass-card'
import { TiltCard } from '@/components/ui/tilt-card'

export interface ProofProps {
  proof: ProofContent
}

/** Lazy scatter angles for the floating gallery. */
const REST_ROTATIONS = [-2, 1.5, -1, 2.5, -1.5, 1]

/** Beat 5 — "Built before. Shipped before." Floating tilted gallery (the
 * results ticker moved into the hero's stats shelf in P4). Parallax
 * and tilt are gated (wide viewport + motion allowed); reduced motion and
 * mobile get the same content with opacity fades only. */
export function Proof({ proof }: ProofProps) {
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
                    {project.image ? (
                      <div className="mb-4 -rotate-1 overflow-hidden rounded-xl border border-white/60 shadow-md shadow-ink/10">
                        {/* eslint-disable-next-line @next/next/no-img-element -- committed
                            static asset; explicit dims prevent CLS (spec §3.5) */}
                        <img
                          src={project.image.src}
                          alt={project.image.alt}
                          width={project.image.width}
                          height={project.image.height}
                          loading="lazy"
                          className="h-auto w-full"
                        />
                      </div>
                    ) : null}
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {project.logo ? (
                          // eslint-disable-next-line @next/next/no-img-element -- committed favicon chip
                          <img
                            src={project.logo.src}
                            alt={project.logo.alt}
                            width={20}
                            height={20}
                            loading="lazy"
                            className="h-5 w-5 rounded"
                          />
                        ) : null}
                        <h3 className="font-display text-xl font-semibold text-ink">{project.name}</h3>
                      </div>
                      {/* every card wears a kind chip, PDF chip palette:
                          client = sky wash, own product = lavender wash.
                          Text darkened one step past the PDF for WCAG AA at
                          12px: #1971C2 on #EEF7FF = 4.63:1, #6741D9 on
                          #F5F3FF = 5.74:1 (see cases.tsx TONE_CLASSES). */}
                      <span
                        className={`shrink-0 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs ${
                          project.kind === 'client'
                            ? 'border-sky/40 bg-wash-sky text-[#1971C2]'
                            : 'border-violet/35 bg-wash-lavender text-[#6741D9]'
                        }`}
                      >
                        {project.kind === 'client' ? 'client work' : 'my own product'}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted">{project.tagline}</p>
                    <p className="mt-4 text-sm font-medium text-ink">{project.outcome}</p>
                    {project.url ? (
                      <div className="mt-auto pt-4">
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block rounded-full bg-wash-lavender px-3.5 py-1.5 font-mono text-xs font-semibold text-[#6741D9] transition hover:bg-[#6741D9] hover:text-white"
                        >
                          {displayHost(project.url)} ↗
                        </a>
                      </div>
                    ) : null}
                  </GlassCard>
                </TiltCard>
              </motion.div>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  )
}
