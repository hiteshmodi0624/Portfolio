'use client'

import { motion, useTransform, type MotionValue } from 'motion/react'
import type { StoryContent } from '@/content/schema'
import { fadeRise, staggerContainer } from '@/lib/motion'
import { ScrollScene } from '@/components/ui/scroll-scene'

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

/** Messy resting poses (percent offsets + final tilt) — the untidy stack. */
const POSES = [
  { left: '4%', top: '2%', rotate: -7 },
  { left: '52%', top: '0%', rotate: 5 },
  { left: '24%', top: '26%', rotate: -3 },
  { left: '60%', top: '38%', rotate: 9 },
  { left: '8%', top: '52%', rotate: 4 },
  { left: '38%', top: '58%', rotate: -8 },
]

function ChaosCardBody({ card }: { card: ChaosCard }) {
  return (
    <div className={`rounded-2xl border p-4 text-left shadow-lg shadow-ink/5 backdrop-blur ${HUE_CLASSES[card.hue]}`}>
      <p className="font-mono text-xs text-muted">{card.title}</p>
      <p className="mt-1 text-sm font-medium text-ink">{card.body}</p>
      {card.meta ? <p className="mt-2 text-xs text-muted">{card.meta}</p> : null}
    </div>
  )
}

function ChaosHeader({ chaos }: { chaos: ChaosContent }) {
  return (
    <header className="max-w-2xl text-center">
      <h2 className="font-display text-4xl font-semibold tracking-tight text-ink md:text-5xl">
        {chaos.heading}
      </h2>
      <p className="mt-4 text-muted">{chaos.lede}</p>
    </header>
  )
}

function TumblingCard({
  card,
  index,
  count,
  progress,
}: {
  card: ChaosCard
  index: number
  count: number
  progress: MotionValue<number>
}) {
  const pose = POSES[index % POSES.length]
  // Each card owns a slice of the pin. Tumble: drop from above the viewport,
  // overshoot 3vh past the resting spot, settle back — physics-feel without
  // a physics engine.
  const slot = 0.8 / count
  const start = 0.05 + index * slot
  const end = Math.min(start + slot * 1.6, 0.98)
  const mid = start + (end - start) * 0.7
  const y = useTransform(progress, [start, mid, end], ['-120vh', '3vh', '0vh'])
  const rotate = useTransform(progress, [start, mid, end], [pose.rotate * 3, pose.rotate * 1.4, pose.rotate])
  const opacity = useTransform(progress, [start, start + 0.03], [0, 1])

  return (
    <motion.div className="absolute w-64" style={{ left: pose.left, top: pose.top, y, rotate, opacity }}>
      <ChaosCardBody card={card} />
    </motion.div>
  )
}

/** Beat 2 — "Your week right now". Floating cards pile up: unanswered
 * WhatsApp, overdue invoice, missed booking, 47 unread emails, sticky notes.
 * Scroll-driven tumble on wide viewports; readable rotated grid with
 * whileInView fades everywhere else (ScrollScene fallback). */
export function Chaos({ chaos }: ChaosProps) {
  return (
    <ScrollScene
      ariaLabel="The chaos"
      lengthSvh={3}
      className="relative"
      scene={(progress) => (
        <>
          <div aria-hidden="true" className="chaos-wash" />
          <ChaosHeader chaos={chaos} />
          <div className="relative mt-8 h-[52svh] w-full max-w-3xl">
            {chaos.cards.map((card, index) => (
              <TumblingCard
                key={card.id}
                card={card}
                index={index}
                count={chaos.cards.length}
                progress={progress}
              />
            ))}
          </div>
        </>
      )}
      fallback={
        <div className="relative flex flex-col items-center px-6 py-24">
          <div aria-hidden="true" className="chaos-wash" />
          <ChaosHeader chaos={chaos} />
          <motion.ul
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            className="mt-10 grid w-full max-w-2xl list-none gap-4 sm:grid-cols-2"
          >
            {chaos.cards.map((card, index) => (
              <motion.li
                key={card.id}
                variants={fadeRise}
                className={index % 2 === 0 ? 'sm:-rotate-1' : 'sm:rotate-1'}
              >
                <ChaosCardBody card={card} />
              </motion.li>
            ))}
          </motion.ul>
        </div>
      }
    />
  )
}
