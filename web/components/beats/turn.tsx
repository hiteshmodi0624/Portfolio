'use client'

import { motion, useInView, type Variants } from 'motion/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { StoryContent } from '@/content/schema'
import { fadeRise, staggerContainer } from '@/lib/motion'
import { useMediaQuery } from '@/lib/use-media'

type TurnContent = StoryContent['turn']
type TurnEvent = TurnContent['events'][number]
type ChaosCard = StoryContent['chaos']['cards'][number]

export interface TurnProps {
  turn: TurnContent
  /** Beat-2 cards handed over by the page (beats never import beats):
   * they reappear here resolved into a tidy calm stack. */
  cards: ChaosCard[]
}

const WASH_CLASSES: Record<TurnEvent['wash'], string> = {
  lavender: 'bg-wash-lavender',
  sky: 'bg-wash-sky',
  blush: 'bg-wash-blush',
}

const STACK_CARD_COUNT = 4

/** Cascade timing (P3.1, time-driven): bubble i enters at ~EVENT_STAGGER_S*i
 * after the list enters view; its typing starts TYPE_LEAD_MS after that. */
const EVENT_STAGGER_S = 0.5
const TYPE_LEAD_MS = 300

const cascadeContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: EVENT_STAGGER_S, delayChildren: 0.2 } },
}

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

export interface TypedTextProps {
  text: string
  /** Starts the timer-driven reveal (the section entered the viewport). */
  play: boolean
  /** Render the full string at once — no typing theatre. */
  reducedMotion: boolean
  /** Wait before the first character (lets the bubble finish its entrance). */
  startDelayMs?: number
  msPerChar?: number
}

/** Timer-driven character reveal (P3.1 — converted from progress-driven):
 * "chat bubbles type themselves" on a clock, not on scroll. A visually
 * hidden copy carries the full sentence so screen readers never hear a
 * half-typed line. Both gates are injected as props so the component is
 * unit-testable with fake timers and no matchMedia juggling. */
export function TypedText({
  text,
  play,
  reducedMotion,
  startDelayMs = 0,
  msPerChar = 24,
}: TypedTextProps) {
  const [count, setCount] = useState(0)
  // Mirrors `count` for the interval tick, so the tick that types the final
  // character can clear its own interval (no zombie no-op ticks afterwards).
  const countRef = useRef(0)

  useEffect(() => {
    if (!play) return
    if (reducedMotion) {
      countRef.current = text.length
      setCount(text.length)
      return
    }
    let interval: ReturnType<typeof setInterval> | undefined
    const delay = setTimeout(() => {
      interval = setInterval(() => {
        countRef.current = Math.min(countRef.current + 1, text.length)
        setCount(countRef.current)
        if (countRef.current >= text.length && interval) {
          clearInterval(interval)
          interval = undefined
        }
      }, msPerChar)
    }, startDelayMs)
    return () => {
      clearTimeout(delay)
      if (interval) clearInterval(interval)
    }
  }, [play, reducedMotion, text, startDelayMs, msPerChar])

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

/** Beat 3 — "Then, quietly, it all gets handled". Normal-flow section
 * (P3.1): the 2:14 AM chat plays itself on a clock once the section enters
 * view — customer message types, the helper answers, event cards cascade.
 * No pinning; the visitor keeps scrolling whenever they like. */
export function Turn({ turn, cards }: TurnProps) {
  const stack = cards.slice(0, STACK_CARD_COUNT)
  const ref = useRef<HTMLElement | null>(null)
  const inView = useInView(ref, { once: true, amount: 0.2 })
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

  return (
    <section ref={ref} aria-label="The turn" className="relative overflow-x-clip">
      <div className="relative flex flex-col items-center px-6 py-24">
        <div aria-hidden="true" className="calm-wash" />
        <TurnHeader turn={turn} />
        <div className="mt-10 grid w-full max-w-3xl gap-10 md:grid-cols-2">
          {/* decorative echo of beat 2 — real content lives in the chat column */}
          <motion.div
            aria-hidden="true"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            className="flex w-full max-w-xs flex-col gap-2 justify-self-center md:justify-self-end"
          >
            {stack.map((card) => (
              <motion.div
                key={card.id}
                variants={fadeRise}
                className="rounded-xl border border-white/70 bg-wash-lavender px-4 py-2.5 shadow-sm"
              >
                <p className="truncate font-mono text-xs text-ink">{card.title}</p>
              </motion.div>
            ))}
          </motion.div>
          <motion.ol
            variants={cascadeContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            className="flex w-full max-w-md list-none flex-col gap-3"
          >
            {turn.events.map((event, index) => (
              <motion.li key={event.id} variants={fadeRise} className="flex flex-col">
                <EventBubble event={event}>
                  {event.kind !== 'event' ? (
                    <TypedText
                      text={event.text}
                      play={inView}
                      reducedMotion={reducedMotion}
                      startDelayMs={TYPE_LEAD_MS + index * EVENT_STAGGER_S * 1000}
                    />
                  ) : (
                    event.text
                  )}
                </EventBubble>
              </motion.li>
            ))}
          </motion.ol>
        </div>
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
    </section>
  )
}
