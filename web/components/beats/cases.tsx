'use client'

import { motion } from 'motion/react'
import type { CaseStudy, CasesContent } from '@/content/schema'
import { fadeRise, staggerContainer } from '@/lib/motion'
import { displayHost } from '@/lib/url'
import { GlassCard } from '@/components/ui/glass-card'

export interface CasesProps {
  cases: CasesContent
}

/** Chip tints — the PDF's .chip palette on the site's pastel washes. */
const TONE_CLASSES: Record<CaseStudy['category']['tone'], string> = {
  sky: 'border-sky/40 bg-wash-sky text-[#1C7ED6]',
  violet: 'border-violet/35 bg-wash-lavender text-violet',
  blush: 'border-blush/40 bg-wash-blush text-[#D6336C]',
}

/** Fake browser frame mirroring the PDF's .browser treatment: three dots,
 * hostname pill, screenshot below. Decorative dots are aria-hidden. */
function BrowserFrame({ image, host }: { image: CaseStudy['image']; host: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-xl shadow-ink/15">
      <div className="flex items-center gap-1.5 border-b border-ink/5 bg-ink/5 px-3 py-2">
        <span aria-hidden="true" className="block h-2 w-2 rounded-full bg-chaos-red" />
        <span aria-hidden="true" className="block h-2 w-2 rounded-full bg-chaos-amber" />
        <span aria-hidden="true" className="block h-2 w-2 rounded-full bg-[#34C759]" />
        <span className="ml-2 rounded-md bg-white px-2.5 py-0.5 font-mono text-xs font-semibold text-violet">
          {host}
        </span>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element -- committed
          static asset; explicit dims prevent CLS */}
      <img
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        loading="lazy"
        className="h-auto w-full"
      />
    </div>
  )
}

/** Deep case studies — the PDF portfolio's four case pages (4–7) as one
 * scrolling beat. Each case alternates text | screenshot on md+; on mobile
 * the screenshot stacks first. All copy flows from content/case-studies.ts. */
export function Cases({ cases }: CasesProps) {
  return (
    <section aria-label="Case studies" className="relative overflow-x-clip px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <motion.header
          variants={fadeRise}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          className="text-center"
        >
          <h2 className="font-display text-4xl font-semibold tracking-tight text-ink md:text-5xl">
            {cases.heading}
          </h2>
          <p className="mt-4 text-muted">{cases.lede}</p>
        </motion.header>

        {cases.items.map((item, index) => {
          const host = displayHost(item.url)
          // md+: even cases read text | screenshot, odd cases flip.
          const shotOrder = index % 2 === 0 ? 'md:order-2' : 'md:order-1'
          const textOrder = index % 2 === 0 ? 'md:order-1' : 'md:order-2'
          return (
            <motion.article
              key={item.slug}
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              className="mt-16 grid items-center gap-8 md:mt-24 md:grid-cols-2 md:gap-12"
            >
              {/* Screenshot first in the DOM so mobile stacks it on top. */}
              <motion.div variants={fadeRise} className={shotOrder}>
                <BrowserFrame image={item.image} host={host} />
                <p className="mt-3 text-center font-mono text-xs text-muted">{item.tech}</p>
              </motion.div>

              <motion.div variants={fadeRise} className={textOrder}>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                    Case study {String(index + 1).padStart(2, '0')}
                  </span>
                  <span
                    className={`rounded-full border px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider ${TONE_CLASSES[item.category.tone]}`}
                  >
                    {item.category.label}
                  </span>
                </div>

                <h3 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-tight text-ink">
                  {item.heading}
                </h3>

                {item.blocks.map((block) => (
                  <div key={block.label} className="mt-5">
                    <h4 className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                      {block.label}
                    </h4>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink/80">{block.body}</p>
                  </div>
                ))}

                <dl className="mt-6 grid grid-cols-3 gap-3">
                  {item.stats.map((stat) => (
                    <GlassCard key={stat.label} className="flex flex-col-reverse p-4">
                      <dt className="mt-1 text-xs leading-snug text-muted">{stat.label}</dt>
                      <dd className="font-display text-2xl font-semibold text-violet">
                        {stat.value}
                      </dd>
                    </GlassCard>
                  ))}
                </dl>

                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-7 inline-block rounded-full bg-violet px-6 py-3 font-mono text-sm font-bold text-white shadow-lg shadow-violet/30 transition hover:bg-violet/90"
                >
                  see it live → {host}
                </a>
              </motion.div>
            </motion.article>
          )
        })}
      </div>
    </section>
  )
}
