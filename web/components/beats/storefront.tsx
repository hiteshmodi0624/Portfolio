'use client'

import { motion, useTransform, type MotionValue } from 'motion/react'
import type { StoryContent } from '@/content/schema'
import { fadeRise, staggerContainer } from '@/lib/motion'
import { CountUp } from '@/components/ui/count-up'
import { GlassCard } from '@/components/ui/glass-card'
import { ScrollScene } from '@/components/ui/scroll-scene'

type StorefrontContent = StoryContent['storefront']

export interface StorefrontProps {
  storefront: StorefrontContent
}

function StorefrontHeader({ heading }: { heading: string }) {
  return (
    <h2 className="max-w-2xl text-center font-display text-4xl font-semibold tracking-tight text-ink md:text-5xl">
      {heading}
    </h2>
  )
}

/** The bland "before" page — grayscale mock browser, generic everything. */
function BeforePage({ before }: { before: StorefrontContent['before'] }) {
  return (
    <div className="rounded-xl border border-ink/15 bg-white p-5 text-left">
      <div className="flex gap-1.5" aria-hidden="true">
        <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
      </div>
      <p className="mt-4 text-center text-sm font-bold tracking-wide text-ink/70">{before.title}</p>
      <p className="mt-1 text-center text-[10px] text-muted">{before.nav.join('  |  ')}</p>
      <div className="mt-4 space-y-1.5" aria-hidden="true">
        <div className="h-2 w-full rounded bg-ink/10" />
        <div className="h-2 w-11/12 rounded bg-ink/10" />
        <div className="h-2 w-4/5 rounded bg-ink/10" />
      </div>
      <p className="mt-4 text-[10px] text-muted">{before.line}</p>
    </div>
  )
}

/** The gorgeous "after" page — pastel gradient, one clear job: get booked. */
function AfterPage({ after }: { after: StorefrontContent['after'] }) {
  return (
    <div className="rounded-xl border border-violet/20 bg-linear-to-br from-wash-lavender via-white to-wash-blush p-5 text-left shadow-xl shadow-violet/10">
      <div className="flex gap-1.5" aria-hidden="true">
        <span className="h-2.5 w-2.5 rounded-full bg-violet" />
        <span className="h-2.5 w-2.5 rounded-full bg-sky" />
        <span className="h-2.5 w-2.5 rounded-full bg-blush" />
      </div>
      <p className="mt-4 font-display text-lg font-semibold text-ink">{after.title}</p>
      <p className="mt-1 text-xs text-muted">{after.line}</p>
      {/* ink chip, not violet: white-on-violet fails AA at this small size —
          violet stays decorative here (dots, border, shadow) per spec §2 */}
      <span className="mt-4 inline-block rounded-full bg-ink px-4 py-1.5 text-xs font-bold text-white">
        {after.cta}
      </span>
    </div>
  )
}

/** Conversion needle + counting metric. Needle is decorative (aria-hidden);
 * the number is real content and comes from the content module. */
function MetricPanel({
  metric,
  needleRotate,
}: {
  metric: StorefrontContent['metric']
  needleRotate?: MotionValue<number>
}) {
  return (
    <GlassCard className="flex items-center gap-5 p-5">
      <div aria-hidden="true" className="relative h-12 w-24 shrink-0 overflow-hidden">
        <div className="absolute inset-0 rounded-t-full bg-linear-to-r from-chaos-red/30 via-chaos-amber/30 to-sky/40" />
        <motion.div
          className="absolute bottom-0 left-1/2 h-11 w-0.5 origin-bottom rounded-full bg-ink"
          style={needleRotate ? { rotate: needleRotate } : { rotate: 64 }}
        />
      </div>
      <p className="text-left text-sm text-muted">
        <span className="font-display text-3xl font-semibold text-ink">
          <CountUp to={metric.to} />
        </span>{' '}
        {metric.label}
        <span className="block text-xs">up from {metric.from}</span>
      </p>
    </GlassCard>
  )
}

function MorphScene({
  storefront,
  progress,
}: {
  storefront: StorefrontContent
  progress: MotionValue<number>
}) {
  const beforeOpacity = useTransform(progress, [0.15, 0.45], [1, 0])
  const beforeScale = useTransform(progress, [0.15, 0.45], [1, 0.96])
  const afterOpacity = useTransform(progress, [0.35, 0.6], [0, 1])
  const afterY = useTransform(progress, [0.35, 0.6], [32, 0])
  const needleRotate = useTransform(progress, [0.55, 0.9], [-72, 64])
  const punchlineOpacity = useTransform(progress, [0.7, 0.85], [0, 1])

  return (
    <>
      <div aria-hidden="true" className="calm-wash" />
      <StorefrontHeader heading={storefront.heading} />
      <div className="relative mt-8 w-full max-w-md">
        {/* data-morph attributes are stable E2E anchors for the two layers */}
        <motion.div data-morph="before" style={{ opacity: beforeOpacity, scale: beforeScale }}>
          <BeforePage before={storefront.before} />
        </motion.div>
        <motion.div
          data-morph="after"
          className="absolute inset-0"
          style={{ opacity: afterOpacity, y: afterY }}
        >
          <AfterPage after={storefront.after} />
        </motion.div>
      </div>
      <div className="mt-8 w-full max-w-md">
        <MetricPanel metric={storefront.metric} needleRotate={needleRotate} />
      </div>
      <motion.p style={{ opacity: punchlineOpacity }} className="mt-8 max-w-md text-center font-display text-2xl text-ink">
        {storefront.punchline}
      </motion.p>
    </>
  )
}

/** Beat 4 — "And it looks gorgeous doing it". Before→after morph tied to
 * scroll on wide viewports; labelled side-by-side comparison everywhere else. */
export function Storefront({ storefront }: StorefrontProps) {
  return (
    <ScrollScene
      ariaLabel="The storefront"
      lengthSvh={3}
      className="relative"
      scene={(progress) => <MorphScene storefront={storefront} progress={progress} />}
      fallback={
        <div className="relative flex flex-col items-center px-6 py-24 text-center">
          <div aria-hidden="true" className="calm-wash" />
          <StorefrontHeader heading={storefront.heading} />
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            className="mt-10 grid w-full max-w-2xl gap-6 sm:grid-cols-2"
          >
            <motion.div variants={fadeRise}>
              <p className="mb-2 font-mono text-xs text-muted">before</p>
              <BeforePage before={storefront.before} />
            </motion.div>
            <motion.div variants={fadeRise}>
              <p className="mb-2 font-mono text-xs text-muted">after</p>
              <AfterPage after={storefront.after} />
            </motion.div>
          </motion.div>
          <motion.div
            variants={fadeRise}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            className="mt-8 w-full max-w-md"
          >
            <MetricPanel metric={storefront.metric} />
          </motion.div>
          <motion.p
            variants={fadeRise}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.6 }}
            className="mt-8 max-w-md font-display text-2xl text-ink"
          >
            {storefront.punchline}
          </motion.p>
        </div>
      }
    />
  )
}
