'use client'

import { motion, type Variants } from 'motion/react'
import type { StoryContent } from '@/content/schema'

type ChaosContent = StoryContent['chaos']
type ChaosCard = ChaosContent['cards'][number]

export interface ChaosProps {
  chaos: ChaosContent
}

/** Hot alert hues (spec §2). Text stays ink/muted on the light tints — AA. */
const HUE_CLASSES: Record<ChaosCard['hue'], string> = {
  amber: 'border-chaos-amber/50 bg-chaos-amber/15',
  red: 'border-chaos-red/50 bg-chaos-red/15',
}

/** Final resting tilts — the untidy stack, alternating lean. */
const TILTS = [-2, 1.5, -1, 2.5, -1.5, 1]

/** ~1.5s total choreography: 6 cards x 0.22s stagger + ~0.5s spring settle
 * (P3 spec §3.1). Fires once when the grid enters the viewport. */
const tumbleContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.22, delayChildren: 0.1 } },
}

/** Spring tumble: drop in from above with an exaggerated tilt, settle into
 * the resting lean with one soft overshoot — physics-feel, time-driven.
 * Under reduced motion MotionConfig("user") snaps the transforms and keeps
 * only the opacity fade. */
const tumbleIn = (tilt: number): Variants => ({
  hidden: { opacity: 0, y: -96, rotate: tilt * 4 },
  visible: {
    opacity: 1,
    y: 0,
    rotate: tilt,
    transition: { type: 'spring', stiffness: 170, damping: 15, mass: 0.9 },
  },
})

function ChaosCardBody({ card }: { card: ChaosCard }) {
  return (
    <div className={`rounded-2xl border p-4 text-left shadow-lg shadow-ink/5 backdrop-blur ${HUE_CLASSES[card.hue]}`}>
      <p className="font-mono text-xs text-muted">{card.title}</p>
      <p className="mt-1 text-sm font-medium text-ink">{card.body}</p>
      {card.meta ? <p className="mt-2 text-xs text-muted">{card.meta}</p> : null}
    </div>
  )
}

/** Beat 2 — "Your week right now". Normal-flow section (P3.1: no pinning
 * anywhere): the messy cards tumble in once with staggered spring physics
 * when the grid scrolls into view. The visitor never loses the wheel. */
export function Chaos({ chaos }: ChaosProps) {
  return (
    <section aria-label="The chaos" className="relative overflow-x-clip">
      <div className="relative flex flex-col items-center px-6 py-24">
        <div aria-hidden="true" className="chaos-wash" />
        <header className="max-w-2xl text-center">
          <h2 className="font-display text-4xl font-semibold tracking-tight text-ink md:text-5xl">
            {chaos.heading}
          </h2>
          <p className="mt-4 text-muted">{chaos.lede}</p>
        </header>
        <motion.ul
          variants={tumbleContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="mt-10 grid w-full max-w-2xl list-none gap-4 sm:grid-cols-2"
        >
          {chaos.cards.map((card, index) => (
            <motion.li key={card.id} variants={tumbleIn(TILTS[index % TILTS.length])}>
              <ChaosCardBody card={card} />
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  )
}
