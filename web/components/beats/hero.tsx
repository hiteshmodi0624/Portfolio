'use client'

import { motion } from 'motion/react'
import type { HeroContent, TickerItem } from '@/content/schema'
import { fadeRise, staggerContainer } from '@/lib/motion'
import { CountUp } from '@/components/ui/count-up'
import { GlassCard } from '@/components/ui/glass-card'
import { SparkleField } from '@/components/ui/sparkle-field'

export interface HeroProps {
  hero: HeroContent
  ticker: TickerItem[]
}

/** The PDF cover's stat trio reads violet → sky → blush left to right. Sky and
 * blush numbers fail 3:1 contrast on white, so the numbers stay ink and each
 * card carries its accent as a small tick instead. */
const STAT_ACCENTS = ['bg-violet', 'bg-sky', 'bg-blush'] as const

/** Beat 1 — "A little magic for your business.", recomposed after the PDF
 * portfolio's cover: left-aligned editorial block (badge, headline with the
 * animated gradient "magic", sub, identity chip, dual CTA) with the results
 * shelf of three glass stat cards along the hero's lower third. Words
 * materialize; the gradient drifts; sparkles follow the cursor. Reduced
 * motion is handled by the page-level `MotionConfig` (see
 * components/motion-provider) for motion/react, while the raw CSS animations
 * (.grad-word, .hero-wash, .badge-dot) and SparkleField self-gate via their
 * own media queries — this component stays plain variant orchestration. */
export function Hero({ hero, ticker }: HeroProps) {
  const words = hero.h1.split(' ')

  return (
    <section
      aria-label="Intro"
      className="relative flex min-h-svh flex-col overflow-hidden px-6 py-10 sm:px-10 lg:px-16"
    >
      <div aria-hidden="true" className="hero-wash -z-10" />
      <SparkleField followCursor density={28} className="absolute inset-0 -z-10" />

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col">
        <div className="my-auto py-10">
          <p className="inline-flex items-center gap-2 rounded-full border border-violet/30 bg-white/60 px-4 py-1.5 text-sm text-muted backdrop-blur">
            <span aria-hidden="true" className="badge-dot h-2 w-2 rounded-full bg-violet" />
            {hero.availability}
          </p>

          <motion.h1
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="mt-7 max-w-4xl font-display text-[2.75rem] font-extrabold leading-[1.06] tracking-tight text-ink sm:text-6xl md:text-7xl xl:text-8xl"
          >
            {words.map((word, index) => (
              <motion.span
                key={`${word}-${index}`}
                variants={fadeRise}
                className={`inline-block ${word.startsWith('magic') ? 'grad-word' : ''}`}
              >
                {word}
                {/*  , not a plain space: trailing whitespace inside an
                    inline-block span collapses and would glue the words together */}
                {index < words.length - 1 ? ' ' : ''}
              </motion.span>
            ))}
          </motion.h1>

          <p className="mt-6 max-w-2xl text-lg text-muted md:text-xl">{hero.sub}</p>

          <div className="mt-8 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element -- static export
                serves the committed, pre-sized chip; next/image adds runtime for
                no benefit with images.unoptimized */}
            <img
              src={hero.identity.photo.src}
              alt={hero.identity.photo.alt}
              width={48}
              height={48}
              loading="eager"
              className="h-12 w-12 rounded-full border border-white/70 object-cover shadow-sm"
            />
            <p className="text-sm text-muted">
              <strong className="font-semibold text-ink">{hero.identity.name}</strong>
              {' · '}
              {hero.identity.line}
            </p>
          </div>

          <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
            <a
              href={hero.ctaHref}
              className="rounded-full bg-violet px-7 py-3.5 text-lg font-bold text-white shadow-lg shadow-violet/25 transition hover:bg-violet/90"
            >
              {hero.ctaLabel}
            </a>
            <a
              href={hero.secondaryCta.href}
              className="font-mono text-sm font-semibold text-muted transition hover:text-ink"
            >
              {hero.secondaryCta.label}
            </a>
          </div>
        </div>

        {/* Results shelf — the PDF cover's .cover-stats row. The static HTML
            carries final values (CountUp re-runs them on view), so no-JS and
            reduced-motion visitors always read the real numbers. */}
        <motion.dl
          variants={fadeRise}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="grid gap-3 sm:grid-cols-3 sm:gap-4"
        >
          {ticker.map((item, index) => (
            <GlassCard key={item.id} className="flex flex-col-reverse p-5 text-left sm:p-6">
              <dt className="mt-1.5 text-sm leading-snug text-muted">{item.label}</dt>
              <dd className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                <span
                  aria-hidden="true"
                  className={`mb-2.5 block h-1 w-8 rounded-full ${STAT_ACCENTS[index % STAT_ACCENTS.length]}`}
                />
                <CountUp to={item.value} notation={item.notation} />
                {item.suffix}
              </dd>
            </GlassCard>
          ))}
        </motion.dl>
      </div>
    </section>
  )
}
