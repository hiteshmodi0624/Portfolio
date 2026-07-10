'use client'

import { motion } from 'motion/react'
import type { HumanContent } from '@/content/schema'
import { fadeRise, staggerContainer } from '@/lib/motion'
import { GlassCard } from '@/components/ui/glass-card'

export interface HumanProps {
  human: HumanContent
}

/** Beat 7 — "One engineer, no circus" (spec §3.4). The person behind every
 * other beat: tilted glass-framed photo, a short plain-words story, and the
 * tech vocabulary in a native <details> dark panel — open by default, still
 * collapsible, keyboard + screen-reader accessible for free (no JS
 * disclosure widget). Reduced motion is handled by the page-level
 * MotionConfig (fade only, no movement). */
export function Human({ human }: HumanProps) {
  return (
    <section aria-label="The human" className="relative overflow-x-clip">
      <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-12 px-6 py-24 md:flex-row md:items-start">
        <div aria-hidden="true" className="calm-wash" />
        <motion.div
          variants={fadeRise}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="w-full max-w-xs shrink-0 md:mt-2"
        >
          <GlassCard className="-rotate-2 p-3">
            {/* eslint-disable-next-line @next/next/no-img-element -- static
                export serves the committed, pre-sized 640px variant; explicit
                width/height prevent CLS */}
            <img
              src={human.photo.src}
              alt={human.photo.alt}
              width={human.photo.width}
              height={human.photo.height}
              loading="lazy"
              className="h-auto w-full rounded-xl object-cover"
            />
          </GlassCard>
          {/* PDF page 9 .fact treatment: mono uppercase micro-label in
              violet over a plain one-line body, one small glass card each. */}
          <dl className="mt-6 space-y-3">
            {human.facts.map((fact) => (
              <GlassCard key={fact.label} className="px-4 py-3">
                <dt className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-violet">
                  {fact.label}
                </dt>
                <dd className="mt-1 text-sm leading-relaxed text-muted">
                  {fact.body}
                  {fact.link ? (
                    /* #7C5CFF violet misses WCAG 4.5:1 at small mono size on
                       the glass card; #6741D9 is the branch-established
                       darker step (see proof.tsx url pill / cases.tsx). */
                    <a
                      href={fact.link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1.5 block font-mono text-xs font-semibold text-[#6741D9] transition hover:text-ink"
                    >
                      {fact.link.label} ↗
                    </a>
                  ) : null}
                </dd>
              </GlassCard>
            ))}
          </dl>
        </motion.div>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="flex max-w-xl flex-col text-left"
        >
          <motion.h2
            variants={fadeRise}
            className="font-display text-4xl font-semibold tracking-tight text-ink md:text-5xl"
          >
            {human.heading}
          </motion.h2>
          {human.story.map((paragraph) => (
            <motion.p key={paragraph.slice(0, 24)} variants={fadeRise} className="mt-5 text-muted">
              {paragraph}
            </motion.p>
          ))}
          <motion.div variants={fadeRise} className="mt-8">
            {/* PDF page 9 .nerdy treatment: ink panel, blush mono uppercase
                label, light-lavender (#C9C4E4) mono items. Open by default —
                the native <details> keeps it collapsible for free. */}
            <details open className="rounded-2xl bg-ink p-5 shadow-lg shadow-ink/20">
              <summary className="cursor-pointer font-mono text-xs font-semibold uppercase tracking-[0.16em] text-blush transition hover:text-white">
                {human.nerdyBits.label}
              </summary>
              <ul className="mt-3 list-disc space-y-2 pl-5 font-mono text-xs leading-relaxed text-[#C9C4E4]">
                {human.nerdyBits.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </details>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
