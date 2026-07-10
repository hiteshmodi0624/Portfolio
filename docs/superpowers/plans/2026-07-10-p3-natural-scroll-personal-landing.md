# P3 Natural Scroll + Personal Landing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement spec `docs/superpowers/specs/2026-07-10-p3-natural-scroll-personal-landing-design.md` — remove every pinned/scrubbed scroll scene (chaos, turn, storefront become normal-flow sections animating on viewport entry), add the person to the page (hero photo chip + name line, Beat 7 "One engineer, no circus"), render the until-now-unconsumed services content as Beat 6 "doors", and upgrade the proof gallery with real site screenshots + logo chips (including Safewash's now-live URL).

**Architecture:** Beats stay self-contained client components in `web/components/beats/` fed typed props from Zod-validated `web/content/*.ts` modules (the page is the only place beats are composed — beats never import beats). The pin/scrub primitive `ScrollScene` is deleted; entry choreography moves to Motion v12 `whileInView`/`useInView` with `once: true` plus plain timers, so the visitor always owns the scroll position. Gallery screenshots/logos are captured by a manually-run Playwright script and committed — the static-export build never touches the network.

**Tech Stack:** Next.js 15 App Router (`output: 'export'`, `images: { unoptimized: true }`), React 19, Motion v12 (`motion` package, imported as `motion/react`), Tailwind CSS 4 (tokens in `web/app/globals.css` `@theme`), Zod 4, Vitest 3 + jsdom + Testing Library (unit), Playwright 1.52 (E2E against `web/out/` served by http-server on :4173), macOS `sips` for one-time photo processing. **Zero new npm dependencies.**

## Global Constraints

Every task's requirements implicitly include all of these.

- **No new dependencies.** Runtime or dev. Motion, Playwright, Zod, Tailwind already cover everything this plan needs.
- **Static export — no server features.** No API routes, no server actions, no `next/image` optimization (plain `<img>` with committed assets; add `{/* eslint-disable-next-line @next/next/no-img-element */}` where used). The page stays a single exported route.
- **JS budget: 160 KB gz** of homepage-executed JS, gated by `npm run budget -w web` (default `BUDGET_KB=160` in `web/scripts/measure-bundle.mjs`). P3.1 *removes* scrub code; P3.2–3.4 add only small first-party components — the budget must stay green every phase. Screenshots are lazy `<img>`s, not JS.
- **WCAG AA.** Body text is always `text-ink` (#1E1B2E) / `text-muted` (#5B5773) on the light washes; violet `#7C5CFF` on white only for large text/decoration; decorative elements get `aria-hidden="true"`; every content image gets a real `alt`; disclosure widgets are native `<details>`/`<summary>`.
- **prefers-reduced-motion support.** The page-level `MotionConfig reducedMotion="user"` (`web/components/motion-provider.tsx`) auto-degrades transform animations to instant snaps while keeping opacity fades. Anything MotionConfig cannot strip (timers, typing, auto-morph, layout branches) gates explicitly via `useMediaQuery('(prefers-reduced-motion: reduce)')` from `web/lib/use-media.ts` — NOT motion's `useReducedMotion`, whose first-read caching makes jsdom tests non-deterministic (see the comment block in `web/test/unit/hero.test.tsx:30-37`). All copy must settle at opacity 1 under reduced motion.
- **Beats never import beats.** Shared data flows through `web/app/page.tsx` props (e.g. chaos cards handed to Turn). Shared primitives live in `web/components/ui/`.
- **Content via Zod-validated modules.** All copy/urls/paths live in `web/content/*.ts` parsed by schemas in `web/content/schema.ts`. Components never hardcode prose (new section headings get content-module fields, mirroring the existing pattern).
- **TDD every task.** Write the failing test, run it, watch it fail for the stated reason, implement, run green, commit. Never skip the red step.
- **Commits:** conventional-commit style matching the repo log (`feat(web): …`, `test(e2e): …`, `chore(web): …`, `feat(content): …`), one commit minimum per task, each ending with the trailer `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.
- **Run all commands from the repo root** `/Users/hiteshmodi/Documents/GitHub/Portfolio` (npm workspaces: `-w web`). Local Node is v20.19.5 — fine for everything except `capture:shots`, which needs Node ≥ 22.6 (exact command given in Task 4.2).
- **E2E prerequisite:** the Playwright web server serves `web/out/` without rebuilding — always run `npm run build -w web` before `npm run test:e2e -w web`.
- **Never touch `infra/` or `scripts/deploy-prod.sh`.**

## File inventory (whole plan)

```
web/
  components/beats/chaos.tsx        REWRITE  T1.2   unpinned tumble-in
  components/beats/turn.tsx         REWRITE  T1.3   timer-typed bubbles, cascade
  components/beats/storefront.tsx   REWRITE  T1.4   auto morph + needle sweep
  components/beats/hero.tsx         MODIFY   T2.1   identity chip + name line
  components/beats/human.tsx        CREATE   T2.3   beat 7
  components/beats/services.tsx     CREATE   T3.1   beat 6
  components/beats/proof.tsx        MODIFY   T4.3   screenshot header + logo chip
  components/ui/scroll-scene.tsx    DELETE   T1.6
  content/schema.ts                 MODIFY   T2.1, T2.2, T3.1, T4.1
  content/profile.ts                MODIFY   T2.1   hero.identity
  content/human.ts                  CREATE   T2.2
  content/services.ts               MODIFY   T3.1   + servicesIntro export
  content/projects.ts               MODIFY   T1.1 (safewash url), T4.4 (image/logo)
  app/page.tsx                      MODIFY   T2.3, T3.2
  app/globals.css                   MODIFY   T3.1   .service-door hover reveal
  public/images/hitesh-96.jpg       CREATE   T2.1   (sips output, committed)
  public/images/hitesh-640.jpg      CREATE   T2.1   (sips output, committed)
  public/images/hitesh.jpeg         MOVE     T2.1   → assets/hitesh-original.jpeg
  public/shots/<slug>.png           CREATE   T4.4   (capture script output)
  public/logos/<slug>.png           CREATE   T4.4   (capture script output)
  scripts/capture-shots.ts          CREATE   T4.2
  package.json                      MODIFY   T4.2   capture:shots script
  test/setup.ts                     MODIFY   T1.6   comment only
  test/unit/chaos.test.tsx          MODIFY   T1.2
  test/unit/turn.test.tsx           MODIFY   T1.3
  test/unit/storefront.test.tsx     MODIFY   T1.4
  test/unit/scroll-scene.test.tsx   DELETE   T1.6
  test/unit/scroll-scene-reduced.test.tsx DELETE T1.6
  test/unit/story-content.test.ts   MODIFY   T1.1, T4.4
  test/unit/content.test.ts         MODIFY   T2.1
  test/unit/hero.test.tsx           MODIFY   T2.1
  test/unit/human-content.test.ts   CREATE   T2.2
  test/unit/human.test.tsx          CREATE   T2.3
  test/unit/page.test.tsx           MODIFY   T2.3, T3.2
  test/unit/services.test.tsx       CREATE   T3.1
  test/unit/proof.test.tsx          MODIFY   T4.3
  test/unit/capture-shots.test.ts   CREATE   T4.2
  e2e/story.spec.ts                 REWRITE  T1.5; MODIFY T2.4, T3.2, T4.3, T4.4
  e2e/home.spec.ts                  MODIFY   T2.4
assets/hitesh-original.jpeg         CREATE   T2.1   (git mv target, unserved)
```

Estimated changed lines: **P3.1 ≈ 950** (≈500 added / 450 deleted) · **P3.2 ≈ 480** + 2 image assets · **P3.3 ≈ 450** · **P3.4 ≈ 700** + up to 16 image assets.

---

# Phase P3.1 — Natural scroll (Tasks 1.1–1.6)

Ships alone: after Task 1.6 the site has zero pinned sections, all tests green.

### Task 1.1: Safewash URL

**Files:**
- Modify: `web/content/projects.ts` (safewash entry, lines 44-50; header comment lines 3-15)
- Test: `web/test/unit/story-content.test.ts` (the `'ships the eight proof projects with the verified live urls'` test, lines 131-152)

**Interfaces:**
- Consumes: existing `ProjectSchema` (`url: httpsUrl.optional()`) — no schema change needed.
- Produces: `proof.projects` entry `slug: 'safewash'` now has `url: 'https://www.safewash.co.in'`; every project has a URL.

- [ ] **Step 1: Write the failing test.** In `web/test/unit/story-content.test.ts`, replace the last two statements of the `'ships the eight proof projects with the verified live urls'` test:

```ts
    // OLD (delete these two lines):
    // Safewash is real work with no public site — the only card without a link
    expect(proof.projects.filter((project) => project.url === undefined)).toHaveLength(1)
```

with:

```ts
    // Safewash's public site went live 2026-07 (spec P3 §1) — every card links out now
    expect(proof.projects.find((project) => project.slug === 'safewash')?.url).toBe(
      'https://www.safewash.co.in',
    )
    expect(proof.projects.filter((project) => project.url === undefined)).toHaveLength(0)
```

- [ ] **Step 2: Verify it fails.** Run: `npm run test:unit -w web -- test/unit/story-content.test.ts`
      Expected failure: `expected undefined to be 'https://www.safewash.co.in'`.

- [ ] **Step 3: Implement.** In `web/content/projects.ts`:

  1. In the safewash entry, add the url line:

```ts
    {
      slug: 'safewash',
      name: 'Safewash',
      tagline: 'Billing without the back-and-forth',
      outcome: 'Invoices for business customers, sent and settled on time',
      url: 'https://www.safewash.co.in',
      kind: 'product',
    },
```

  2. In the file-header comment, replace the sentence
     `Safewash is real work with no public site, so it ships as\n * the one card without a link.`
     with
     `Safewash's public site is live (https://www.safewash.co.in, verified 2026-07-10).`

- [ ] **Step 4: Verify green.** Run: `npm run test:unit -w web -- test/unit/story-content.test.ts` (all pass), then the full suite `npm run test:unit -w web`.

- [ ] **Step 5: Commit.**

```bash
git add web/content/projects.ts web/test/unit/story-content.test.ts
git commit -m "feat(content): Safewash public site is live — link the proof card

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 1.2: Unpin Chaos — staggered spring tumble on viewport entry

**Files:**
- Rewrite: `web/components/beats/chaos.tsx` (full file below; drops the `ScrollScene` import, `POSES`, `TumblingCard`)
- Test: `web/test/unit/chaos.test.tsx` (add the never-pins test; update the file-header comment)

**Interfaces:**
- Consumes: `StoryContent['chaos']` via existing `ChaosProps { chaos }` (unchanged); Tailwind tokens `text-ink`, `text-muted`, `border-chaos-amber/50`, `bg-chaos-amber/15`, `border-chaos-red/50`, `bg-chaos-red/15`, `shadow-ink/5`, `font-display`, `font-mono`; CSS class `.chaos-wash` (globals.css, unchanged).
- Produces: `export function Chaos({ chaos }: ChaosProps)` rendering `<section aria-label="The chaos">` in normal flow (never sticky, never multi-viewport height). Choreography: `whileInView` (`once: true`) staggered spring tumble, ~1.5 s total (6 cards × 0.22 s stagger + ~0.5 s spring settle). Reduced motion: MotionConfig `reducedMotion="user"` strips the transforms, leaving a staggered fade — no explicit branch needed here.

- [ ] **Step 1: Write the failing test.** In `web/test/unit/chaos.test.tsx`, change the imports to:

```ts
import { act, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Chaos } from '../../components/beats/chaos'
import { story } from '../../content/story'
import { setViewportWide } from '../setup'
```

replace the file-header comment (lines 6-8) with:

```ts
// P3.1: Chaos is a normal-flow section on every viewport — no ScrollScene, no
// pinning. jsdom's IntersectionObserver stub never fires, so cards render in
// their whileInView "hidden" state; all copy is still in the DOM (what no-JS
// visitors get). Entry choreography is proven in e2e/story.spec.ts.
```

and append inside the `describe('Chaos (beat 2)')` block:

```tsx
  it('never pins: wide viewports get the same normal-flow section (P3.1)', async () => {
    setViewportWide(true)
    const { container } = render(<Chaos chaos={story.chaos} />)
    await act(async () => {})
    const section = container.querySelector('section[aria-label="The chaos"]') as HTMLElement
    expect(section.querySelector('.sticky')).toBeNull()
    expect(section.style.height).toBe('')
    for (const card of story.chaos.cards) {
      expect(screen.getByText(card.body)).toBeDefined()
    }
  })
```

- [ ] **Step 2: Verify it fails.** Run: `npm run test:unit -w web -- test/unit/chaos.test.tsx`
      Expected failure: on the wide viewport the old `ScrollScene` upgrades to the pinned scene — `expect(section.querySelector('.sticky')).toBeNull()` fails with `expected <div class="sticky …"> to be null`.

- [ ] **Step 3: Implement.** Replace `web/components/beats/chaos.tsx` in full:

```tsx
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
```

- [ ] **Step 4: Verify green.** Run: `npm run test:unit -w web -- test/unit/chaos.test.tsx` (5 tests pass), then `npm run test:unit -w web` (only pre-existing suites — `scroll-scene*.test.tsx` still pass because the primitive still exists until Task 1.6), then `npm run lint -w web && npm run typecheck -w web`.

- [ ] **Step 5: Commit.**

```bash
git add web/components/beats/chaos.tsx web/test/unit/chaos.test.tsx
git commit -m "feat(web): unpin beat 2 — chaos cards tumble in on viewport entry

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 1.3: Unpin Turn — timer-driven typing + cascading event cards

**Files:**
- Rewrite: `web/components/beats/turn.tsx` (full file below; drops `ScrollScene`, `useTransform`, `MESSY_FROM`, `TidyingCard`, the progress-driven `TypedText`)
- Test: `web/test/unit/turn.test.tsx` (add TypedText timer tests + never-pins test)

**Interfaces:**
- Consumes: `StoryContent['turn']` + chaos cards via existing `TurnProps { turn, cards }` (unchanged — the page still hands beat-2 cards down); `fadeRise`, `staggerContainer` from `@/lib/motion`; `useMediaQuery` from `@/lib/use-media`; `useInView` from `motion/react`; CSS class `.calm-wash`.
- Produces:
  - `export function Turn({ turn, cards }: TurnProps)` — normal-flow `<section aria-label="The turn">`; bubbles cascade in (stagger 0.5 s) once the list enters view; typed bubbles type themselves time-driven once the *section* enters view.
  - `export interface TypedTextProps { text: string; play: boolean; reducedMotion: boolean; startDelayMs?: number; msPerChar?: number }`
  - `export function TypedText(props: TypedTextProps)` — NEW EXPORT (unit-testable with fake timers; keeps the `sr-only` full-sentence copy for screen readers).

- [ ] **Step 1: Write the failing tests.** In `web/test/unit/turn.test.tsx`, change the imports to:

```ts
import { act, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Turn, TypedText } from '../../components/beats/turn'
import { story } from '../../content/story'
import { setViewportWide } from '../setup'
```

replace the file-header comment (line 6) with:

```ts
// P3.1: Turn is a normal-flow section on every viewport — no ScrollScene.
// jsdom's IntersectionObserver stub never fires, so `play` stays false and
// bubbles hold their whileInView "hidden" state; copy is still in the DOM
// (typed bubbles always carry an sr-only full-sentence copy).
```

and append these describe blocks after the existing `describe('Turn (beat 3)')`:

```tsx
describe('Turn — never pins (P3.1)', () => {
  it('wide viewports get the same normal-flow section', async () => {
    setViewportWide(true)
    const { container } = render(<Turn turn={story.turn} cards={story.chaos.cards} />)
    await act(async () => {})
    const section = container.querySelector('section[aria-label="The turn"]') as HTMLElement
    expect(section.querySelector('.sticky')).toBeNull()
    expect(section.style.height).toBe('')
  })
})

describe('TypedText (P3.1 — timer-driven)', () => {
  const visibleText = (container: HTMLElement) =>
    (container.querySelector('span[aria-hidden="true"]') as HTMLElement).textContent

  it('types the full string over time once play is true', () => {
    vi.useFakeTimers()
    try {
      const { container } = render(
        <TypedText text="Hello there" play reducedMotion={false} startDelayMs={100} msPerChar={20} />,
      )
      expect(visibleText(container)).toBe('')
      // mid-flight: delay (100ms) + 3 chars x 20ms
      act(() => {
        vi.advanceTimersByTime(160)
      })
      expect(visibleText(container)).toBe('Hel')
      // completion: the remaining 8 chars + slack
      act(() => {
        vi.advanceTimersByTime(20 * 8 + 40)
      })
      expect(visibleText(container)).toBe('Hello there')
    } finally {
      vi.useRealTimers()
    }
  })

  it('does not type before play flips true', () => {
    vi.useFakeTimers()
    try {
      const { container } = render(
        <TypedText text="Hello there" play={false} reducedMotion={false} msPerChar={20} />,
      )
      act(() => {
        vi.advanceTimersByTime(2000)
      })
      expect(visibleText(container)).toBe('')
    } finally {
      vi.useRealTimers()
    }
  })

  it('renders the full string immediately under reduced motion', () => {
    const { container } = render(<TypedText text="Hello there" play reducedMotion />)
    expect(visibleText(container)).toBe('Hello there')
  })

  it('always keeps a screen-reader copy of the full sentence', () => {
    render(<TypedText text="Hello there" play={false} reducedMotion={false} />)
    const srCopy = screen.getByText('Hello there')
    expect(srCopy.className).toContain('sr-only')
  })
})
```

- [ ] **Step 2: Verify it fails.** Run: `npm run test:unit -w web -- test/unit/turn.test.tsx`
      Expected failure: the module does not export `TypedText` — `SyntaxError: The requested module '../../components/beats/turn' does not provide an export named 'TypedText'` (every test in the file errors).

- [ ] **Step 3: Implement.** Replace `web/components/beats/turn.tsx` in full:

```tsx
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

  useEffect(() => {
    if (!play) return
    if (reducedMotion) {
      setCount(text.length)
      return
    }
    let interval: ReturnType<typeof setInterval> | undefined
    const delay = setTimeout(() => {
      interval = setInterval(() => {
        setCount((current) => (current >= text.length ? current : current + 1))
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
```

- [ ] **Step 4: Verify green.** Run: `npm run test:unit -w web -- test/unit/turn.test.tsx` (9 tests pass — 4 existing Turn tests still pass because typed bubbles keep the sr-only full copy), then `npm run test:unit -w web && npm run lint -w web && npm run typecheck -w web`.

- [ ] **Step 5: Commit.**

```bash
git add web/components/beats/turn.tsx web/test/unit/turn.test.tsx
git commit -m "feat(web): unpin beat 3 — timer-driven typing and cascading events

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 1.4: Unpin Storefront — auto before→after crossfade + needle sweep

**Files:**
- Rewrite: `web/components/beats/storefront.tsx` (full file below; drops `ScrollScene`, `useTransform`, `MorphScene`)
- Test: `web/test/unit/storefront.test.tsx` (add data-morph, never-pins, reduced-layout tests)

**Interfaces:**
- Consumes: `StoryContent['storefront']` via existing `StorefrontProps { storefront }` (unchanged); `CountUp`, `GlassCard` primitives; `fadeRise`, `staggerContainer`; `useMediaQuery`; `useInView`; CSS class `.calm-wash`.
- Produces: `export function Storefront({ storefront }: StorefrontProps)` — normal-flow `<section aria-label="The storefront">`. Motion path: stacked panels carrying the stable E2E anchors `data-morph="before"` / `data-morph="after"`; ~2 s after the section enters view (`MORPH_DELAY_MS = 2000`, once per page load) the after panel crossfades in (0.8 s), the conversion needle sweeps −72°→64°, the punchline fades in. Reduced-motion path: today's labelled side-by-side comparison (fallback promoted), needle static at 64°.

- [ ] **Step 1: Write the failing tests.** In `web/test/unit/storefront.test.tsx`, change the imports to:

```ts
import { act, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Storefront } from '../../components/beats/storefront'
import { story } from '../../content/story'
import { setPrefersReducedMotion, setViewportWide } from '../setup'
```

replace the file-header comment (line 6) with:

```ts
// P3.1: Storefront is a normal-flow section. jsdom (motion allowed) renders
// the stacked auto-morph layers at their resting state (before visible,
// after waiting at opacity 0 — jsdom's IntersectionObserver never fires);
// reduced motion renders the labelled side-by-side comparison.
```

and append inside the `describe('Storefront (beat 4)')` block:

```tsx
  it('never pins: wide viewports get the same normal-flow section (P3.1)', async () => {
    setViewportWide(true)
    const { container } = renderStorefront()
    await act(async () => {})
    const section = container.querySelector('section[aria-label="The storefront"]') as HTMLElement
    expect(section.querySelector('.sticky')).toBeNull()
    expect(section.style.height).toBe('')
  })

  it('mounts the auto-morph layers with their data-morph anchors (P3.1)', () => {
    const { container } = renderStorefront()
    const before = container.querySelector('[data-morph="before"]') as HTMLElement
    const after = container.querySelector('[data-morph="after"]') as HTMLElement
    expect(before).not.toBeNull()
    expect(after).not.toBeNull()
    // resting state pre-entry: before visible, after waiting to crossfade in
    expect(before.style.opacity).toBe('1')
    expect(after.style.opacity).toBe('0')
  })

  it('renders the labelled side-by-side comparison under reduced motion', async () => {
    setPrefersReducedMotion(true)
    const { container } = renderStorefront()
    await act(async () => {})
    expect(container.querySelector('[data-morph="before"]')).toBeNull()
    expect(screen.getByText('before')).toBeDefined()
    expect(screen.getByText('after')).toBeDefined()
    expect(screen.getByText('Saturday has three openings left.')).toBeDefined()
  })
```

- [ ] **Step 2: Verify it fails.** Run: `npm run test:unit -w web -- test/unit/storefront.test.tsx`
      Expected failures: `mounts the auto-morph layers` — the old component renders the fallback in jsdom, which has no `data-morph` attributes (`expected null not to be null`); `never pins` — the old wide-viewport path renders `.sticky`.

- [ ] **Step 3: Implement.** Replace `web/components/beats/storefront.tsx` in full:

```tsx
'use client'

import { motion, useInView } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import type { StoryContent } from '@/content/schema'
import { fadeRise, staggerContainer } from '@/lib/motion'
import { useMediaQuery } from '@/lib/use-media'
import { CountUp } from '@/components/ui/count-up'
import { GlassCard } from '@/components/ui/glass-card'

type StorefrontContent = StoryContent['storefront']

export interface StorefrontProps {
  storefront: StorefrontContent
}

/** Auto-morph delay (P3.1, spec §3.1): the "before" page gets ~2s of screen
 * time after the section enters view, then crossfades. Once per page load. */
const MORPH_DELAY_MS = 2000

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
 * the number is real content and comes from the content module. When `sweep`
 * is omitted (reduced motion) the needle rests at its final angle. */
function MetricPanel({
  metric,
  sweep,
}: {
  metric: StorefrontContent['metric']
  sweep?: boolean
}) {
  return (
    <GlassCard className="flex items-center gap-5 p-5">
      <div aria-hidden="true" className="relative h-12 w-24 shrink-0 overflow-hidden">
        <div className="absolute inset-0 rounded-t-full bg-linear-to-r from-chaos-red/30 via-chaos-amber/30 to-sky/40" />
        {sweep === undefined ? (
          <div
            className="absolute bottom-0 left-1/2 h-11 w-0.5 origin-bottom rounded-full bg-ink"
            style={{ transform: 'rotate(64deg)' }}
          />
        ) : (
          <motion.div
            className="absolute bottom-0 left-1/2 h-11 w-0.5 origin-bottom rounded-full bg-ink"
            initial={false}
            animate={{ rotate: sweep ? 64 : -72 }}
            transition={{ type: 'spring', stiffness: 60, damping: 15 }}
          />
        )}
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

/** Beat 4 — "And it looks gorgeous doing it". Normal-flow section (P3.1):
 * the before→after morph auto-plays ~2s after entering view — crossfade +
 * conversion-needle sweep, once per page load, no scroll hijack. Reduced
 * motion promotes the labelled side-by-side comparison. */
export function Storefront({ storefront }: StorefrontProps) {
  const ref = useRef<HTMLElement | null>(null)
  const inView = useInView(ref, { once: true, amount: 0.3 })
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const [morphed, setMorphed] = useState(false)

  useEffect(() => {
    if (!inView || reducedMotion) return
    const timer = setTimeout(() => setMorphed(true), MORPH_DELAY_MS)
    return () => clearTimeout(timer)
  }, [inView, reducedMotion])

  return (
    <section ref={ref} aria-label="The storefront" className="relative overflow-x-clip">
      <div className="relative flex flex-col items-center px-6 py-24 text-center">
        <div aria-hidden="true" className="calm-wash" />
        <StorefrontHeader heading={storefront.heading} />
        {reducedMotion ? (
          <>
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
              viewport={{ once: true, amount: 0.5 }}
              className="mt-8 max-w-md font-display text-2xl text-ink"
            >
              {storefront.punchline}
            </motion.p>
          </>
        ) : (
          <>
            <div className="relative mt-10 w-full max-w-md">
              {/* data-morph attributes are stable E2E anchors for the two layers */}
              <motion.div
                data-morph="before"
                aria-hidden={morphed}
                initial={false}
                animate={{ opacity: morphed ? 0 : 1, scale: morphed ? 0.96 : 1 }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
              >
                <BeforePage before={storefront.before} />
              </motion.div>
              <motion.div
                data-morph="after"
                aria-hidden={!morphed}
                className="absolute inset-0"
                initial={false}
                animate={{ opacity: morphed ? 1 : 0, y: morphed ? 0 : 32 }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
              >
                <AfterPage after={storefront.after} />
              </motion.div>
            </div>
            <div className="mt-8 w-full max-w-md">
              <MetricPanel metric={storefront.metric} sweep={morphed} />
            </div>
            <motion.p
              initial={false}
              animate={{ opacity: morphed ? 1 : 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-8 max-w-md font-display text-2xl text-ink"
            >
              {storefront.punchline}
            </motion.p>
          </>
        )}
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Verify green.** Run: `npm run test:unit -w web -- test/unit/storefront.test.tsx` (7 tests pass — the 4 existing ones read copy that is present in the DOM on both branches), then `npm run test:unit -w web && npm run lint -w web && npm run typecheck -w web`.

- [ ] **Step 5: Commit.**

```bash
git add web/components/beats/storefront.tsx web/test/unit/storefront.test.tsx
git commit -m "feat(web): unpin beat 4 — auto before/after morph with needle sweep

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 1.5: Rewrite the story E2E suite — natural scroll replaces pin/scrub

**Files:**
- Rewrite: `web/e2e/story.spec.ts` (full file below — deletes the `scrollToPin` helper and the whole `'scroll scrub (desktop pin)'` describe; adds the `'natural scroll (P3.1)'` describe; adds the Safewash link assertion; keeps the content, CountUp, and TiltCard suites verbatim)
- Test: this task IS tests (E2E). `web/e2e/home.spec.ts` is untouched.

**Interfaces:**
- Consumes: the built site in `web/out/` (sections `aria-label` = `Intro | The chaos | The turn | The storefront | Proof | Contact`; `data-morph` anchors from Task 1.4; typed helper reply text from `content/story.ts`).
- Produces: E2E guarantees for spec §6 P3.1 — zero `.sticky` in `main` (both projects, motion and reduced), desktop page height < 8 viewports, each scene settling to opacity 1 after a single scroll-into-view, reduced motion settling all copy at opacity 1.

- [ ] **Step 1: Watch the old suite fail against the new build (the red step).** Run:

```bash
npm run build -w web
npm run test:e2e -w web -- e2e/story.spec.ts
```

Expected failures — exactly the assertions that pinned the old behavior: `'chaos pins for multiple viewports and tumbles cards in'` (`expect(height).toBeGreaterThan(viewport.height * 2)` — the section is now ~1 viewport tall) and `'turn types its bubbles and storefront completes its morph by pin end'` (scrolling to "pin end" no longer drives the morph). Every other test passes. This proves those tests specified the pin, not the story.

- [ ] **Step 2: Replace `web/e2e/story.spec.ts` in full:**

```ts
import { expect, test, type Locator } from '@playwright/test'

const BEATS = [
  { label: 'The chaos', heading: 'Your week right now' },
  { label: 'The turn', heading: 'Then, quietly, it all gets handled' },
  { label: 'The storefront', heading: 'And it looks gorgeous doing it' },
  { label: 'Proof', heading: 'Built before. Shipped before.' },
] as const

/** Desktop page-height budget in viewport-heights (spec §6 P3.1). The old
 * pinned page ran ~13 viewports of runway; unpinning drops it below 8.
 * Raised by ~1 per NEW CONTENT SECTION as P3.2 (human) and P3.3 (services)
 * land — the budget guards against pinned emptiness, not against content. */
const MAX_PAGE_VIEWPORTS = 8

/** Scroll a section's top to the viewport top, instantly (the site sets
 * scroll-behavior: smooth; tests must not animate there), ONCE — the
 * natural-scroll tests then assert with no further scrolling. */
async function scrollSectionIntoView(page: import('@playwright/test').Page, label: string) {
  await page.evaluate((sectionLabel) => {
    const section = document.querySelector(`section[aria-label="${sectionLabel}"]`)
    if (!section) throw new Error(`no section ${sectionLabel}`)
    section.scrollIntoView({ behavior: 'instant', block: 'start' })
  }, label)
}

test.describe('story beats 2–5 (content)', () => {
  test('sections render in story order between hero and finale', async ({ page }) => {
    await page.goto('/')
    const labels = await page
      .locator('main > section')
      .evaluateAll((sections) => sections.map((section) => section.getAttribute('aria-label')))
    expect(labels).toEqual(['Intro', 'The chaos', 'The turn', 'The storefront', 'Proof', 'Contact'])
  })

  test('proof gallery and results ticker carry the shipped content', async ({ page }) => {
    await page.goto('/')
    const proof = page.locator('section[aria-label="Proof"]')
    await proof.scrollIntoViewIfNeeded()
    await expect(proof.getByRole('heading', { name: 'Built before. Shipped before.' })).toBeVisible()
    for (const name of [
      'Extrack',
      'WhyCosmos',
      'quri',
      'Safewash',
      'Ditch Navigation',
      'Aimers International',
      'Fidus Global',
      'RTOPilot',
    ]) {
      await expect(proof.getByRole('heading', { name, exact: true })).toBeVisible()
    }
    const extrack = proof.getByRole('link', { name: /myextrack\.com/ })
    await expect(extrack).toHaveAttribute('href', 'https://myextrack.com')
    await expect(extrack).toHaveAttribute('rel', /noopener/)
    await expect(proof.getByRole('link', { name: /myquri\.com/ })).toHaveAttribute(
      'href',
      'https://myquri.com',
    )
    // Safewash's site went live in P3 (spec §3.5) — the card links out now
    await expect(proof.getByRole('link', { name: /safewash\.co\.in/ })).toHaveAttribute(
      'href',
      'https://www.safewash.co.in',
    )
    // the four client-work entries wear the pill (exact: true — plain getByText
    // is a case-insensitive substring match and would also hit the outcome
    // lines that begin with "Client work…")
    await expect(proof.getByText('client work', { exact: true })).toHaveCount(4)
    // Ticker numbers flow from content/stats.json via the Zod stats module —
    // CountUp settles on the real values (toHaveText retries through the count-up).
    await expect(proof.locator('dd').nth(0)).toHaveText('15 days')
    await expect(proof.locator('dd').nth(1)).toHaveText('1M+')
    await expect(proof.locator('dd').nth(2)).toHaveText('4')
    // exact: true — Extrack's own outcome line ("From idea to paying
    // customers in 15 days") is a case-insensitive substring match for the
    // ticker's dt label, the same pitfall as "client work" above.
    await expect(proof.getByText('from idea to paying customers', { exact: true })).toBeVisible()
    await expect(proof.getByText('requests served every day', { exact: true })).toBeVisible()
    await expect(proof.getByText('countries where clients run my work', { exact: true })).toBeVisible()
  })
})

test.describe('natural scroll (P3.1) — no pinning, time-driven scenes', () => {
  test('zero sticky elements in main — the visitor always owns the wheel', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('main .sticky')).toHaveCount(0)
  })

  test('page height stays under the viewport budget (desktop, motion on)', async ({
    page,
    isMobile,
  }) => {
    test.skip(Boolean(isMobile), 'height budget is a desktop measure (spec §6 P3.1)')
    await page.goto('/')
    const ratio = await page.evaluate(
      () => document.documentElement.scrollHeight / window.innerHeight,
    )
    expect(ratio).toBeLessThan(MAX_PAGE_VIEWPORTS)
  })

  // Each scene's key element must settle at opacity 1 after ONE scroll that
  // brings the section into view — no further scrolling — proving the
  // choreography is time-driven, not scrubbed. Desktop-scoped: on 375px the
  // sections are taller than the viewport, so per-element visibility is
  // covered by the mobile-light describe below instead.
  const SCENES: ReadonlyArray<{
    label: string
    probe: (section: Locator) => Locator
    timeoutMs: number
  }> = [
    {
      // last-ish card of the ~1.5s tumble choreography
      label: 'The chaos',
      probe: (section) =>
        section.getByText('$1,850 — three weeks overdue').locator('xpath=ancestor::li[1]'),
      timeoutMs: 8_000,
    },
    {
      // the closer fades in after the cascade + typing complete
      label: 'The turn',
      probe: (section) =>
        section.getByText('You find out over coffee. Everything just… happened.'),
      timeoutMs: 12_000,
    },
    {
      // the "after" layer crossfades in ~2s after entry (MORPH_DELAY_MS)
      label: 'The storefront',
      probe: (section) => section.locator('[data-morph="after"]'),
      timeoutMs: 12_000,
    },
  ]

  for (const scene of SCENES) {
    test(`${scene.label}: key element settles visible after entering view — no extra scrolling`, async ({
      page,
      isMobile,
    }) => {
      test.skip(Boolean(isMobile), 'time-driven entry is proven on desktop; mobile readability is covered below')
      await page.goto('/')
      await scrollSectionIntoView(page, scene.label)
      const target = scene.probe(page.locator(`section[aria-label="${scene.label}"]`))
      await expect
        .poll(() => target.evaluate((el) => getComputedStyle(el).opacity), {
          timeout: scene.timeoutMs,
        })
        .toBe('1')
    })
  }

  test('turn bubbles finish typing on a clock', async ({ page, isMobile }) => {
    test.skip(Boolean(isMobile), 'time-driven entry is proven on desktop')
    await page.goto('/')
    await scrollSectionIntoView(page, 'The turn')
    const turn = page.locator('section[aria-label="The turn"]')
    // first() = the typed aria-hidden copy; an sr-only duplicate always exists
    await expect(turn.getByText('Want me to book you in?').first()).toBeVisible({
      timeout: 12_000,
    })
  })

  test('storefront morph completes: after visible, before faded out', async ({
    page,
    isMobile,
  }) => {
    test.skip(Boolean(isMobile), 'time-driven entry is proven on desktop')
    await page.goto('/')
    await scrollSectionIntoView(page, 'The storefront')
    await expect
      .poll(
        () => page.locator('[data-morph="after"]').evaluate((el) => getComputedStyle(el).opacity),
        { timeout: 12_000 },
      )
      .toBe('1')
    await expect
      .poll(
        () => page.locator('[data-morph="before"]').evaluate((el) => getComputedStyle(el).opacity),
        { timeout: 12_000 },
      )
      .toBe('0')
    await expect(page.getByText('Saturday has three openings left.')).toBeVisible()
    await expect(page.getByText('Your website should be your best salesperson.')).toBeVisible()
  })
})

test.describe('reduced motion — the story stays fully readable', () => {
  test('beats 2–5: no pinning, all copy settles visible', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    // natural scroll everywhere: nothing sticky, ever
    await expect(page.locator('main > section .sticky')).toHaveCount(0)
    for (const beat of BEATS) {
      const section = page.locator(`section[aria-label="${beat.label}"]`)
      const heading = section.getByRole('heading', { name: beat.heading })
      await heading.scrollIntoViewIfNeeded()
      await expect(heading).toBeVisible()
    }
    // sample copy from every beat settles to full opacity (MotionConfig
    // reducedMotion="user" keeps the fade, strips the movement)
    for (const sample of [
      '47 unread. Six of them matter. Which six?',
      'Answered in 4 seconds',
      'Your website should be your best salesperson.',
      'From idea to paying customers in 15 days',
    ]) {
      const element = page.getByText(sample).first()
      await element.scrollIntoViewIfNeeded()
      await expect
        .poll(
          () => element.evaluate((el) => getComputedStyle(el.closest('li') ?? el).opacity),
          { timeout: 5000 },
        )
        .toBe('1')
    }
    // guard: no horizontal overflow from wash backdrops
    const noHorizontalPan = await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    )
    expect(noHorizontalPan).toBe(true)
  })
})

test.describe('mobile-light (375px)', () => {
  test.skip(({ isMobile }) => !isMobile, 'the 375px readability pass runs on the mobile project')

  test('beats 2–5 stay readable with the same time-driven entrances', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('main > section .sticky')).toHaveCount(0)
    for (const beat of BEATS) {
      const heading = page.getByRole('heading', { name: beat.heading })
      await heading.scrollIntoViewIfNeeded()
      await expect(heading).toBeVisible()
    }
    const card = page.getByText('They wanted Saturday. They booked someone else.')
    await card.scrollIntoViewIfNeeded()
    await expect
      .poll(
        () => card.evaluate((el) => getComputedStyle(el.closest('li') ?? el).opacity),
        { timeout: 5000 },
      )
      .toBe('1')
    // guard: no horizontal overflow from wash backdrops
    const noHorizontalPan = await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    )
    expect(noHorizontalPan).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Carry-forward from P2 Task 3: jsdom cannot observe rAF-driven repaints or
// real pointer-type discrimination, so these two behaviors are proven here,
// in a real browser, instead of in the unit suite.
// ---------------------------------------------------------------------------

test.describe('proof ticker CountUp — genuine entrance animation (normal motion)', () => {
  // Verified once, on the project with real mouse/scroll semantics; the
  // component gates only on prefers-reduced-motion, not on viewport width, so
  // one project is sufficient to prove the animation actually runs.
  test.skip(({ isMobile }) => Boolean(isMobile), 'entrance animation is viewport-agnostic; proven once on desktop')

  test('speed stat counts up from zero and settles on the module value', async ({ page }) => {
    await page.goto('/')
    // Sample the "15 days" stat's textContent across ~90 rAF frames, starting
    // the instant it scrolls into view (instant scroll — smooth scrolling
    // would blur the moment CountUp's useInView flips true). The static HTML
    // already shows the final value before scroll (spec: no-JS visitors read
    // the real number), so a genuine animation must first dip away from it.
    const samples = await page.evaluate(() => {
      const dd = document.querySelectorAll('section[aria-label="Proof"] dl dd')[0] as HTMLElement
      const collected: string[] = []
      return new Promise<string[]>((resolve) => {
        let frame = 0
        function tick() {
          collected.push(dd.textContent ?? '')
          frame += 1
          if (frame < 90) {
            requestAnimationFrame(tick)
          } else {
            resolve(collected)
          }
        }
        requestAnimationFrame(tick)
        dd.scrollIntoView({ behavior: 'instant', block: 'center' })
      })
    })

    const finalValue = samples[samples.length - 1]
    expect(finalValue).toBe('15 days')
    // Genuinely animated: some sampled frame reads something other than the
    // settled value (it dips to "0 days" and counts back up).
    expect(samples.some((value) => value !== finalValue)).toBe(true)
  })
})

test.describe('TiltCard — mouse-only tilt', () => {
  // The mouse-hover half needs real (non-touch) pointer semantics, and the
  // touch half spins up its own hasTouch context regardless of project —
  // proven once is enough.
  test.skip(({ isMobile }) => Boolean(isMobile), 'pointer-type gating is proven once, with an explicit touch context below')

  test('tilts under mouse movement, stays flat under a touch tap', async ({ page, browser }) => {
    await page.goto('/')
    const proof = page.locator('section[aria-label="Proof"]')
    await proof.scrollIntoViewIfNeeded()
    // No data-testid on the card; anchor on the project heading and walk up
    // to the TiltCard root (3 ancestors: title row → GlassCard → TiltCard).
    const card = proof.getByRole('heading', { name: 'Extrack', exact: true }).locator('xpath=ancestor::div[3]')

    const resting = await card.evaluate((el) => getComputedStyle(el).transform)

    // Hover the card's center first (no tilt at dead-center by construction),
    // then move the pointer off-center — a real mouse pointerType.
    await card.hover()
    const box = (await card.boundingBox())!
    await page.mouse.move(box.x + box.width * 0.85, box.y + box.height * 0.15)
    await expect
      .poll(() => card.evaluate((el) => getComputedStyle(el).transform))
      .not.toBe(resting)

    // Move the mouse away so this context's own state can't bleed into
    // anything else, then prove touch pointers are ignored entirely — in a
    // fresh context so hasTouch is unambiguous (equivalent to test.use({
    // hasTouch: true }), but scoped to just this assertion).
    await page.mouse.move(0, 0)

    const touchContext = await browser.newContext({ hasTouch: true, viewport: { width: 1440, height: 900 } })
    try {
      const touchPage = await touchContext.newPage()
      await touchPage.goto('/')
      const touchProof = touchPage.locator('section[aria-label="Proof"]')
      await touchProof.scrollIntoViewIfNeeded()
      const touchCard = touchProof
        .getByRole('heading', { name: 'Extrack', exact: true })
        .locator('xpath=ancestor::div[3]')
      const touchResting = await touchCard.evaluate((el) => getComputedStyle(el).transform)
      const touchBox = (await touchCard.boundingBox())!
      await touchPage.touchscreen.tap(touchBox.x + touchBox.width * 0.85, touchBox.y + touchBox.height * 0.15)
      // No tilt spring to settle — assert immediately and after a beat.
      const afterTouch = await touchCard.evaluate((el) => getComputedStyle(el).transform)
      expect(afterTouch).toBe(touchResting)
      await touchPage.waitForTimeout(300)
      const afterTouchSettled = await touchCard.evaluate((el) => getComputedStyle(el).transform)
      expect(afterTouchSettled).toBe(touchResting)
    } finally {
      await touchContext.close()
    }
  })
})
```

- [ ] **Step 3: Verify green.** Run:

```bash
npm run test:e2e -w web -- e2e/story.spec.ts
npm run test:e2e -w web
```

Expected: all story tests pass on both projects (desktop-1440 runs everything; mobile-375 runs the sticky-count + mobile-light tests and skips the desktop-scoped ones); `home.spec.ts` untouched and green.

- [ ] **Step 4: Commit.**

```bash
git add web/e2e/story.spec.ts
git commit -m "test(e2e): natural-scroll suite replaces pin/scrub assertions

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 1.6: Delete ScrollScene — the pin/scrub system is gone

**Files:**
- Delete: `web/components/ui/scroll-scene.tsx` (also removes the `supportsFlags.scrollTimeline/viewTimeline` workaround — it lived only in this file)
- Delete: `web/test/unit/scroll-scene.test.tsx`, `web/test/unit/scroll-scene-reduced.test.tsx`
- Modify: `web/test/setup.ts` (line 15 — comment only: `setViewportWide` no longer gates ScrollScene)

**Interfaces:**
- Consumes: nothing — Tasks 1.2–1.4 removed every import.
- Produces: `web/components/ui/` = `count-up.tsx`, `glass-card.tsx`, `sparkle-field.tsx`, `tilt-card.tsx` only. `setViewportWide` in `test/setup.ts` STAYS (Proof's parallax gate and the beats' never-pins tests still use the `(min-width: 768px)` mock).

- [ ] **Step 1: Prove nothing imports it anymore (red-equivalent guard).** Run:

```bash
grep -rn "scroll-scene\|ScrollScene\|supportsFlags" /Users/hiteshmodi/Documents/GitHub/Portfolio/web/components /Users/hiteshmodi/Documents/GitHub/Portfolio/web/app /Users/hiteshmodi/Documents/GitHub/Portfolio/web/lib /Users/hiteshmodi/Documents/GitHub/Portfolio/web/e2e
```

Expected: no matches outside `web/components/ui/scroll-scene.tsx` itself. If anything else matches, STOP — a beat rewrite was incomplete.

- [ ] **Step 2: Delete.**

```bash
git rm web/components/ui/scroll-scene.tsx web/test/unit/scroll-scene.test.tsx web/test/unit/scroll-scene-reduced.test.tsx
```

- [ ] **Step 3: Update the `setViewportWide` doc comment.** In `web/test/setup.ts`, replace line 15:

```ts
/** Toggle the simulated `(min-width: 768px)` query — ScrollScene's scrub gate. */
```

with:

```ts
/** Toggle the simulated `(min-width: 768px)` query — Proof's parallax gate
 * and the beats' never-pins regression tests (P3.1). */
```

- [ ] **Step 4: Verify green — full local gate.** Run:

```bash
npm run lint -w web
npm run typecheck -w web
npm run test:unit -w web
npm run build -w web
npm run budget -w web
npm run test:e2e -w web
```

Expected: everything green; `npm run budget -w web` reports LESS homepage JS than before P3.1 (scrub code deleted) and well under 160 KB.

- [ ] **Step 5: Commit.**

```bash
git add web/test/setup.ts
git commit -m "chore(web): delete ScrollScene — the pin/scrub system is gone

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

# Phase P3.2 — Identity (Tasks 2.1–2.4)

Ships alone: hero carries the face + name, Beat 7 "One engineer, no circus" sits between Proof and Finale (Services slots in above it in P3.3).

### Task 2.1: Photo assets + hero identity chip

**Files:**
- Create: `web/public/images/hitesh-96.jpg` (96×96 square chip, EXIF-free), `web/public/images/hitesh-640.jpg` (640-wide portrait, EXIF-free) — one-time `sips` processing, committed
- Move: `web/public/images/hitesh.jpeg` → `assets/hitesh-original.jpeg` (spec §3.2: the 858 KB EXIF-intact original stays out of the served bundle)
- Modify: `web/content/schema.ts` (extend `HeroContentSchema`, lines 8-16), `web/content/profile.ts` (add `hero.identity`), `web/components/beats/hero.tsx` (insert chip block after the sub paragraph, line 54)
- Test: `web/test/unit/content.test.ts` (schema + shipped-content additions), `web/test/unit/hero.test.tsx` (chip render test)

**Interfaces:**
- Consumes: source photo `web/public/images/hitesh.jpeg` (3024×4032 portrait, verified via `sips -g pixelWidth -g pixelHeight`); macOS `sips`.
- Produces:
  - `HeroContentSchema` gains a required `identity` field:
    `identity: { name: string, line: string, photo: { src: '/images/…', alt: string } }`
  - `profile.hero.identity` = `{ name: 'Hitesh Modi', line: 'builds these end-to-end, replies same day', photo: { src: '/images/hitesh-96.jpg', alt: 'Hitesh Modi — portrait' } }`
  - Hero renders a 48px round `<img>` chip + name line between subhead and CTA.

- [ ] **Step 1: Process the photo (one-time, committed).** The PNG round-trip is the EXIF strip: PNG has no EXIF container, so re-encoding through it drops GPS/device metadata using `sips` alone. Run:

```bash
cd /Users/hiteshmodi/Documents/GitHub/Portfolio
mkdir -p assets
# chip variant: center-crop to square (portrait 3024x4032 → 3024x3024), then 96px
sips -s format png -c 3024 3024 web/public/images/hitesh.jpeg --out /tmp/hitesh-square.png
sips -s format png --resampleWidth 96 /tmp/hitesh-square.png --out /tmp/hitesh-96.png
sips -s format jpeg -s formatOptions 82 /tmp/hitesh-96.png --out web/public/images/hitesh-96.jpg
# display variant: full portrait at 640px wide (~640x853)
sips -s format png --resampleWidth 640 web/public/images/hitesh.jpeg --out /tmp/hitesh-640.png
sips -s format jpeg -s formatOptions 82 /tmp/hitesh-640.png --out web/public/images/hitesh-640.jpg
# original leaves the served bundle (spec §3.2) but stays in git for re-processing
git mv web/public/images/hitesh.jpeg assets/hitesh-original.jpeg
```

- [ ] **Step 2: Verify the assets.**

```bash
# dimensions — RECORD the 640 numbers; Task 2.2 writes them into content/human.ts
sips -g pixelWidth -g pixelHeight web/public/images/hitesh-96.jpg   # expect 96 x 96
sips -g pixelWidth -g pixelHeight web/public/images/hitesh-640.jpg  # expect 640 x 853
# no location metadata survived the PNG round-trip
mdls -name kMDItemLatitude -name kMDItemLongitude web/public/images/hitesh-96.jpg web/public/images/hitesh-640.jpg
# expect: kMDItemLatitude = (null) / kMDItemLongitude = (null) for both
# size sanity: each file well under 150 KB
ls -la web/public/images/
# orientation sanity — EXIF rotation flags are gone, so LOOK at the files:
open web/public/images/hitesh-96.jpg web/public/images/hitesh-640.jpg
# if either renders sideways, rotate the pixels and re-check:
#   sips -r 90 web/public/images/hitesh-96.jpg  (repeat/adjust angle as needed)
```

- [ ] **Step 3: Write the failing tests.**

In `web/test/unit/content.test.ts`, add `identity` to the `validProfile.hero` fixture (after `scrollCue`):

```ts
    scrollCue: 'show me how ↓',
    identity: {
      name: 'Hitesh Modi',
      line: 'builds these end-to-end, replies same day',
      photo: { src: '/images/hitesh-96.jpg', alt: 'Hitesh Modi — portrait' },
    },
```

append inside `describe('ProfileSchema')`:

```ts
  it('rejects a hero without identity (P3.2)', () => {
    const { identity: _identity, ...heroRest } = validProfile.hero
    const bad = { ...validProfile, hero: heroRest }
    expect(ProfileSchema.safeParse(bad).success).toBe(false)
  })

  it('rejects an identity photo without alt text', () => {
    const bad = {
      ...validProfile,
      hero: {
        ...validProfile.hero,
        identity: {
          ...validProfile.hero.identity,
          photo: { src: '/images/hitesh-96.jpg', alt: '' },
        },
      },
    }
    expect(ProfileSchema.safeParse(bad).success).toBe(false)
  })

  it('rejects an identity photo outside /images/', () => {
    const bad = {
      ...validProfile,
      hero: {
        ...validProfile.hero,
        identity: {
          ...validProfile.hero.identity,
          photo: { src: 'https://cdn.example.com/hitesh.jpg', alt: 'Hitesh Modi — portrait' },
        },
      },
    }
    expect(ProfileSchema.safeParse(bad).success).toBe(false)
  })
```

and append inside `describe('shipped content')`:

```ts
  it('ships the hero identity chip content (P3.2)', () => {
    expect(profile.hero.identity.name).toBe('Hitesh Modi')
    expect(profile.hero.identity.line).toBe('builds these end-to-end, replies same day')
    expect(profile.hero.identity.photo.src).toBe('/images/hitesh-96.jpg')
    expect(profile.hero.identity.photo.alt.length).toBeGreaterThan(0)
  })
```

In `web/test/unit/hero.test.tsx`, append inside `describe('Hero')`:

```tsx
  it('renders the identity chip: 48px photo with real alt + name line (P3.2)', () => {
    render(<Hero hero={profile.hero} />)
    const img = screen.getByRole('img', { name: 'Hitesh Modi — portrait' })
    expect(img.getAttribute('src')).toBe('/images/hitesh-96.jpg')
    expect(img.getAttribute('width')).toBe('48')
    expect(img.getAttribute('height')).toBe('48')
    expect(screen.getByText('Hitesh Modi')).toBeDefined()
    expect(screen.getByText(/builds these end-to-end, replies same day/)).toBeDefined()
  })
```

- [ ] **Step 4: Verify they fail.** Run: `npm run test:unit -w web -- test/unit/content.test.ts test/unit/hero.test.tsx`
      Expected: `rejects a hero without identity` fails (`expected true to be false` — the schema doesn't know `identity`, so the stripped profile still parses); the hero test fails with `Unable to find an accessible element with the role "img"`.

- [ ] **Step 5: Implement — schema.** In `web/content/schema.ts`, replace `HeroContentSchema` with:

```ts
export const HeroContentSchema = z.object({
  h1: z.string().min(1),
  sub: z.string().min(1),
  availability: z.string().min(1),
  ctaLabel: z.string().min(1),
  /** In-page anchor the CTA and scroll cue jump to, e.g. "#finale". */
  ctaHref: z.string().regex(/^#[a-z][a-z-]*$/),
  scrollCue: z.string().min(1),
  /** P3.2 hero identity: photo chip + name line under the subhead. */
  identity: z.object({
    name: z.string().min(1),
    line: z.string().min(1),
    photo: z.object({
      /** Committed, EXIF-stripped asset under public/images/ (never the original). */
      src: z.string().regex(/^\/images\/[a-z0-9.-]+\.(jpg|jpeg|png|webp)$/),
      alt: z.string().min(1),
    }),
  }),
})
```

- [ ] **Step 6: Implement — content.** In `web/content/profile.ts`, add to the `hero` object after `scrollCue`:

```ts
    scrollCue: 'show me how ↓',
    identity: {
      name: 'Hitesh Modi',
      line: 'builds these end-to-end, replies same day',
      photo: { src: '/images/hitesh-96.jpg', alt: 'Hitesh Modi — portrait' },
    },
```

- [ ] **Step 7: Implement — component.** In `web/components/beats/hero.tsx`, insert between the sub paragraph (`<p className="mt-6 max-w-xl text-lg text-muted">{hero.sub}</p>`) and the CTA anchor:

```tsx
      <div className="mt-6 flex items-center gap-3">
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
```

- [ ] **Step 8: Verify green.** Run: `npm run test:unit -w web && npm run lint -w web && npm run typecheck -w web`.

- [ ] **Step 9: Commit.**

```bash
git add assets/hitesh-original.jpeg web/public/images/hitesh-96.jpg web/public/images/hitesh-640.jpg \
  web/content/schema.ts web/content/profile.ts web/components/beats/hero.tsx \
  web/test/unit/content.test.ts web/test/unit/hero.test.tsx
git commit -m "feat(web): hero identity — photo chip and name line, processed assets

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2.2: HumanSchema + content/human.ts

**Files:**
- Modify: `web/content/schema.ts` (append `HumanSchema` + `HumanContent` after the services schemas; add the type export at the bottom)
- Create: `web/content/human.ts`
- Test: Create `web/test/unit/human-content.test.ts`

**Interfaces:**
- Consumes: `zod`.
- Produces:
  - `export const HumanSchema` / `export type HumanContent = z.infer<typeof HumanSchema>` in `content/schema.ts` — fields: `heading`, `name`, `story: string[]` (min 2), `nerdyBits: { label, items: string[] (min 1) }`, `photo: { src, alt, width, height }`.
  - `export const human: HumanContent` in `content/human.ts` (photo = the 640 variant from Task 2.1; width/height = the numbers recorded in Task 2.1 Step 2 — expected 640×853).

- [ ] **Step 1: Write the failing tests.** Create `web/test/unit/human-content.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { human } from '../../content/human'
import { HumanSchema } from '../../content/schema'

const validHuman = {
  heading: 'One engineer, no circus',
  name: 'Hitesh Modi',
  story: ['First paragraph.', 'Second paragraph.'],
  nerdyBits: { label: 'the nerdy bits', items: ['AWS', 'MCP servers'] },
  photo: { src: '/images/hitesh-640.jpg', alt: 'Hitesh Modi — portrait', width: 640, height: 853 },
}

describe('HumanSchema', () => {
  it('accepts a valid human section', () => {
    expect(HumanSchema.safeParse(validHuman).success).toBe(true)
  })

  it('rejects a missing name', () => {
    const { name: _name, ...rest } = validHuman
    expect(HumanSchema.safeParse(rest).success).toBe(false)
  })

  it('rejects a single-paragraph story (needs at least two)', () => {
    expect(
      HumanSchema.safeParse({ ...validHuman, story: ['Only one paragraph.'] }).success,
    ).toBe(false)
  })

  it('rejects a photo without dimensions (CLS guard)', () => {
    const bad = {
      ...validHuman,
      photo: { src: '/images/hitesh-640.jpg', alt: 'Hitesh Modi — portrait' },
    }
    expect(HumanSchema.safeParse(bad).success).toBe(false)
  })

  it('rejects a photo outside /images/', () => {
    const bad = {
      ...validHuman,
      photo: { ...validHuman.photo, src: 'https://cdn.example.com/x.jpg' },
    }
    expect(HumanSchema.safeParse(bad).success).toBe(false)
  })

  it('rejects empty nerdy bits', () => {
    const bad = { ...validHuman, nerdyBits: { label: 'the nerdy bits', items: [] } }
    expect(HumanSchema.safeParse(bad).success).toBe(false)
  })
})

describe('shipped human content', () => {
  it('parses and carries the approved heading, photo, and disclosure label', () => {
    expect(human.heading).toBe('One engineer, no circus')
    expect(human.name).toBe('Hitesh Modi')
    expect(human.story.length).toBeGreaterThanOrEqual(2)
    expect(human.nerdyBits.label).toBe('the nerdy bits')
    expect(human.nerdyBits.items.length).toBeGreaterThanOrEqual(1)
    expect(human.photo.src).toBe('/images/hitesh-640.jpg')
    expect(human.photo.width).toBeGreaterThan(0)
    expect(human.photo.height).toBeGreaterThan(0)
  })

  it('keeps the story jargon-free — the tech vocabulary lives in nerdyBits only', () => {
    for (const paragraph of human.story) {
      expect(paragraph).not.toMatch(/AWS|MCP|Lambda|serverless|agent infra|Next\.js/i)
    }
  })
})
```

- [ ] **Step 2: Verify it fails.** Run: `npm run test:unit -w web -- test/unit/human-content.test.ts`
      Expected: `Cannot find module '../../content/human'` (and `HumanSchema` is not exported).

- [ ] **Step 3: Implement — schema.** In `web/content/schema.ts`, append after `export const ServicesSchema = z.array(ServiceSchema).min(1)`:

```ts
/* ——— P3.2: beat 7 — the human (spec §3.4) ——— */

export const HumanSchema = z.object({
  heading: z.string().min(1),
  name: z.string().min(1),
  /** Short story paragraphs — plain words; the tech vocabulary lives in nerdyBits. */
  story: z.array(z.string().min(1)).min(2),
  /** Collapsed-by-default disclosure rendered as a native <details>. */
  nerdyBits: z.object({
    label: z.string().min(1),
    items: z.array(z.string().min(1)).min(1),
  }),
  photo: z.object({
    /** Committed, EXIF-stripped asset under public/images/ (never the original). */
    src: z.string().regex(/^\/images\/[a-z0-9.-]+\.(jpg|jpeg|png|webp)$/),
    alt: z.string().min(1),
    /** Intrinsic pixel dimensions — rendered as width/height attrs (no CLS). */
    width: z.number().int().positive(),
    height: z.number().int().positive(),
  }),
})
```

and add to the type-export block at the bottom (after `export type Service = …`):

```ts
export type HumanContent = z.infer<typeof HumanSchema>
```

- [ ] **Step 4: Implement — content.** Create `web/content/human.ts` (if Task 2.1 Step 2 recorded dimensions other than 640×853, use the recorded numbers):

```ts
import { HumanSchema, type HumanContent } from './schema'

/**
 * Beat 7 — "One engineer, no circus" (spec §3.4). The person behind every
 * other beat. Story stays plain-spoken; the tech vocabulary is deliberately
 * quarantined in nerdyBits (rendered inside a collapsed <details>).
 */
export const human: HumanContent = HumanSchema.parse({
  heading: 'One engineer, no circus',
  name: 'Hitesh Modi',
  story: [
    'I’m Hitesh. Every project on this page — design, build, launch — was done by me, start to finish. No agency, no hand-offs, no “let me check with the team”.',
    'I build with AI every single day. That’s why things that used to take months take me weeks — and why the helpers I build actually work the way the demos promise.',
    'Clients run my work in Australia, the US, and Southeast Asia. Wherever you are, you get answers the same day — usually within the hour.',
  ],
  nerdyBits: {
    label: 'the nerdy bits',
    items: [
      'AWS end-to-end: CDK-defined infrastructure, S3 + CloudFront, Lambda, SES',
      'AI agent infrastructure: MCP servers, tool-calling pipelines, eval harnesses',
      'Static sites tuned to a hard JS budget, tested with Playwright end-to-end',
      'Production systems serving 1M+ requests a day',
    ],
  },
  photo: {
    src: '/images/hitesh-640.jpg',
    alt: 'Hitesh Modi — portrait',
    width: 640,
    height: 853,
  },
})
```

- [ ] **Step 5: Verify green.** Run: `npm run test:unit -w web && npm run lint -w web && npm run typecheck -w web`.

- [ ] **Step 6: Commit.**

```bash
git add web/content/schema.ts web/content/human.ts web/test/unit/human-content.test.ts
git commit -m "feat(content): human module — story, nerdy bits, portrait (HumanSchema)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2.3: Beat 7 component + page wiring

**Files:**
- Create: `web/components/beats/human.tsx`
- Modify: `web/app/page.tsx` (import + render `<Human human={human} />` between `<Proof …>` and `<Finale …>`)
- Test: Create `web/test/unit/human.test.tsx`; Modify `web/test/unit/page.test.tsx` (order array)

**Interfaces:**
- Consumes: `HumanContent` from `@/content/schema`; `human` from `@/content/human` (page only); `GlassCard`; `fadeRise`, `staggerContainer`; CSS class `.calm-wash`.
- Produces: `export interface HumanProps { human: HumanContent }`, `export function Human({ human }: HumanProps)` — `<section aria-label="The human">`, tilted glass-framed photo (`-rotate-2` GlassCard), story paragraphs, native `<details>`/`<summary>` for the nerdy bits. Page order becomes `Intro → The chaos → The turn → The storefront → Proof → The human → Contact`.

- [ ] **Step 1: Write the failing tests.** Create `web/test/unit/human.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Human } from '../../components/beats/human'
import { human } from '../../content/human'

describe('Human (beat 7)', () => {
  const renderHuman = () => render(<Human human={human} />)

  it('renders the heading and every story paragraph', () => {
    renderHuman()
    expect(screen.getByRole('heading', { level: 2 }).textContent).toBe('One engineer, no circus')
    for (const paragraph of human.story) {
      expect(screen.getByText(paragraph)).toBeDefined()
    }
  })

  it('renders the tilted framed photo with alt and explicit dimensions', () => {
    renderHuman()
    const img = screen.getByRole('img', { name: human.photo.alt })
    expect(img.getAttribute('src')).toBe(human.photo.src)
    expect(img.getAttribute('width')).toBe(String(human.photo.width))
    expect(img.getAttribute('height')).toBe(String(human.photo.height))
    expect(img.getAttribute('loading')).toBe('lazy')
  })

  it('tucks the nerdy bits into a native, collapsed <details>', () => {
    const { container } = renderHuman()
    const details = container.querySelector('details') as HTMLDetailsElement
    expect(details).not.toBeNull()
    expect(details.open).toBe(false)
    const summary = details.querySelector('summary') as HTMLElement
    expect(summary.textContent).toBe(human.nerdyBits.label)
    for (const item of human.nerdyBits.items) {
      expect(screen.getByText(item)).toBeDefined()
    }
  })

  it('never pins: plain section, no sticky, no inline height', () => {
    const { container } = renderHuman()
    const section = container.querySelector('section[aria-label="The human"]') as HTMLElement
    expect(section).not.toBeNull()
    expect(section.querySelector('.sticky')).toBeNull()
    expect(section.style.height).toBe('')
  })
})
```

In `web/test/unit/page.test.tsx`, replace the test body's expectation and title:

```tsx
  it('renders all beats in story order (hero → chaos → turn → storefront → proof → human → finale)', () => {
    const { container } = render(<HomePage />)
    const labels = Array.from(container.querySelectorAll('main > section')).map((section) =>
      section.getAttribute('aria-label'),
    )
    expect(labels).toEqual([
      'Intro',
      'The chaos',
      'The turn',
      'The storefront',
      'Proof',
      'The human',
      'Contact',
    ])
  })
```

- [ ] **Step 2: Verify they fail.** Run: `npm run test:unit -w web -- test/unit/human.test.tsx test/unit/page.test.tsx`
      Expected: `Cannot find module '../../components/beats/human'`; page order fails with the missing `'The human'` entry.

- [ ] **Step 3: Implement — component.** Create `web/components/beats/human.tsx`:

```tsx
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
 * tech vocabulary tucked into a native <details> (keyboard + screen-reader
 * accessible for free — no JS disclosure widget). Reduced motion is handled
 * by the page-level MotionConfig (fade only, no movement). */
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
            <details className="rounded-2xl border border-white/60 bg-white/70 p-4 shadow-lg shadow-ink/5 backdrop-blur">
              <summary className="cursor-pointer font-mono text-sm text-muted transition hover:text-ink">
                {human.nerdyBits.label}
              </summary>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted">
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
```

- [ ] **Step 4: Implement — wiring.** In `web/app/page.tsx`:

  1. Add imports (keep the existing alphabetical-ish grouping):

```tsx
import { Human } from '@/components/beats/human'
import { human } from '@/content/human'
```

  2. Render between Proof and Finale:

```tsx
        <Proof proof={proof} ticker={ticker} />
        <Human human={human} />
        <Finale finale={profile.finale} />
```

- [ ] **Step 5: Verify green.** Run: `npm run test:unit -w web && npm run lint -w web && npm run typecheck -w web`.

- [ ] **Step 6: Commit.**

```bash
git add web/components/beats/human.tsx web/app/page.tsx web/test/unit/human.test.tsx web/test/unit/page.test.tsx
git commit -m "feat(web): beat 7 — one engineer, no circus

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2.4: P3.2 E2E — hero identity + human section

**Files:**
- Modify: `web/e2e/home.spec.ts` (append the hero-identity describe)
- Modify: `web/e2e/story.spec.ts` (order array + `MAX_PAGE_VIEWPORTS` 8→9 + append the human describe)

**Interfaces:**
- Consumes: built site with Tasks 2.1–2.3 shipped.
- Produces: spec §6 P3.2 E2E coverage.

- [ ] **Step 1: Write the failing tests.**

In `web/e2e/home.spec.ts`, append at the end of the file:

```ts
test.describe('hero identity (P3.2)', () => {
  test('renders the name line and a photo chip with non-empty alt', async ({ page }) => {
    await page.goto('/')
    const hero = page.locator('section[aria-label="Intro"]')
    await expect(hero.getByText('Hitesh Modi', { exact: true })).toBeVisible()
    await expect(hero.getByText(/builds these end-to-end, replies same day/)).toBeVisible()
    const img = hero.locator('img')
    await expect(img).toBeVisible()
    const alt = await img.getAttribute('alt')
    expect(alt !== null && alt.length > 0).toBe(true)
  })
})
```

In `web/e2e/story.spec.ts`:

  1. Change `const MAX_PAGE_VIEWPORTS = 8` to `const MAX_PAGE_VIEWPORTS = 9` (the human section adds ~1 real-content viewport; the comment above the constant already explains the policy).
  2. In `'sections render in story order…'`, replace the expected array with:

```ts
    expect(labels).toEqual([
      'Intro',
      'The chaos',
      'The turn',
      'The storefront',
      'Proof',
      'The human',
      'Contact',
    ])
```

  3. Append after the `'mobile-light (375px)'` describe:

```ts
test.describe('human (beat 7, P3.2)', () => {
  test('renders heading, photo, and an openable nerdy-bits disclosure', async ({ page }) => {
    await page.goto('/')
    const section = page.locator('section[aria-label="The human"]')
    await section.scrollIntoViewIfNeeded()
    await expect(section.getByRole('heading', { name: 'One engineer, no circus' })).toBeVisible()
    const photo = section.locator('img')
    await expect(photo).toBeVisible()
    await expect(photo).toHaveAttribute('alt', /.+/)
    const details = section.locator('details')
    await expect(details).not.toHaveAttribute('open')
    await section.locator('summary').click()
    await expect(details).toHaveAttribute('open', '')
    await expect(section.getByText(/MCP servers/)).toBeVisible()
  })
})
```

- [ ] **Step 2: Verify red → green.** The failing run must be against a STALE build (pre-P3.2 `out/`) to prove the tests bite; then rebuild and pass:

```bash
npm run test:e2e -w web -- e2e/story.spec.ts e2e/home.spec.ts   # old out/ → order + identity + human tests FAIL
npm run build -w web
npm run test:e2e -w web                                          # → all green, both projects
```

- [ ] **Step 3: Commit.**

```bash
git add web/e2e/home.spec.ts web/e2e/story.spec.ts
git commit -m "test(e2e): hero identity and human section coverage

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

# Phase P3.3 — Services doors (Tasks 3.1–3.2)

Ships alone: the until-now-unconsumed `content/services.ts` renders as Beat 6, wired between Proof and Human.

### Task 3.1: Services beat component (three glass doors)

**Files:**
- Modify: `web/content/schema.ts` (append `ServicesIntroSchema` + type export)
- Modify: `web/content/services.ts` (append `servicesIntro` export — the section heading/lede so the component hardcodes no prose)
- Create: `web/components/beats/services.tsx`
- Modify: `web/app/globals.css` (append `.service-door` hover-reveal rules)
- Test: Create `web/test/unit/services.test.tsx`

**Interfaces:**
- Consumes: existing `Service` type + `services` array (`slug | title | hook | deliverables | timeline | ctaLabel` — see `web/content/services.ts`); `GlassCard`; `fadeRise`, `staggerContainer`.
- Produces:
  - `export const ServicesIntroSchema = z.object({ heading, lede })` / `export type ServicesIntro` in `content/schema.ts`.
  - `export const servicesIntro: ServicesIntro` in `content/services.ts`.
  - `export interface ServicesProps { intro: ServicesIntro; services: Service[] }`, `export function Services({ intro, services }: ServicesProps)` — `<section aria-label="Services">`, one glass "door" per service (3-across on `md+`, stacked below), inline hand-rolled SVG icon per slug (`aria-hidden`, `focusable="false"`), what-you-get list, timeline, `Book a call` CTA → `#finale`. Hover/focus lifts the door and reveals the list ONLY under `(hover: hover) and (prefers-reduced-motion: no-preference)`; touch and reduced-motion visitors always see the list (pure CSS gate — no JS branch). No prices, no jargon (both live only in content, which has neither).

- [ ] **Step 1: Write the failing tests.** Create `web/test/unit/services.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Services } from '../../components/beats/services'
import { ServicesIntroSchema, ServicesSchema } from '../../content/schema'
import { services, servicesIntro } from '../../content/services'

const fixtureIntro = ServicesIntroSchema.parse({
  heading: 'Ways in',
  lede: 'Pick one.',
})

const fixtureServices = ServicesSchema.parse([
  {
    slug: 'the-landing-page',
    title: 'Door One',
    hook: 'Hook one.',
    deliverables: ['Thing A', 'Thing B'],
    timeline: 'about 2 weeks',
    ctaLabel: 'Book a call',
  },
  {
    slug: 'a-mystery-door',
    title: 'Door Two',
    hook: 'Hook two.',
    deliverables: ['Thing C'],
    timeline: '1 week',
    ctaLabel: 'Book a call',
  },
])

describe('Services (beat 6)', () => {
  it('renders every field of every fixture service', () => {
    render(<Services intro={fixtureIntro} services={fixtureServices} />)
    expect(screen.getByRole('heading', { level: 2 }).textContent).toBe('Ways in')
    expect(screen.getByText('Pick one.')).toBeDefined()
    for (const service of fixtureServices) {
      expect(screen.getByRole('heading', { level: 3, name: service.title })).toBeDefined()
      expect(screen.getByText(service.hook)).toBeDefined()
      for (const item of service.deliverables) {
        expect(screen.getByText(item)).toBeDefined()
      }
      expect(screen.getByText(service.timeline)).toBeDefined()
    }
  })

  it('links every CTA to #finale', () => {
    render(<Services intro={fixtureIntro} services={fixtureServices} />)
    const ctas = screen.getAllByRole('link', { name: 'Book a call' })
    expect(ctas).toHaveLength(2)
    for (const cta of ctas) {
      expect(cta.getAttribute('href')).toBe('#finale')
    }
  })

  it('renders one decorative icon per door — aria-hidden, not focusable, with a fallback for unknown slugs', () => {
    const { container } = render(<Services intro={fixtureIntro} services={fixtureServices} />)
    const icons = container.querySelectorAll('svg')
    expect(icons).toHaveLength(2)
    icons.forEach((icon) => {
      expect(icon.getAttribute('aria-hidden')).toBe('true')
      expect(icon.getAttribute('focusable')).toBe('false')
    })
  })

  it('shows no price strings anywhere in the section', () => {
    const { container } = render(<Services intro={fixtureIntro} services={fixtureServices} />)
    expect(container.textContent).not.toMatch(/\$|₹|€|price/i)
  })

  it('renders the real shipped content: three doors', () => {
    render(<Services intro={servicesIntro} services={services} />)
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(3)
    expect(screen.getByRole('heading', { level: 3, name: 'The Landing Page' })).toBeDefined()
    expect(screen.getByRole('heading', { level: 3, name: 'The AI Employee' })).toBeDefined()
    expect(screen.getByRole('heading', { level: 3, name: 'The Full Build' })).toBeDefined()
  })

  it('keeps the deliverables list in the DOM (CSS-only hover reveal — always present for touch/reduced-motion)', () => {
    const { container } = render(<Services intro={servicesIntro} services={services} />)
    const lists = container.querySelectorAll('.service-door-list')
    expect(lists).toHaveLength(3)
    expect(
      screen.getByText('A hand-crafted page designed around one goal: turning visitors into enquiries'),
    ).toBeDefined()
  })
})
```

- [ ] **Step 2: Verify it fails.** Run: `npm run test:unit -w web -- test/unit/services.test.tsx`
      Expected: `Cannot find module '../../components/beats/services'` (and `ServicesIntroSchema` / `servicesIntro` are not exported).

- [ ] **Step 3: Implement — schema.** In `web/content/schema.ts`, append directly after `export const ServicesSchema = z.array(ServiceSchema).min(1)`:

```ts
/** P3.3: the services section's own copy — components never hardcode prose. */
export const ServicesIntroSchema = z.object({
  heading: z.string().min(1),
  lede: z.string().min(1),
})
```

and add to the type-export block at the bottom (after `export type Service = …`):

```ts
export type ServicesIntro = z.infer<typeof ServicesIntroSchema>
```

- [ ] **Step 4: Implement — content.** In `web/content/services.ts`, change the import line to:

```ts
import { ServicesIntroSchema, ServicesSchema, type Service, type ServicesIntro } from './schema'
```

and append at the end of the file:

```ts
/** Beat 6 section header (P3.3). Plain words, no prices, no jargon. */
export const servicesIntro: ServicesIntro = ServicesIntroSchema.parse({
  heading: 'Three ways to start',
  lede: 'Pick the door that fits. Every one of them ends with something real, live, and working for you.',
})
```

- [ ] **Step 5: Implement — component.** Create `web/components/beats/services.tsx`:

```tsx
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
```

- [ ] **Step 6: Implement — CSS.** Append to `web/app/globals.css`:

```css
/* Beat 6 — service doors (P3.3, spec §3.3). The deliverables list is always
   in the DOM; ONLY hover-capable, motion-allowing environments collapse it
   behind a hover/focus reveal with a card lift. Touch devices and
   prefers-reduced-motion visitors always see everything, motionless. */
@media (hover: hover) and (prefers-reduced-motion: no-preference) {
  .service-door {
    transition:
      transform 0.3s ease,
      box-shadow 0.3s ease;
  }
  .service-door:hover,
  .service-door:focus-within {
    transform: translateY(-6px);
    box-shadow: 0 20px 40px -16px color-mix(in srgb, var(--color-ink) 18%, transparent);
  }
  .service-door .service-door-list {
    display: grid;
    grid-template-rows: 0fr;
    opacity: 0;
    transition:
      grid-template-rows 0.3s ease,
      opacity 0.3s ease;
  }
  .service-door .service-door-list > ul {
    overflow: hidden;
  }
  .service-door:hover .service-door-list,
  .service-door:focus-within .service-door-list {
    grid-template-rows: 1fr;
    opacity: 1;
  }
}
```

- [ ] **Step 7: Verify green.** Run: `npm run test:unit -w web && npm run lint -w web && npm run typecheck -w web`.

- [ ] **Step 8: Commit.**

```bash
git add web/components/beats/services.tsx web/content/schema.ts web/content/services.ts \
  web/app/globals.css web/test/unit/services.test.tsx
git commit -m "feat(web): beat 6 — service doors render content/services.ts

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3.2: Wire Services into the page + P3.3 E2E

**Files:**
- Modify: `web/app/page.tsx` (import + render `<Services …>` between Proof and Human)
- Modify: `web/test/unit/page.test.tsx` (order array)
- Modify: `web/e2e/story.spec.ts` (order array + `MAX_PAGE_VIEWPORTS` 9→10 + services describe)

**Interfaces:**
- Consumes: `Services` from Task 3.1; `services`, `servicesIntro` from `@/content/services`.
- Produces: final spec §3.6 page order `Hero → Chaos → Turn → Storefront → Proof → Services → Human → Finale`; spec §6 P3.3 E2E coverage.

- [ ] **Step 1: Write the failing tests.**

In `web/test/unit/page.test.tsx`, replace the expected labels array (and title) with:

```tsx
  it('renders all beats in story order (hero → chaos → turn → storefront → proof → services → human → finale)', () => {
    const { container } = render(<HomePage />)
    const labels = Array.from(container.querySelectorAll('main > section')).map((section) =>
      section.getAttribute('aria-label'),
    )
    expect(labels).toEqual([
      'Intro',
      'The chaos',
      'The turn',
      'The storefront',
      'Proof',
      'Services',
      'The human',
      'Contact',
    ])
  })
```

In `web/e2e/story.spec.ts`:

  1. `const MAX_PAGE_VIEWPORTS = 9` → `const MAX_PAGE_VIEWPORTS = 10` (one more real-content section).
  2. In `'sections render in story order…'`, insert `'Services',` between `'Proof',` and `'The human',`.
  3. Append after the `'human (beat 7, P3.2)'` describe:

```ts
test.describe('services (beat 6, P3.3)', () => {
  test('renders exactly three doors — heading, timeline, #finale CTA, no prices', async ({
    page,
  }) => {
    await page.goto('/')
    const section = page.locator('section[aria-label="Services"]')
    await section.scrollIntoViewIfNeeded()
    await expect(section.getByRole('heading', { level: 3 })).toHaveCount(3)
    for (const door of [
      { title: 'The Landing Page', timeline: 'about 2 weeks' },
      { title: 'The AI Employee', timeline: '3–4 weeks' },
      { title: 'The Full Build', timeline: '6–10 weeks' },
    ]) {
      await expect(section.getByRole('heading', { level: 3, name: door.title })).toBeVisible()
      await expect(section.getByText(door.timeline)).toBeVisible()
    }
    const ctas = section.getByRole('link', { name: 'Book a call' })
    await expect(ctas).toHaveCount(3)
    for (const cta of await ctas.all()) {
      await expect(cta).toHaveAttribute('href', '#finale')
    }
    const text = await section.textContent()
    expect(text).not.toMatch(/\$|₹|€|price/i)
  })

  test('desktop hover reveals the what-you-get list', async ({ page, isMobile }) => {
    test.skip(Boolean(isMobile), 'touch devices always show the list — covered below')
    await page.goto('/')
    const section = page.locator('section[aria-label="Services"]')
    await section.scrollIntoViewIfNeeded()
    const firstDeliverable = section.getByText(
      'A hand-crafted page designed around one goal: turning visitors into enquiries',
    )
    // collapsed before hover on a hover-capable, motion-allowing viewport
    await expect(firstDeliverable).not.toBeVisible()
    await section.getByRole('heading', { name: 'The Landing Page' }).hover()
    await expect(firstDeliverable).toBeVisible()
  })

  test('touch viewports always show the list — no hover required', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'touch behavior is proven on the mobile project')
    await page.goto('/')
    const section = page.locator('section[aria-label="Services"]')
    const firstDeliverable = section.getByText(
      'A hand-crafted page designed around one goal: turning visitors into enquiries',
    )
    await firstDeliverable.scrollIntoViewIfNeeded()
    await expect(firstDeliverable).toBeVisible()
  })

  test('reduced motion always shows the list — no hover required', async ({ page, isMobile }) => {
    test.skip(Boolean(isMobile), 'proven once on desktop with emulated reduced motion')
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    const section = page.locator('section[aria-label="Services"]')
    const firstDeliverable = section.getByText(
      'A hand-crafted page designed around one goal: turning visitors into enquiries',
    )
    await firstDeliverable.scrollIntoViewIfNeeded()
    await expect(firstDeliverable).toBeVisible()
  })
})
```

- [ ] **Step 2: Verify unit red.** Run: `npm run test:unit -w web -- test/unit/page.test.tsx`
      Expected: labels array missing `'Services'`.

- [ ] **Step 3: Implement — wiring.** In `web/app/page.tsx`:

  1. Add imports:

```tsx
import { Services } from '@/components/beats/services'
import { services, servicesIntro } from '@/content/services'
```

  2. Render between Proof and Human:

```tsx
        <Proof proof={proof} ticker={ticker} />
        <Services intro={servicesIntro} services={services} />
        <Human human={human} />
```

- [ ] **Step 4: Verify green — unit then E2E.**

```bash
npm run test:unit -w web
npm run lint -w web && npm run typecheck -w web
npm run build -w web
npm run budget -w web
npm run test:e2e -w web
```

- [ ] **Step 5: Commit.**

```bash
git add web/app/page.tsx web/test/unit/page.test.tsx web/e2e/story.spec.ts
git commit -m "feat(web): wire services doors into the page order

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

# Phase P3.4 — Gallery visuals (Tasks 4.1–4.4)

Ships alone: proof cards grow tilted screenshot headers + logo chips, fed by committed assets from a manually-run capture script. Text-only fallback keeps every card valid if a capture fails.

### Task 4.1: ProjectSchema — optional image + logo fields

**Files:**
- Modify: `web/content/schema.ts` (extend `ProjectSchema`, lines 106-116)
- Test: `web/test/unit/story-content.test.ts` (append schema cases to `describe('ProjectSchema / ProjectsSchema')`)

**Interfaces:**
- Consumes: existing `ProjectSchema`.
- Produces: `ProjectSchema` gains
  `image?: { src: '/shots/<slug>.png|webp', width: int>0, height: int>0, alt: string }` and
  `logo?: { src: '/logos/<slug>.png|webp', alt: string }`.
  `Project` (inferred type) carries both — no separate schema exports needed; `proof.tsx` reads them off the project prop.

- [ ] **Step 1: Write the failing tests.** In `web/test/unit/story-content.test.ts`, append inside `describe('ProjectSchema / ProjectsSchema')`:

```ts
  const baseProject = {
    slug: 'extrack',
    name: 'Extrack',
    tagline: 't',
    outcome: 'o',
    url: 'https://myextrack.com',
    kind: 'product',
  }

  it('accepts a project without image/logo (text-only fallback, P3.4)', () => {
    expect(ProjectSchema.safeParse(baseProject).success).toBe(true)
  })

  it('accepts a project with image and logo (P3.4)', () => {
    const withAssets = {
      ...baseProject,
      image: { src: '/shots/extrack.png', width: 1200, height: 750, alt: 'Extrack — live site' },
      logo: { src: '/logos/extrack.png', alt: 'Extrack logo' },
    }
    expect(ProjectSchema.safeParse(withAssets).success).toBe(true)
  })

  it('rejects an image outside /shots/ or without dimensions', () => {
    expect(
      ProjectSchema.safeParse({
        ...baseProject,
        image: { src: 'https://cdn.example.com/x.png', width: 1200, height: 750, alt: 'x' },
      }).success,
    ).toBe(false)
    expect(
      ProjectSchema.safeParse({
        ...baseProject,
        image: { src: '/shots/extrack.png', alt: 'x' },
      }).success,
    ).toBe(false)
  })

  it('rejects a logo outside /logos/ or without alt', () => {
    expect(
      ProjectSchema.safeParse({
        ...baseProject,
        logo: { src: '/images/extrack.png', alt: 'Extrack logo' },
      }).success,
    ).toBe(false)
    expect(
      ProjectSchema.safeParse({
        ...baseProject,
        logo: { src: '/logos/extrack.png', alt: '' },
      }).success,
    ).toBe(false)
  })
```

- [ ] **Step 2: Verify it fails.** Run: `npm run test:unit -w web -- test/unit/story-content.test.ts`
      Expected: the two rejection tests fail (`expected true to be false` — Zod objects strip unknown keys, so malformed `image`/`logo` blobs currently parse fine).

- [ ] **Step 3: Implement.** In `web/content/schema.ts`, replace `ProjectSchema` with:

```ts
export const ProjectSchema = z.object({
  slug: z.string().regex(/^[a-z][a-z0-9-]*$/),
  name: z.string().min(1),
  tagline: z.string().min(1),
  outcome: z.string().min(1),
  url: httpsUrl.optional(),
  /** 'client' entries mark shipped client work (the client-URL slot
   * mechanism, in use since 2026-07-10) — append new client sites to
   * content/projects.ts as they go live; no component changes needed. */
  kind: z.enum(['product', 'client']),
  /** P3.4: committed screenshot from scripts/capture-shots.ts. Optional —
   * a card without one renders text-only. Explicit dimensions = no CLS. */
  image: z
    .object({
      src: z.string().regex(/^\/shots\/[a-z0-9-]+\.(png|webp)$/),
      width: z.number().int().positive(),
      height: z.number().int().positive(),
      alt: z.string().min(1),
    })
    .optional(),
  /** P3.4: committed favicon chip. Optional — omitted when unusable (spec §7). */
  logo: z
    .object({
      src: z.string().regex(/^\/logos\/[a-z0-9-]+\.(png|webp)$/),
      alt: z.string().min(1),
    })
    .optional(),
})
```

- [ ] **Step 4: Verify green.** Run: `npm run test:unit -w web && npm run typecheck -w web`.

- [ ] **Step 5: Commit.**

```bash
git add web/content/schema.ts web/test/unit/story-content.test.ts
git commit -m "feat(content): optional image/logo fields on ProjectSchema

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4.2: capture-shots script

**Files:**
- Create: `web/scripts/capture-shots.ts` (same home + standalone pattern as `web/scripts/fetch-stats.ts`)
- Modify: `web/package.json` (add `capture:shots` script)
- Test: Create `web/test/unit/capture-shots.test.ts`

**Interfaces:**
- Consumes: `chromium` from `@playwright/test` (existing dev dep — the documented way to drive browsers from a plain script); the live project sites.
- Produces:
  - `export const TARGETS: ReadonlyArray<{ slug, url }>` and `export function resolveIconUrl(pageUrl, iconHref)` (unit-tested).
  - npm script `capture:shots` → `node --experimental-strip-types scripts/capture-shots.ts`. **Manual only — never wired into build/CI** (spec §3.5: the build never touches the network for these). Requires Node ≥ 22.6; on this machine run
    `PATH="/opt/homebrew/opt/node@22/bin:$PATH" npm run capture:shots -w web`.
  - Outputs `web/public/shots/<slug>.png` (1200×750) and `web/public/logos/<slug>.png` per site; any per-site failure prints a warning and skips (card falls back to text-only).

- [ ] **Step 1: Write the failing test.** Create `web/test/unit/capture-shots.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest'
import { proof } from '../../content/projects'

// The script imports { chromium } from '@playwright/test', which refuses to
// load inside another test runner — stub it; the import-time code under test
// (TARGETS, resolveIconUrl) never touches it. main() is argv-guarded.
vi.mock('@playwright/test', () => ({ chromium: {} }))

import { TARGETS, VIEWPORT, resolveIconUrl } from '../../scripts/capture-shots'

describe('capture-shots targets', () => {
  it('stays in lockstep with content/projects.ts (every linked project, same order)', () => {
    const expected = proof.projects
      .filter((project) => project.url !== undefined)
      .map((project) => ({ slug: project.slug, url: project.url }))
    expect([...TARGETS]).toEqual(expected)
  })

  it('captures at the spec dimensions', () => {
    expect(VIEWPORT).toEqual({ width: 1200, height: 750 })
  })
})

describe('resolveIconUrl', () => {
  it('falls back to /favicon.ico when the page declares no icon', () => {
    expect(resolveIconUrl('https://myextrack.com', null)).toBe('https://myextrack.com/favicon.ico')
  })

  it('resolves a relative icon href against the page url', () => {
    expect(resolveIconUrl('https://myextrack.com/somewhere/', '/icons/fav.png')).toBe(
      'https://myextrack.com/icons/fav.png',
    )
  })

  it('keeps an absolute icon href as-is', () => {
    expect(resolveIconUrl('https://myextrack.com', 'https://cdn.example.com/fav.png')).toBe(
      'https://cdn.example.com/fav.png',
    )
  })
})
```

- [ ] **Step 2: Verify it fails.** Run: `npm run test:unit -w web -- test/unit/capture-shots.test.ts`
      Expected: `Cannot find module '../../scripts/capture-shots'`.

- [ ] **Step 3: Implement.** Create `web/scripts/capture-shots.ts`:

```ts
/**
 * Manual gallery-asset capture (P3.4, spec §3.5).
 *
 * Run:            npm run capture:shots -w web
 * On this machine (default Node is 20.x; the script needs >= 22.6 for
 * --experimental-strip-types):
 *                 PATH="/opt/homebrew/opt/node@22/bin:$PATH" npm run capture:shots -w web
 *
 * Visits each project site with Playwright's bundled Chromium and saves
 *   - a 1200x750 screenshot -> public/shots/<slug>.png
 *   - the site's favicon    -> public/logos/<slug>.png
 * Assets are COMMITTED; build/CI never runs this (no network at build time).
 * A failing site is SKIPPED with a warning — its card falls back to
 * text-only rendering (image/logo are optional in ProjectSchema). Re-run any
 * time screenshots go stale; git diffs the binaries visibly.
 *
 * TARGETS is deliberately standalone rather than importing
 * content/projects.ts — same rationale as fetch-stats.ts: extensionless
 * cross-file .ts imports don't resolve under --experimental-strip-types.
 * test/unit/capture-shots.test.ts pins TARGETS to content/projects.ts.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { chromium, type Page } from '@playwright/test'

export const TARGETS: ReadonlyArray<{ slug: string; url: string }> = [
  { slug: 'extrack', url: 'https://myextrack.com' },
  { slug: 'whycosmos', url: 'https://whycosmos.com' },
  { slug: 'quri', url: 'https://myquri.com' },
  { slug: 'safewash', url: 'https://www.safewash.co.in' },
  { slug: 'ditch-navigation', url: 'https://www.ditchnavigation.com' },
  { slug: 'aimers-international', url: 'https://www.aimersinternational.com' },
  { slug: 'fidus-global', url: 'https://www.fidusglobal.in' },
  { slug: 'rtopilot', url: 'https://www.rtopilot.com.au' },
]

/** Spec §3.5 capture size. */
export const VIEWPORT = { width: 1200, height: 750 }

const PUBLIC_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public')

/** The page's declared <link rel~=icon> resolved against the page URL, else
 * the /favicon.ico convention. */
export function resolveIconUrl(pageUrl: string, iconHref: string | null): string {
  if (iconHref) return new URL(iconHref, pageUrl).href
  return new URL('/favicon.ico', pageUrl).href
}

async function captureOne(page: Page, target: { slug: string; url: string }): Promise<void> {
  await page.goto(target.url, { waitUntil: 'networkidle', timeout: 45_000 })
  await page.waitForTimeout(1_500) // let entrance animations settle
  await page.screenshot({ path: path.join(PUBLIC_DIR, 'shots', `${target.slug}.png`) })
  console.log(`capture-shots: ${target.slug} — screenshot saved`)

  const iconHref = await page.evaluate(
    () => document.querySelector('link[rel~="icon"]')?.getAttribute('href') ?? null,
  )
  const iconUrl = resolveIconUrl(target.url, iconHref)
  const response = await page.request.get(iconUrl, { timeout: 15_000 })
  if (!response.ok()) {
    console.warn(
      `capture-shots: ${target.slug} — favicon fetch failed (${response.status()}) — logo skipped, chip omitted`,
    )
    return
  }
  writeFileSync(path.join(PUBLIC_DIR, 'logos', `${target.slug}.png`), await response.body())
  console.log(`capture-shots: ${target.slug} — logo saved`)
}

async function main(): Promise<void> {
  mkdirSync(path.join(PUBLIC_DIR, 'shots'), { recursive: true })
  mkdirSync(path.join(PUBLIC_DIR, 'logos'), { recursive: true })
  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 1 })
  let captured = 0
  for (const target of TARGETS) {
    const page = await context.newPage()
    try {
      await captureOne(page, target)
      captured += 1
    } catch (error) {
      console.warn(
        `capture-shots: SKIPPED ${target.slug} (${error instanceof Error ? error.message : 'unknown error'}) — card stays text-only`,
      )
    } finally {
      await page.close()
    }
  }
  await browser.close()
  console.log(`capture-shots: done — ${captured}/${TARGETS.length} sites captured`)
}

// Execute only when run directly, never when imported by the unit suite.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error: unknown) => {
    console.error(
      `capture-shots: fatal (${error instanceof Error ? error.message : 'unknown error'})`,
    )
    process.exitCode = 1
  })
}
```

- [ ] **Step 4: Add the npm script.** In `web/package.json` `"scripts"`, after `"budget"`:

```json
    "capture:shots": "node --experimental-strip-types scripts/capture-shots.ts",
```

- [ ] **Step 5: Verify green.** Run: `npm run test:unit -w web && npm run lint -w web && npm run typecheck -w web`. (Do NOT run `capture:shots` yet — Task 4.4 runs it once, deliberately.)

- [ ] **Step 6: Commit.**

```bash
git add web/scripts/capture-shots.ts web/package.json web/test/unit/capture-shots.test.ts
git commit -m "feat(web): capture-shots script — screenshots and favicons via Playwright

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4.3: Proof cards — screenshot header + logo chip + text-only fallback

**Files:**
- Modify: `web/components/beats/proof.tsx` (card body, lines 59-80)
- Modify: `web/e2e/story.spec.ts` (TiltCard xpath depth `div[3]` → `div[4]`, both occurrences)
- Test: `web/test/unit/proof.test.tsx` (append gallery-visuals describe)

**Interfaces:**
- Consumes: `Project['image']` / `Project['logo']` from Task 4.1 (both optional).
- Produces: cards with `image` render a slightly counter-tilted screenshot header (`<img loading="lazy">` with explicit width/height); `logo` renders a 20px chip beside the name inside a new (unconditional) name-row wrapper; absent fields → exactly today's text-only card. The name-row wrapper adds one ancestor `<div>` above `h3`, so the E2E TiltCard xpath walks 4 ancestors now.

- [ ] **Step 1: Write the failing tests.** In `web/test/unit/proof.test.tsx`, change the content imports to:

```ts
import { ProofSchema, type ProofContent } from '../../content/schema'
import { proof } from '../../content/projects'
import { ticker } from '../../content/ticker'
```

and append after the existing describe:

```tsx
describe('Proof gallery visuals (P3.4)', () => {
  const galleryFixture: ProofContent = ProofSchema.parse({
    heading: 'Built before. Shipped before.',
    lede: 'Fixture lede.',
    projects: [
      {
        slug: 'with-image',
        name: 'With Image',
        tagline: 't',
        outcome: 'o',
        url: 'https://example.com',
        kind: 'product',
        image: { src: '/shots/with-image.png', width: 1200, height: 750, alt: 'With Image — live site' },
        logo: { src: '/logos/with-image.png', alt: 'With Image logo' },
      },
      { slug: 'text-only', name: 'Text Only', tagline: 't', outcome: 'o', kind: 'product' },
    ],
  })

  it('renders a lazy screenshot header with explicit dimensions when image is present', () => {
    render(<Proof proof={galleryFixture} ticker={ticker} />)
    const shot = screen.getByRole('img', { name: 'With Image — live site' })
    expect(shot.getAttribute('src')).toBe('/shots/with-image.png')
    expect(shot.getAttribute('loading')).toBe('lazy')
    expect(shot.getAttribute('width')).toBe('1200')
    expect(shot.getAttribute('height')).toBe('750')
  })

  it('renders a logo chip beside the name when logo is present', () => {
    render(<Proof proof={galleryFixture} ticker={ticker} />)
    const logo = screen.getByRole('img', { name: 'With Image logo' })
    expect(logo.getAttribute('src')).toBe('/logos/with-image.png')
    expect(logo.getAttribute('loading')).toBe('lazy')
  })

  it('falls back to text-only when image and logo are absent', () => {
    const { container } = render(<Proof proof={galleryFixture} ticker={ticker} />)
    expect(screen.getByRole('heading', { level: 3, name: 'Text Only' })).toBeDefined()
    // exactly two imgs in the whole gallery: the fixture's screenshot + logo
    expect(container.querySelectorAll('img')).toHaveLength(2)
  })
})
```

- [ ] **Step 2: Verify it fails.** Run: `npm run test:unit -w web -- test/unit/proof.test.tsx`
      Expected: `Unable to find an accessible element with the role "img"` — the card ignores `image`/`logo` today.

- [ ] **Step 3: Implement.** In `web/components/beats/proof.tsx`, replace the `<GlassCard …>` card body (currently lines 59-80) with:

```tsx
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
                      {project.kind === 'client' ? (
                        <span className="rounded-full bg-wash-sky px-2.5 py-0.5 text-xs text-muted">
                          client work
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm text-muted">{project.tagline}</p>
                    <p className="mt-4 text-sm font-medium text-ink">{project.outcome}</p>
                    {project.url ? (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-auto pt-4 font-mono text-xs text-muted underline underline-offset-4 transition hover:text-ink"
                      >
                        {new URL(project.url).hostname} ↗
                      </a>
                    ) : null}
                  </GlassCard>
```

- [ ] **Step 4: Fix the TiltCard E2E anchors.** The name-row wrapper adds one ancestor div above `h3`. In `web/e2e/story.spec.ts` (TiltCard describe), change BOTH xpath locators from `ancestor::div[3]` to `ancestor::div[4]` and update the comment:

```ts
    // No data-testid on the card; anchor on the project heading and walk up
    // to the TiltCard root (4 ancestors since P3.4's name-row wrapper:
    // name row → title row → GlassCard → TiltCard).
    const card = proof.getByRole('heading', { name: 'Extrack', exact: true }).locator('xpath=ancestor::div[4]')
```

and

```ts
      const touchCard = touchProof
        .getByRole('heading', { name: 'Extrack', exact: true })
        .locator('xpath=ancestor::div[4]')
```

- [ ] **Step 5: Verify green.** Run: `npm run test:unit -w web && npm run lint -w web && npm run typecheck -w web`, then `npm run build -w web && npm run test:e2e -w web` (real content has no images yet — every card renders text-only, all suites pass, TiltCard xpath now matches the new depth).

- [ ] **Step 6: Commit.**

```bash
git add web/components/beats/proof.tsx web/test/unit/proof.test.tsx web/e2e/story.spec.ts
git commit -m "feat(web): proof cards — tilted screenshot header and logo chip

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4.4: Capture the assets + wire them into content + P3.4 E2E

**Files:**
- Create: `web/public/shots/<slug>.png` + `web/public/logos/<slug>.png` (capture script output — committed)
- Modify: `web/content/projects.ts` (add `image`/`logo` per successfully captured slug)
- Modify: `web/e2e/story.spec.ts` (append gallery-visuals describe)
- Test: `web/test/unit/story-content.test.ts` (append committed-asset guard)

**Interfaces:**
- Consumes: Task 4.2's script + live sites; Task 4.1's schema fields.
- Produces: shipped gallery content with visuals; a unit guard that every referenced asset file exists in `web/public/`.

- [ ] **Step 1: Write the failing tests.**

In `web/test/unit/story-content.test.ts`, add to the top imports:

```ts
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
```

and append a new describe at the end of the file:

```ts
describe('gallery assets (P3.4)', () => {
  it('at least one shipped project carries a screenshot and a logo', () => {
    expect(proof.projects.some((project) => project.image !== undefined)).toBe(true)
    expect(proof.projects.some((project) => project.logo !== undefined)).toBe(true)
  })

  it('every referenced asset is committed and matches its slug', () => {
    const publicDir = fileURLToPath(new URL('../../public', import.meta.url))
    for (const project of proof.projects) {
      if (project.image) {
        expect(project.image.src).toBe(`/shots/${project.slug}.png`)
        expect(existsSync(`${publicDir}${project.image.src}`)).toBe(true)
      }
      if (project.logo) {
        expect(project.logo.src).toBe(`/logos/${project.slug}.png`)
        expect(existsSync(`${publicDir}${project.logo.src}`)).toBe(true)
      }
    }
  })
})
```

In `web/e2e/story.spec.ts`, append after the services describe:

```ts
test.describe('proof gallery visuals (P3.4)', () => {
  test('cards with screenshots render lazy images with explicit dimensions', async ({ page }) => {
    await page.goto('/')
    const proof = page.locator('section[aria-label="Proof"]')
    await proof.scrollIntoViewIfNeeded()
    const shots = proof.locator('img[src^="/shots/"]')
    expect(await shots.count()).toBeGreaterThan(0)
    for (const shot of await shots.all()) {
      await expect(shot).toHaveAttribute('loading', 'lazy')
      await expect(shot).toHaveAttribute('width', /^\d+$/)
      await expect(shot).toHaveAttribute('height', /^\d+$/)
    }
  })
})
```

- [ ] **Step 2: Verify red.** Run: `npm run test:unit -w web -- test/unit/story-content.test.ts`
      Expected: `at least one shipped project carries a screenshot` fails (`expected false to be true`).

- [ ] **Step 3: Capture the assets (manual, network).** Run:

```bash
PATH="/opt/homebrew/opt/node@22/bin:$PATH" npm run capture:shots -w web
```

Read the output. For every `SKIPPED <slug>` or `favicon fetch failed` warning, that slug gets NO `image` (or no `logo`) block in Step 4. Then eyeball the results — delete any screenshot that captured a cookie-wall/error page and treat that slug as skipped:

```bash
open web/public/shots/ web/public/logos/
```

- [ ] **Step 4: Wire the content.** In `web/content/projects.ts`, add `image` + `logo` to every successfully captured entry. Full blocks for all 8, assuming full success — **delete the `image`/`logo` block for any slug the script skipped** (the schema keeps the card valid either way):

```ts
    {
      slug: 'extrack',
      name: 'Extrack',
      tagline: 'Money tracking that answers back',
      outcome: 'From idea to paying customers in 15 days',
      url: 'https://myextrack.com',
      kind: 'product',
      image: { src: '/shots/extrack.png', width: 1200, height: 750, alt: 'Extrack — live site' },
      logo: { src: '/logos/extrack.png', alt: 'Extrack logo' },
    },
    {
      slug: 'whycosmos',
      name: 'WhyCosmos',
      tagline: 'A learning platform built around curiosity',
      outcome: 'Lessons, progress, and payments — one place',
      url: 'https://whycosmos.com',
      kind: 'product',
      image: { src: '/shots/whycosmos.png', width: 1200, height: 750, alt: 'WhyCosmos — live site' },
      logo: { src: '/logos/whycosmos.png', alt: 'WhyCosmos logo' },
    },
    {
      slug: 'quri',
      name: 'quri',
      tagline: 'The quiet watchtower for your business numbers',
      outcome: 'Spots trouble before customers ever notice',
      url: 'https://myquri.com',
      kind: 'product',
      image: { src: '/shots/quri.png', width: 1200, height: 750, alt: 'quri — live site' },
      logo: { src: '/logos/quri.png', alt: 'quri logo' },
    },
    {
      slug: 'safewash',
      name: 'Safewash',
      tagline: 'Billing without the back-and-forth',
      outcome: 'Invoices for business customers, sent and settled on time',
      url: 'https://www.safewash.co.in',
      kind: 'product',
      image: { src: '/shots/safewash.png', width: 1200, height: 750, alt: 'Safewash — live site' },
      logo: { src: '/logos/safewash.png', alt: 'Safewash logo' },
    },
    {
      slug: 'ditch-navigation',
      name: 'Ditch Navigation',
      tagline: 'Helps mariners find safe water',
      outcome: 'Client work in the US — where the 1M+ requests a day come from',
      url: 'https://www.ditchnavigation.com',
      kind: 'client',
      image: { src: '/shots/ditch-navigation.png', width: 1200, height: 750, alt: 'Ditch Navigation — live site' },
      logo: { src: '/logos/ditch-navigation.png', alt: 'Ditch Navigation logo' },
    },
    {
      slug: 'aimers-international',
      name: 'Aimers International',
      tagline: 'The public face of an international consultancy',
      outcome: 'Client work, from first sketch to live site',
      url: 'https://www.aimersinternational.com',
      kind: 'client',
      image: { src: '/shots/aimers-international.png', width: 1200, height: 750, alt: 'Aimers International — live site' },
      logo: { src: '/logos/aimers-international.png', alt: 'Aimers International logo' },
    },
    {
      slug: 'fidus-global',
      name: 'Fidus Global',
      tagline: 'A business site that gets to the point',
      outcome: 'Client work, shipped and maintained',
      url: 'https://www.fidusglobal.in',
      kind: 'client',
      image: { src: '/shots/fidus-global.png', width: 1200, height: 750, alt: 'Fidus Global — live site' },
      logo: { src: '/logos/fidus-global.png', alt: 'Fidus Global logo' },
    },
    {
      slug: 'rtopilot',
      name: 'RTOPilot',
      tagline: 'Runs the paperwork for Australian training providers',
      outcome: 'Heavy compliance admin, handled quietly',
      url: 'https://www.rtopilot.com.au',
      kind: 'client',
      image: { src: '/shots/rtopilot.png', width: 1200, height: 750, alt: 'RTOPilot — live site' },
      logo: { src: '/logos/rtopilot.png', alt: 'RTOPilot logo' },
    },
```

(If ANY logo file looks unusable — blurry 16px ico upscale, blank square — delete that `logo` block too; spec §7 says the chip is omitted when the favicon is unusable.)

- [ ] **Step 5: Verify green — full gate.**

```bash
npm run test:unit -w web
npm run lint -w web && npm run typecheck -w web
npm run build -w web
npm run budget -w web
npm run test:e2e -w web
```

The budget must stay ≤ 160 KB (images are static assets, not JS).

- [ ] **Step 6: Commit.**

```bash
git add web/public/shots web/public/logos web/content/projects.ts \
  web/test/unit/story-content.test.ts web/e2e/story.spec.ts
git commit -m "feat(content): gallery assets captured and wired into proof cards

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

# Verification — run per phase, all green before the phase ships

From the repo root, in this order (E2E always follows a fresh build — the Playwright web server serves `web/out/` as-is):

```bash
npm run lint -w web
npm run typecheck -w web
npm run test:unit -w web
npm run build -w web
npm run budget -w web        # ≤ 160 KB gz homepage JS (P3.1 should DROP vs P2)
npm run test:e2e -w web      # desktop-1440 + mobile-375 projects
```

Phase done-criteria on top of the green gate:

- **P3.1:** `grep -rn "ScrollScene\|scroll-scene\|supportsFlags" web/components web/app web/lib web/e2e web/test` → no matches; manually scroll the dev site (`npm run dev -w web`) — the wheel is never captured, chaos/turn/storefront play themselves as they enter.
- **P3.2:** hero shows chip + "Hitesh Modi · builds these end-to-end, replies same day"; `assets/hitesh-original.jpeg` exists; `web/public/images/` contains ONLY `hitesh-96.jpg` + `hitesh-640.jpg`; `mdls -name kMDItemLatitude web/public/images/hitesh-640.jpg` → `(null)`.
- **P3.3:** three doors render between Proof and the human section; hovering a door on desktop lifts it and reveals the list; the list is simply there on mobile.
- **P3.4:** proof cards show screenshots + logo chips for captured sites; any skipped site's card looks exactly like P2's text-only card; assets are committed (`git status` clean after the commit).

Final whole-cycle check: run `review-branch` (per the repo's engineering rules) before merging the P3 branch.

---

# Spec coverage map (self-review 1: every §3/§5/§6 requirement → task)

| Spec item | Requirement | Task(s) |
|---|---|---|
| §3.1 | Delete `scroll-scene.tsx` + unit tests + `supportsFlags` workaround once unused | 1.6 |
| §3.1 | Chaos: normal flow, staggered spring tumble ~1.5 s, `whileInView` once | 1.2 |
| §3.1 | Turn: normal flow, `TypedText` progress→timer conversion, cascading event cards | 1.3 |
| §3.1 | Storefront: normal flow, auto morph ~2 s after entry, crossfade + needle sweep, once per load | 1.4 |
| §3.1 | Page length drops (~700vh desktop) | 1.5 (`MAX_PAGE_VIEWPORTS` guard) |
| §3.1 | `scroll-behavior: smooth` stays | no task — untouched (globals.css lines 26-34) |
| §3.1 | Reduced motion: static/simple-fade variants (fallbacks promoted); mobile gets time-driven animations | 1.2–1.4 (MotionConfig + explicit gates), 1.5 (E2E) |
| §3.2 | Hero photo chip ~48px + "Hitesh Modi · …" line under subhead; headline/badge/CTA unchanged | 2.1 |
| §3.2 | Photo processed once (EXIF stripped, resized, small + 640 variants committed; original out of served bundle) | 2.1 Steps 1-2 |
| §3.3 | `services.tsx` renders `content/services.ts` via props; 3 glass doors; inline hand-rolled SVG icons; what-you-get list; timeline; Book-a-call CTA → `#finale`; hover lift/reveal, revealed by default on touch/reduced-motion; no prices/jargon | 3.1, 3.2 |
| §3.4 | `human.tsx` — "One engineer, no circus", tilted glass photo (640), story, native `<details>` nerdy bits; `human` content module + `HumanSchema` (name, story paragraphs, nerdy bits, photo path+alt) | 2.2, 2.3 |
| §3.5 | `ProjectSchema` optional `image` (+dimensions+alt) and `logo` (+alt) | 4.1 |
| §3.5 | `capture-shots.ts`: Playwright visits each URL, 1200×750 screenshot → `public/shots/`, favicon → `public/logos/`, manual `npm run capture:shots`, assets committed, per-site skip-with-warning | 4.2, 4.4 |
| §3.5 | Proof cards: tilted screenshot header, logo chip beside name, `loading="lazy"` + explicit width/height, text-only fallback | 4.3 |
| §3.5 | Safewash URL added, stale "no public site" comment removed | 1.1 |
| §3.6 | Page order Hero→Chaos→Turn→Storefront→Proof→Services→Human→Finale | 2.3 (Human before Finale), 3.2 (Services before Human) |
| §5 | Four independently shippable phases, tests green per phase | plan structure + per-phase Verification |
| §6 P3.1 | E2E: zero `.sticky` in `main` @1440+375, motion + reduced; page height < 8×viewport (desktop) | 1.5 |
| §6 P3.1 | E2E: chaos cards / turn bubbles / storefront after-panel reach opacity 1 after scroll-into-view, no further scrolling | 1.5 |
| §6 P3.1 | E2E: reduced motion settles all copy at opacity 1 | 1.5 |
| §6 P3.1 | Unit: TypedText types over time (fake timers); full string immediately under reduced motion | 1.3 |
| §6 P3.1 | Unit: Safewash entry has https URL | 1.1 |
| §6 P3.1 | Old pin assertions (section height > 2×viewport, scrub start/end opacity) deleted/rewritten | 1.5 |
| §6 P3.2 | E2E: hero renders "Hitesh Modi" + photo img with non-empty alt | 2.4 |
| §6 P3.2 | E2E: human section renders heading, photo, `<details>` opens on click | 2.4 |
| §6 P3.2 | Unit: HumanSchema rejects missing name/story/photo; content module parses | 2.2 |
| §6 P3.3 | E2E: exactly 3 doors, each heading + timeline + CTA→`#finale`; no price strings | 3.2 |
| §6 P3.3 | Unit: services renders all fields from a fixture; icons aria-hidden | 3.1 |
| §6 P3.4 | Unit: ProjectSchema with/without image+logo; rejects malformed paths; text-only fallback renders | 4.1, 4.3 |
| §6 P3.4 | E2E: `img[loading="lazy"]` with width+height; Safewash card links to https://www.safewash.co.in | 4.4 (lazy imgs), 1.5 (Safewash link — lands earlier, stays green) |
| §7 | Fast-scroller risk → `once: true` + conservative `amount` margins, content legible mid-animation | 1.2–1.4 |
| §7 | Unusable favicon → logo optional, chip omitted | 4.1, 4.4 Step 4 note |
| §8 | Out of scope: cal.com embed, lead-form, testimonials, dark mode, P4/P5 | no tasks touch these |

# Self-review 2: placeholder scan

No "TBD", "add appropriate", "similar to Task N", or elided code remains: every new file appears in full; every modification names its file, anchor lines, and exact replacement text; every test shows complete code; every command is copy-pasteable. The only intentionally conditional content is Task 4.4 Step 4 (image/logo blocks are deleted per skipped capture — an explicit, testable rule, not a placeholder).

# Self-review 3: name/type consistency ledger

- Schema fields: `HeroContentSchema.identity.{name,line,photo.{src,alt}}` (T2.1 schema = T2.1 content = T2.1 hero.tsx = T2.4 e2e) · `HumanSchema.{heading,name,story,nerdyBits.{label,items},photo.{src,alt,width,height}}` (T2.2 = T2.3 human.tsx = T2.4 e2e) · `ServicesIntroSchema.{heading,lede}` (T3.1 = T3.2) · `ProjectSchema.image.{src,width,height,alt}` / `ProjectSchema.logo.{src,alt}` (T4.1 = T4.3 proof.tsx = T4.4 content/e2e).
- Component props: `ChaosProps{chaos}` / `TurnProps{turn,cards}` / `StorefrontProps{storefront}` unchanged from P2 (page.tsx untouched in P3.1) · `TypedTextProps{text,play,reducedMotion,startDelayMs?,msPerChar?}` (T1.3 component = T1.3 tests) · `HumanProps{human}` (T2.3) · `ServicesProps{intro,services}` (T3.1 = T3.2 page wiring) · `ProofProps{proof,ticker}` unchanged (T4.3 reads optional fields off `project`).
- Section aria-labels (page.test + story.spec must always agree): `Intro, The chaos, The turn, The storefront, Proof, Services, The human, Contact` — updated in lockstep at T2.3/T2.4 (add `The human`) and T3.2 (add `Services`).
- Content exports: `profile` (extended T2.1) · `human` (T2.2) · `services` + `servicesIntro` (T3.1) · `proof` (T1.1, T4.4) · script exports `TARGETS`, `VIEWPORT`, `resolveIconUrl` (T4.2 script = T4.2 tests).
- Asset paths: `/images/hitesh-96.jpg` (T2.1 sips output = profile.ts = hero test) · `/images/hitesh-640.jpg` (T2.1 output = human.ts = human test) · `/shots/<slug>.png` + `/logos/<slug>.png` (T4.2 script output = T4.4 content = T4.4 unit guard).
- E2E anchors: `data-morph="before"/"after"` (T1.4 component = T1.5 e2e) · TiltCard xpath depth `div[3]` until T4.3 flips both occurrences to `div[4]` alongside the wrapper that causes it.

# Spec ambiguities resolved (decisions baked into tasks above)

1. **Page-height budget vs. new sections.** Spec §6 P3.1 fixes < 8×viewport, but §3.6 adds two ~1-viewport content sections later. Resolution: `MAX_PAGE_VIEWPORTS` constant with a policy comment — 8 in P3.1, 9 after Human (T2.4), 10 after Services (T3.2). The guard targets pinned runway, not content.
2. **"Scene reaches opacity 1 after scroll-into-view" on mobile.** At 375px the sections are taller than the viewport, so a single scroll can't put late elements in view. Resolution: time-driven-entry proofs are desktop-scoped; the mobile-375 project keeps its own per-element readability pass (spec's intent — no scrubbing — is asserted on both via the sticky-count and mobile describes).
3. **Photo format.** Spec §3.2 says webp; the repo preference is sips-only. Resolution: JPEG via `sips` with a PNG round-trip as the EXIF strip (PNG carries no EXIF), plus an `mdls` GPS check and a visual orientation check. `cwebp` exists at `/opt/homebrew/bin/cwebp` if webp is later wanted — not required.
4. **Original photo in `public/`.** Spec requires the 858 KB EXIF-intact original out of the served bundle, but it currently lives in `web/public/images/`. Resolution: `git mv` to `assets/hitesh-original.jpeg` (kept in git for re-processing) in T2.1.
5. **Turn desktop layout.** "Promote the fallback" (single column) conflicts with the scene-entry E2E (closer must be reachable without extra scrolling on desktop). Resolution: promoted the fallback's *mechanics* (whileInView list) into the scene's 2-column desktop grid (stack beside chat) so the section fits ~1 viewport; mobile stacks vertically.
6. **Storefront reduced motion vs. crossfade.** A stacked crossfade hides the "before" panel from reduced-motion visitors. Resolution: motion path = stacked auto-crossfade (spec §3.1); reduced-motion path = the promoted side-by-side labelled comparison (spec §3.1's "today's fallbacks, promoted"), gated by `useMediaQuery`.
7. **Services section heading.** Spec names the three doors but no section header, and components must not hardcode prose. Resolution: new `ServicesIntroSchema` + `servicesIntro` export in `content/services.ts`.
8. **capture-shots imports.** `--experimental-strip-types` can't resolve the extensionless import chain in `content/projects.ts`, so the script carries a standalone `TARGETS` list — pinned to `content/projects.ts` by a unit test (same pattern and rationale as `fetch-stats.ts`).
9. **Node version for capture:shots.** Local default Node is 20.19.5 (no strip-types). Resolution: script requires ≥ 22.6; the exact local invocation uses Homebrew's `node@22` (`PATH="/opt/homebrew/opt/node@22/bin:$PATH" npm run capture:shots -w web`). CI never runs it.
10. **Favicon file type.** Spec says save as `<slug>.png` regardless of what the site serves. Resolution: byte-copy to `.png` per spec; unusable results (blurry ico, blank) get their `logo` block deleted per §7's "chip omitted when the favicon is unusable".
11. **Reduced-motion gating hook.** motion's `useReducedMotion` caches its first matchMedia read (documented jsdom hazard in `hero.test.tsx`). Resolution: all NEW explicit gates use `useMediaQuery('(prefers-reduced-motion: reduce)')`; `TypedText` takes `reducedMotion` as a prop so unit tests inject it directly. Existing primitives (TiltCard, CountUp) are untouched.
12. **Safewash E2E timing.** Spec §6 lists the Safewash-link assertion under P3.4, but the URL lands in P3.1. Resolution: asserted from T1.5 onward (it must stay green through P3.4).
