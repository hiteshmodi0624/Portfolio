'use client'

import {
  motion,
  useMotionValueEvent,
  useTransform,
  type MotionValue,
} from 'motion/react'
import { useState, type ReactNode } from 'react'
import type { StoryContent } from '@/content/schema'
import { fadeRise, staggerContainer } from '@/lib/motion'
import { ScrollScene } from '@/components/ui/scroll-scene'

type TurnContent = StoryContent['turn']
type TurnEvent = TurnContent['events'][number]
type ChaosCard = StoryContent['chaos']['cards'][number]

export interface TurnProps {
  turn: TurnContent
  /** Beat-2 cards handed over by the page (beats never import beats):
   * they fly from messy poses into a tidy calm stack here. */
  cards: ChaosCard[]
}

const WASH_CLASSES: Record<TurnEvent['wash'], string> = {
  lavender: 'bg-wash-lavender',
  sky: 'bg-wash-sky',
  blush: 'bg-wash-blush',
}

/** Where each tidy-stack card starts (messy) before flying into place. */
const MESSY_FROM = [
  { x: -70, y: -50, rotate: -8 },
  { x: 80, y: -16, rotate: 6 },
  { x: -48, y: 44, rotate: -5 },
  { x: 56, y: 70, rotate: 9 },
]

const STACK_CARD_COUNT = 4

function TurnHeader({ turn }: { turn: TurnContent }) {
  return (
    <header className="flex max-w-2xl flex-col items-center text-center">
      <p className="rounded-full bg-ink px-4 py-1.5 font-mono text-sm text-white">{turn.time}</p>
      <h2 className="mt-6 font-display text-4xl font-semibold tracking-tight text-ink md:text-5xl">
        {turn.heading}
      </h2>
      <p className="mt-4 text-muted">{turn.lede}</p>
    </header>
  )
}

/** One beat-2 card flying into the tidy stack; its hot hue resolves into calm
 * lavender as it settles (spec §2 palette story). */
function TidyingCard({
  card,
  index,
  progress,
}: {
  card: ChaosCard
  index: number
  progress: MotionValue<number>
}) {
  const from = MESSY_FROM[index % MESSY_FROM.length]
  const settle = 0.12 + index * 0.05
  const x = useTransform(progress, [0, settle + 0.18], [from.x, 0])
  const y = useTransform(progress, [0, settle + 0.18], [from.y, 0])
  const rotate = useTransform(progress, [0, settle + 0.18], [from.rotate, 0])
  const backgroundColor = useTransform(
    progress,
    [0.05, 0.35],
    [
      card.hue === 'red' ? 'rgba(255, 107, 107, 0.25)' : 'rgba(255, 169, 77, 0.25)',
      'rgba(245, 243, 255, 0.95)',
    ],
  )

  return (
    <motion.div
      className="absolute left-1/2 ml-[-108px] w-54 rounded-xl border border-white/70 px-4 py-2.5 shadow-sm backdrop-blur"
      style={{ top: index * 52, x, y, rotate, backgroundColor }}
    >
      <p className="truncate font-mono text-xs text-ink">{card.title}</p>
    </motion.div>
  )
}

/** Scrubbed character reveal — "chat bubbles type themselves". A visually
 * hidden copy carries the full sentence so screen readers never hear a
 * half-typed line. */
function TypedText({
  text,
  progress,
  range,
}: {
  text: string
  progress: MotionValue<number>
  range: [number, number]
}) {
  const revealed = useTransform(progress, range, [0, text.length])
  const [count, setCount] = useState(0)
  useMotionValueEvent(revealed, 'change', (latest) => setCount(Math.round(latest)))
  return (
    <>
      <span aria-hidden="true">{text.slice(0, count)}</span>
      <span className="sr-only">{text}</span>
    </>
  )
}

function EventBubble({ event, children }: { event: TurnEvent; children: ReactNode }) {
  if (event.kind === 'event') {
    return (
      <p className={`rounded-xl border border-white/70 px-4 py-2.5 text-sm text-ink shadow-sm ${WASH_CLASSES[event.wash]}`}>
        {children}
      </p>
    )
  }
  const isHelper = event.kind === 'helper'
  return (
    <div
      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm text-ink shadow-sm ${
        isHelper ? `ml-auto rounded-br-sm ${WASH_CLASSES[event.wash]}` : `rounded-bl-sm ${WASH_CLASSES[event.wash]}`
      }`}
    >
      <p>{children}</p>
      {event.meta ? <p className="mt-1 font-mono text-xs text-muted">{event.meta}</p> : null}
    </div>
  )
}

function ScrubEvent({
  event,
  index,
  progress,
}: {
  event: TurnEvent
  index: number
  progress: MotionValue<number>
}) {
  const start = 0.4 + index * 0.1
  const opacity = useTransform(progress, [start, start + 0.05], [0, 1])
  const y = useTransform(progress, [start, start + 0.05], [20, 0])
  const typed = event.kind !== 'event'

  return (
    <motion.div style={{ opacity, y }} className="flex w-full flex-col">
      <EventBubble event={event}>
        {typed ? (
          <TypedText text={event.text} progress={progress} range={[start + 0.02, start + 0.09]} />
        ) : (
          event.text
        )}
      </EventBubble>
    </motion.div>
  )
}

function ScrubCloser({ closer, progress }: { closer: string; progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [0.88, 0.96], [0, 1])
  return (
    <motion.p style={{ opacity }} className="mt-10 font-display text-xl text-ink">
      {closer}
    </motion.p>
  )
}

/** Beat 3 — "Then, quietly, it all gets handled". The 2:14 AM moment:
 * customer message arrives, the helper answers in 4 seconds, the booking
 * lands, the invoice sends itself, the follow-up is scheduled. */
export function Turn({ turn, cards }: TurnProps) {
  const stack = cards.slice(0, STACK_CARD_COUNT)

  return (
    <ScrollScene
      ariaLabel="The turn"
      lengthSvh={3}
      className="relative"
      scene={(progress) => (
        <>
          <div aria-hidden="true" className="calm-wash" />
          <TurnHeader turn={turn} />
          <div className="mt-8 grid w-full max-w-3xl gap-10 md:grid-cols-2">
            {/* decorative echo of beat 2 — real content lives in the chat column */}
            <div className="relative h-64" aria-hidden="true">
              {stack.map((card, index) => (
                <TidyingCard key={card.id} card={card} index={index} progress={progress} />
              ))}
            </div>
            <div className="flex flex-col gap-3">
              {turn.events.map((event, index) => (
                <ScrubEvent key={event.id} event={event} index={index} progress={progress} />
              ))}
            </div>
          </div>
          <ScrubCloser closer={turn.closer} progress={progress} />
        </>
      )}
      fallback={
        <div className="relative flex flex-col items-center px-6 py-24">
          <div aria-hidden="true" className="calm-wash" />
          <TurnHeader turn={turn} />
          <div aria-hidden="true" className="mt-10 flex w-full max-w-xs flex-col gap-2">
            {stack.map((card) => (
              <div
                key={card.id}
                className="rounded-xl border border-white/70 bg-wash-lavender px-4 py-2.5 shadow-sm"
              >
                <p className="truncate font-mono text-xs text-ink">{card.title}</p>
              </div>
            ))}
          </div>
          <motion.ol
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            className="mt-10 flex w-full max-w-md list-none flex-col gap-3"
          >
            {turn.events.map((event) => (
              <motion.li key={event.id} variants={fadeRise} className="flex flex-col">
                <EventBubble event={event}>{event.text}</EventBubble>
              </motion.li>
            ))}
          </motion.ol>
          <motion.p
            variants={fadeRise}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            className="mt-10 font-display text-xl text-ink"
          >
            {turn.closer}
          </motion.p>
        </div>
      }
    />
  )
}
