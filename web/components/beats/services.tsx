'use client'

import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { Service, ServicesIntro } from '@/content/schema'
import { fadeRise, staggerContainer } from '@/lib/motion'
import { GlassCard } from '@/components/ui/glass-card'

export interface ServicesProps {
  intro: ServicesIntro
  services: Service[]
}

/** Hand-rolled inline icons (spec §3.3: no icon library), keyed by service
 * slug with a safe fallback. Decorative only — aria-hidden, unfocusable. */
const ICON_PROPS = {
  viewBox: '0 0 32 32',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': 'true',
  focusable: 'false',
  className: 'h-8 w-8',
} as const

/** PDF page 3 .fit treatment: the "Good if:" lead is bolded, the rest stays
 * plain. Splits at the first colon; a fit line without one renders as-is. */
function FitLine({ fit }: { fit: string }) {
  const colon = fit.indexOf(':')
  const lead = colon === -1 ? null : fit.slice(0, colon + 1)
  const rest = colon === -1 ? fit : fit.slice(colon + 1)
  return (
    <p className="service-fit mt-4 rounded-xl border border-dashed border-ink/20 bg-white/70 px-4 py-3 text-sm leading-relaxed text-ink">
      {lead === null ? null : <strong className="font-bold">{lead}</strong>}
      {rest}
    </p>
  )
}

const ICONS: Record<string, ReactNode> = {
  /** browser window with a bold CTA block — the landing page */
  'the-landing-page': (
    <svg {...ICON_PROPS}>
      <rect x="3" y="5" width="26" height="22" rx="3" />
      <path d="M3 11h26" />
      <path d="M7 8h.01M11 8h.01" />
      <path d="M8 17h10" />
      <rect x="8" y="20" width="7" height="3" rx="1.5" fill="currentColor" stroke="none" />
    </svg>
  ),
  /** chat bubble with a spark — the AI employee, answering at 2:14 AM */
  'the-ai-employee': (
    <svg {...ICON_PROPS}>
      <path d="M5 6h16a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3H12l-5 5v-5H5a3 3 0 0 1-3-3V9a3 3 0 0 1 3-3Z" />
      <path d="M26 4v4M24 6h4" />
      <path d="M8 12h10M8 15.5h6" />
    </svg>
  ),
  /** stacked layers — the full build, idea to live product */
  'the-full-build': (
    <svg {...ICON_PROPS}>
      <path d="m16 4 12 6-12 6L4 10l12-6Z" />
      <path d="m4 16 12 6 12-6" />
      <path d="m4 22 12 6 12-6" />
    </svg>
  ),
}

/** Beat 6 — the three service doors (spec §3.3). One glass card per service,
 * fed entirely by content/services.ts through props. The deliverables list is
 * ALWAYS in the DOM; a pure-CSS gate (.service-door in globals.css) hides it
 * until hover/focus only where hovering exists and motion is allowed. */
export function Services({ intro, services }: ServicesProps) {
  return (
    <section aria-label="Services" className="relative overflow-x-clip">
      <div className="mx-auto max-w-5xl px-6 py-24">
        <motion.header
          variants={fadeRise}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          className="text-center"
        >
          <h2 className="font-display text-4xl font-semibold tracking-tight text-ink md:text-5xl">
            {intro.heading}
          </h2>
          <p className="mt-4 text-muted">{intro.lede}</p>
        </motion.header>
        <motion.ul
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="mt-14 grid list-none gap-6 md:grid-cols-3"
        >
          {services.map((service) => (
            <motion.li key={service.slug} variants={fadeRise} className="h-full">
              <GlassCard className="service-door flex h-full flex-col p-6 text-left">
                <span aria-hidden="true" className="text-violet">
                  {ICONS[service.slug] ?? ICONS['the-full-build']}
                </span>
                <h3 className="mt-4 font-display text-2xl font-semibold text-ink">
                  {service.title}
                </h3>
                <p className="mt-2 text-muted">{service.hook}</p>
                <div className="service-door-list mt-4">
                  <ul className="list-disc space-y-2 pl-5 text-sm text-muted">
                    {service.deliverables.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <FitLine fit={service.fit} />
                <p className="mt-auto pt-4 font-mono text-xs text-muted">{service.timeline}</p>
                <a
                  href="#finale"
                  className="mt-4 inline-block rounded-full bg-ink px-6 py-3 text-center text-sm font-bold text-white transition hover:bg-ink/90"
                >
                  {service.ctaLabel}
                </a>
              </GlassCard>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  )
}
