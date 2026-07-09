# Freelance Portfolio P2 — The Story (Beats 2–5 + Build-Time Stats) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship spec §5 phase 2 — the scroll story's Beats 2–5 (chaos, turn, storefront, proof gallery + results ticker) plus the build-time stats pipeline — on the live P1 foundation, keeping the site a single static export within the JS budget.

**Architecture:** Each beat is a self-contained client component in `components/beats/` fed typed content via props from Zod-validated `content/*.ts` modules. Scroll-scrubbed scenes (beats 2–4) ride a new `ScrollScene` primitive (sticky pinning + `useScroll`) that renders a fully readable static fallback on the server, under `prefers-reduced-motion`, and below 768 px (the mobile-light variant). Beat 5 is a non-pinned gallery (tilt + parallax + count-up ticker). Ticker numbers come from `content/stats.json`, refreshed pre-build by `scripts/fetch-stats.ts` which can never fail the build.

**Tech Stack:** Next.js 15 (App Router, `output: 'export'`), TypeScript strict, Tailwind CSS 4 tokens from `web/app/globals.css`, Motion (`motion/react` — already a dependency), Zod 4, Vitest + Testing Library, Playwright. **Zero new dependencies.**

## Global Constraints

Every task's requirements implicitly include all of these.

- **JS budget:** spec §4 sets ~150 KB gz. Measured baseline (2026-07-10, commit `aa79f3e`, `next build` output): **140.8 KB gz of homepage-executed JS** — the module scripts referenced by `out/index.html`, excluding the `noModule` polyfills chunk (38.6 KB) that modern browsers never execute. With polyfills the total is 179.4 KB. P2's headroom is **~9 KB**, so: reuse the existing `motion` dep for scroll scenes (`useScroll`/`useTransform` scrub — the spring/animation engine is already in the P1 bundle, so the increment is small); prefer CSS/Tailwind keyframes + IntersectionObserver where scrub isn't needed; **ZERO new runtime dependencies**; no images beyond inline SVG/CSS shapes — chaos cards, browser mocks, gauges are styled divs, not images. Task 11 gates on the measured number; the budget-decision ladder lives in `scripts/measure-bundle.mjs` (Task 1).
- **Copy:** warm, plain-spoken, ZERO dev jargon (no "AI agent", no "MCP", no "serverless"). All copy in this plan is final and verbatim — content modules carry it, components never hardcode prose. Ticker numbers come from the stats module, never hardcoded in components.
- **Content layer:** all content in `web/content/*.ts` Zod modules (extend `content/schema.ts`). Components are pure — content in via props only.
- **Component layout:** each beat = one self-contained component in `web/components/beats/`; **beats never import beats** (the page passes shared data down); shared primitives live in `web/components/ui/` (this phase builds exactly the four the spec names and P2 uses: `ScrollScene`, `GlassCard`, `CountUp`, `TiltCard` — YAGNI, nothing more).
- **Palette story (spec §2):** the chaos scene uses hot alert hues `#FFA94D` / `#FF6B6B` (already tokens: `--color-chaos-amber`, `--color-chaos-red`); the "handled" scene resolves them into the calm pastels (`--color-wash-lavender` `#F5F3FF`, `--color-wash-sky` `#EEF7FF`, `--color-wash-blush` `#FDF2F8`). WCAG AA: body text is always `text-ink`/`text-muted`; violet `#7C5CFF` on white only for large text/decoration.
- **Motion policy:** every scene ships a reduced-motion variant AND a mobile-light variant (spec §4). The page-level `MotionConfig reducedMotion="user"` strips transform animations automatically, but scroll-scrub motion values are NOT auto-stripped — `ScrollScene` therefore gates scrubbing explicitly and renders the static fallback. Scenes must be FULLY READABLE with no scroll-scrubbing: content visible, no pinned emptiness.
- **Scroll scenes:** sticky pinning + `useScroll` scrub per spec §4. The page stays a single static export — no route changes, no server features.
- **Testing:** TDD every task. Vitest unit for content/schema/component render (currently 21 green); Playwright E2E extended with new describe blocks (currently 16 green — they must stay green). E2E must assert beats 2–5 content visible under `reducedMotion: 'reduce'` AND at 375 px.
- **Build-time stats (spec §4):** `web/scripts/fetch-stats.ts` runs pre-build and writes `web/content/stats.json` (committed fallback). The build NEVER fails offline or without a token; the script refreshes numbers when `GITHUB_TOKEN`/`gh` is available, else leaves committed values.
- **Commits:** conventional commits, one commit minimum per task, each ending with the trailer `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.
- **Runtime:** Node 22 in CI / v20 local — npm engine warnings locally are noise, ignore them. Run all commands from the repo root `/Users/hiteshmodi/Documents/GitHub/Portfolio`.
- **Never touch `infra/` or `scripts/deploy-prod.sh`.** (Editing `.github/workflows/deploy.yml` is allowed and required in Tasks 1 & 7.)

## File Structure

```
web/
  scripts/
    measure-bundle.mjs        CREATE  T1  homepage JS budget gate (zero deps, plain Node)
    fetch-stats.ts            CREATE  T7  pre-build stats refresh (never fails the build)
  content/
    schema.ts                 MODIFY  T2, T7  append Story/Project/Proof, then Stats/Ticker schemas
    story.ts                  CREATE  T2  beats 2–4 copy (chaos cards, 2:14 AM turn, storefront)
    projects.ts               CREATE  T2  beat 5 gallery: 4 products + 4 client-work entries (slot mechanism in use)
    stats.json                CREATE  T7  committed fallback numbers
    stats.ts                  CREATE  T7  Zod-validated read of stats.json
    ticker.ts                 CREATE  T7  the three ticker items (values from stats, labels = copy)
  lib/
    use-media.ts              CREATE  T3  SSR-safe matchMedia hook (shared by ScrollScene & Proof)
  components/ui/
    glass-card.tsx            CREATE  T3  soft glass card (spec §2 texture)
    count-up.tsx              CREATE  T3  counts up on entry; static-final-value fallback
    tilt-card.tsx             CREATE  T3  hover tilt, mouse-only, reduced-motion off
    scroll-scene.tsx          CREATE  T3  sticky pin + scrub with readable static fallback
  components/beats/
    chaos.tsx                 CREATE  T4  beat 2
    turn.tsx                  CREATE  T5  beat 3
    storefront.tsx            CREATE  T6  beat 4
    proof.tsx                 CREATE  T8  beat 5
  app/
    globals.css               MODIFY  T4 (.chaos-wash), T5 (.calm-wash)
    page.tsx                  MODIFY  T9  wire hero → chaos → turn → storefront → proof → finale
  test/
    setup.ts                  MODIFY  T3  add wide-viewport toggle + ResizeObserver stub
    unit/story-content.test.ts    CREATE T2
    unit/primitives.test.tsx      CREATE T3
    unit/scroll-scene.test.tsx    CREATE T3
    unit/scroll-scene-reduced.test.tsx CREATE T3
    unit/chaos.test.tsx           CREATE T4
    unit/turn.test.tsx            CREATE T5
    unit/storefront.test.tsx      CREATE T6
    unit/stats.test.ts            CREATE T7
    unit/proof.test.tsx           CREATE T8
    unit/page.test.tsx            CREATE T9
  e2e/
    story.spec.ts             CREATE  T10
  package.json                MODIFY  T1 (budget script), T7 (prebuild script)
.github/workflows/deploy.yml  MODIFY  T1 (budget gate step), T7 (GITHUB_TOKEN env on builds)
```

Unit-test running total per task: T2 → 31, T3 → 40, T4 → 43, T5 → 47, T6 → 51, T7 → 62, T8 → 67, T9 → 68. E2E after T10: 25 passed, 3 skipped (per-project skips).

---

### Task 1: Budget baseline + gate (`measure-bundle.mjs`)

**Files:**
- Create: `web/scripts/measure-bundle.mjs`
- Modify: `web/package.json` (add `budget` script)
- Modify: `.github/workflows/deploy.yml` (add budget step to `build-test` job)

**Interfaces:**
- Consumes: `web/out/index.html` produced by `npm run build -w web`.
- Produces: npm script `npm run budget -w web` — prints per-chunk gz sizes and `TOTAL: <n> KB gz (budget 150 KB) — OK|OVER BUDGET`; exits 1 when over. Task 11 gates on this command. Env override `BUDGET_KB` exists for experimentation only — CI always runs the committed default.

**Budget decision (documented here and in the script header):** the budget stays at the spec's **150 KB gz of homepage-executed JS** (module scripts in `out/index.html`, excluding the `noModule` polyfills chunk). P1 baseline is 140.8 KB. Expected P2 addition is ~6–10 KB (first-party beat/primitive/content code; the motion scroll utilities are mostly already bundled), which fits but is tight. Pre-approved fallback ladder if Task 11 measures over 150:
1. **150–158 KB:** raise `BUDGET_KB` default to 160 in one commit whose message pastes the measured per-chunk table — motion's scroll/spring code demonstrably doesn't tree-shake smaller, and cutting spec-mandated scrub scenes is worse than an honest +10.
2. **> 158 KB:** do NOT raise further. Cut in this order: (a) drop `TypedText` from Beat 3 (bubbles pop instead of type), (b) replace Beat 4's scrubbed morph with a CSS crossfade driven by `whileInView`, (c) re-measure after each cut.

- [ ] **Step 1: Prove the gate doesn't exist yet**

Run: `npm run budget -w web`
Expected: FAIL — `npm error Missing script: "budget"`

- [ ] **Step 2: Create `web/scripts/measure-bundle.mjs`**

```js
// Homepage JS budget gate.
//
// Measures the JS a modern browser actually executes on `/`: every
// <script src> referenced by out/index.html EXCEPT the `noModule` polyfills
// chunk (modern browsers skip noModule scripts). Gzips each file and totals.
//
// BUDGET DECISION (2026-07-10): budget = the spec's ~150 KB gz.
// P1 baseline (commit aa79f3e): 140.8 KB gz → P2 headroom ~9 KB, which is why
// P2 adds ZERO runtime dependencies and reuses the motion engine already in
// the bundle. Pre-approved fallback if P2 lands at 150–158 KB: raise
// BUDGET_KB to 160 in a commit that pastes the measured table (see
// docs/superpowers/plans/2026-07-10-freelance-portfolio-p2.md, Task 1).
// Above 158 KB: cut scene code (TypedText first), never raise again.

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'

const BUDGET_KB = Number(process.env.BUDGET_KB ?? 150)
const outDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'out')

const html = readFileSync(path.join(outDir, 'index.html'), 'utf8')
const scriptTags = html.match(/<script[^>]+src="[^"]+\.js"[^>]*>/g) ?? []
const files = [
  ...new Set(
    scriptTags
      .filter((tag) => !/nomodule/i.test(tag))
      .map((tag) => tag.match(/src="([^"]+)"/)?.[1])
      .filter((src) => src !== undefined),
  ),
]

let total = 0
for (const file of files) {
  const size = gzipSync(readFileSync(path.join(outDir, file))).length
  total += size
  console.log(`${(size / 1024).toFixed(1).padStart(7)} KB  ${file}`)
}
const totalKb = total / 1024
const over = totalKb > BUDGET_KB
console.log(`TOTAL: ${totalKb.toFixed(1)} KB gz (budget ${BUDGET_KB} KB) — ${over ? 'OVER BUDGET' : 'OK'}`)
process.exit(over ? 1 : 0)
```

- [ ] **Step 3: Add the npm script**

In `web/package.json`, add to `"scripts"` (after `"build"`):

```json
    "budget": "node scripts/measure-bundle.mjs",
```

- [ ] **Step 4: Build and record the baseline**

Run: `npm run build -w web && npm run budget -w web`
Expected: a table of ~6 chunk lines (framework, main, app/page, two shared chunks, webpack — NO polyfills line) ending with `TOTAL: 140.8 KB gz (budget 150 KB) — OK` (exact bytes may drift ±2 KB with the lockfile's next version; the line MUST end with `— OK` and the total MUST be ≤ 150).
Then run: `echo $?` → Expected: `0`

- [ ] **Step 5: Wire the gate into CI**

In `.github/workflows/deploy.yml`, `build-test` job, insert directly after the `- run: npm run build -w web` line:

```yaml
      - run: npm run budget -w web
```

- [ ] **Step 6: Commit**

```bash
git add web/scripts/measure-bundle.mjs web/package.json .github/workflows/deploy.yml
git commit -m "chore(web): homepage JS budget gate — P1 baseline 140.8 KB gz vs 150 KB budget

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: Content schemas + story & proof copy

**Files:**
- Modify: `web/content/schema.ts` (append after the existing `ServicesSchema` block)
- Create: `web/content/story.ts`
- Create: `web/content/projects.ts`
- Test: `web/test/unit/story-content.test.ts`

**Interfaces:**
- Consumes: existing `httpsUrl` helper in `schema.ts` (module-private — the new `ProjectSchema` lives in the same file and reuses it).
- Produces (later tasks import these exact names):
  - `schema.ts`: `ChaosCardSchema`, `TurnEventSchema`, `StorySchema`, `ProjectSchema`, `ProjectsSchema`, `ProofSchema`; types `StoryContent`, `Project`, `ProofContent`.
  - `story.ts`: `export const story: StoryContent` (parsed).
  - `projects.ts`: `export const proof: ProofContent` (parsed).
  - Component prop shapes used later: `StoryContent['chaos']`, `StoryContent['turn']`, `StoryContent['storefront']`, `ProofContent`.

- [ ] **Step 1: Write the failing tests** — create `web/test/unit/story-content.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import {
  ProjectSchema,
  ProjectsSchema,
  StorySchema,
} from '../../content/schema'
import { proof } from '../../content/projects'
import { story } from '../../content/story'

/** Minimal valid story used as the mutation base for rejection tests. */
const validStory = {
  chaos: {
    heading: 'Your week right now',
    lede: "Running the business is the part you love. It's everything else that piles up.",
    cards: [
      { id: 'a', kind: 'message', hue: 'amber', title: 'A', body: 'a' },
      { id: 'b', kind: 'invoice', hue: 'red', title: 'B', body: 'b' },
      { id: 'c', kind: 'booking', hue: 'red', title: 'C', body: 'c' },
      { id: 'd', kind: 'email', hue: 'amber', title: 'D', body: 'd' },
    ],
  },
  turn: {
    heading: 'Then, quietly, it all gets handled',
    lede: 'While you were asleep:',
    time: '2:14 AM',
    closer: 'You find out over coffee.',
    events: [
      { id: 'one', kind: 'customer', wash: 'sky', text: 'hi' },
      { id: 'two', kind: 'helper', wash: 'lavender', text: 'hello' },
      { id: 'three', kind: 'event', wash: 'blush', text: 'done' },
    ],
  },
  storefront: {
    heading: 'And it looks gorgeous doing it',
    punchline: 'Your website should be your best salesperson.',
    before: { title: 'WELCOME', nav: ['Home', 'About', 'Contact'], line: 'Est. 2009.' },
    after: { title: 'Book Saturday', line: 'Under a minute.', cta: 'Book' },
    metric: { label: 'enquiries this week', from: 2, to: 11 },
  },
}

describe('StorySchema', () => {
  it('accepts a valid story', () => {
    expect(StorySchema.safeParse(validStory).success).toBe(true)
  })

  it('rejects a chaos scene with fewer than 4 cards', () => {
    const bad = { ...validStory, chaos: { ...validStory.chaos, cards: validStory.chaos.cards.slice(0, 3) } }
    expect(StorySchema.safeParse(bad).success).toBe(false)
  })

  it('rejects a chaos card with an unknown hue', () => {
    const cards = [...validStory.chaos.cards]
    cards[0] = { ...cards[0], hue: 'green' }
    const bad = { ...validStory, chaos: { ...validStory.chaos, cards } }
    expect(StorySchema.safeParse(bad).success).toBe(false)
  })

  it('rejects a turn time that is not a clock time', () => {
    const bad = { ...validStory, turn: { ...validStory.turn, time: 'late at night' } }
    expect(StorySchema.safeParse(bad).success).toBe(false)
  })

  it('rejects an empty storefront punchline', () => {
    const bad = { ...validStory, storefront: { ...validStory.storefront, punchline: '' } }
    expect(StorySchema.safeParse(bad).success).toBe(false)
  })

  it('rejects a storefront metric that does not improve', () => {
    const bad = {
      ...validStory,
      storefront: { ...validStory.storefront, metric: { label: 'enquiries this week', from: 11, to: 2 } },
    }
    expect(StorySchema.safeParse(bad).success).toBe(false)
  })
})

describe('ProjectSchema / ProjectsSchema', () => {
  it('rejects a non-https project url', () => {
    const bad = {
      slug: 'extrack',
      name: 'Extrack',
      tagline: 't',
      outcome: 'o',
      url: 'http://myextrack.com',
      kind: 'product',
    }
    expect(ProjectSchema.safeParse(bad).success).toBe(false)
  })

  it('ships four client-work entries, each with a live https url (the client-slot mechanism, in use)', () => {
    expect(ProjectsSchema.safeParse(proof.projects).success).toBe(true)
    const clients = proof.projects.filter((project) => project.kind === 'client')
    expect(clients.map((project) => project.name)).toEqual([
      'Ditch Navigation',
      'Aimers International',
      'Fidus Global',
      'RTOPilot',
    ])
    for (const client of clients) {
      expect(client.url?.startsWith('https://')).toBe(true)
    }
  })
})

describe('shipped story content', () => {
  it('carries the approved beat 2–4 copy verbatim', () => {
    expect(story.chaos.heading).toBe('Your week right now')
    expect(story.chaos.cards.length).toBeGreaterThanOrEqual(4)
    expect(story.chaos.cards.map((card) => card.hue).sort()).toContain('red')
    expect(story.turn.heading).toBe('Then, quietly, it all gets handled')
    expect(story.turn.time).toBe('2:14 AM')
    expect(story.turn.events.some((event) => event.meta === 'Answered in 4 seconds')).toBe(true)
    expect(story.storefront.punchline).toBe('Your website should be your best salesperson.')
  })

  it('ships the eight proof projects with the verified live urls', () => {
    expect(proof.heading).toBe('Built before. Shipped before.')
    expect(proof.projects.map((project) => project.name)).toEqual([
      'Extrack',
      'WhyCosmos',
      'quri',
      'Safewash',
      'Ditch Navigation',
      'Aimers International',
      'Fidus Global',
      'RTOPilot',
    ])
    const extrack = proof.projects[0]
    expect(extrack.outcome).toBe('From idea to paying customers in 15 days')
    expect(extrack.url).toBe('https://myextrack.com')
    expect(proof.projects.find((project) => project.slug === 'quri')?.url).toBe(
      'https://myquri.com',
    )
    // Safewash is real work with no public site — the only card without a link
    expect(proof.projects.filter((project) => project.url === undefined)).toHaveLength(1)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test:unit -w web`
Expected: FAIL — the new file errors with a module-resolution failure (`Cannot find module '../../content/story'` / missing exports `StorySchema` from `../../content/schema`). The existing 21 tests still pass.

- [ ] **Step 3: Append the P2 schemas to `web/content/schema.ts`**

Append after the `ServicesSchema` declaration (keep the existing type exports at the bottom; add the new ones there too):

```ts
/* ——— P2: story beats 2–4 (spec §3) ——— */

export const ChaosCardSchema = z.object({
  id: z.string().regex(/^[a-z][a-z0-9-]*$/),
  kind: z.enum(['message', 'invoice', 'booking', 'email', 'note']),
  title: z.string().min(1),
  body: z.string().min(1),
  meta: z.string().min(1).optional(),
  /** Hot alert hue (spec §2): the chaos scene renders #FFA94D / #FF6B6B tints. */
  hue: z.enum(['amber', 'red']),
})

export const TurnEventSchema = z.object({
  id: z.string().regex(/^[a-z][a-z0-9-]*$/),
  kind: z.enum(['customer', 'helper', 'event']),
  text: z.string().min(1),
  meta: z.string().min(1).optional(),
  /** Calm pastel the chaos resolves into (spec §2 palette story). */
  wash: z.enum(['lavender', 'sky', 'blush']),
})

export const StorySchema = z.object({
  chaos: z.object({
    heading: z.string().min(1),
    lede: z.string().min(1),
    cards: z.array(ChaosCardSchema).min(4),
  }),
  turn: z.object({
    heading: z.string().min(1),
    lede: z.string().min(1),
    /** Clock time like "2:14 AM" — the story's night-shift moment. */
    time: z.string().regex(/^(1[0-2]|[1-9]):[0-5]\d (AM|PM)$/),
    events: z.array(TurnEventSchema).min(3),
    closer: z.string().min(1),
  }),
  storefront: z.object({
    heading: z.string().min(1),
    punchline: z.string().min(1),
    before: z.object({
      title: z.string().min(1),
      nav: z.array(z.string().min(1)).min(3),
      line: z.string().min(1),
    }),
    after: z.object({
      title: z.string().min(1),
      line: z.string().min(1),
      cta: z.string().min(1),
    }),
    metric: z
      .object({
        label: z.string().min(1),
        from: z.number().int().nonnegative(),
        to: z.number().int().positive(),
      })
      .refine((metric) => metric.to > metric.from, {
        message: 'storefront metric must improve (to > from)',
      }),
  }),
})

/* ——— P2: beat 5 proof gallery (spec §3) ——— */

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
})

export const ProjectsSchema = z.array(ProjectSchema).min(1)

export const ProofSchema = z.object({
  heading: z.string().min(1),
  lede: z.string().min(1),
  projects: ProjectsSchema,
})

export type StoryContent = z.infer<typeof StorySchema>
export type Project = z.infer<typeof ProjectSchema>
export type ProofContent = z.infer<typeof ProofSchema>
```

- [ ] **Step 4: Create `web/content/story.ts`** (all copy final — beats 2–4 ARE the story):

```ts
import { StorySchema, type StoryContent } from './schema'

export const story: StoryContent = StorySchema.parse({
  chaos: {
    heading: 'Your week right now',
    lede: "Running the business is the part you love. It's everything else that piles up.",
    cards: [
      {
        id: 'whatsapp',
        kind: 'message',
        hue: 'amber',
        title: 'WhatsApp · 11:47 PM',
        body: '“Hi! Do you have anything free this Saturday?”',
        meta: 'Still unanswered',
      },
      {
        id: 'invoice',
        kind: 'invoice',
        hue: 'red',
        title: 'Invoice #114',
        body: '$1,850 — three weeks overdue',
        meta: 'You keep meaning to chase it',
      },
      {
        id: 'booking',
        kind: 'booking',
        hue: 'red',
        title: 'Missed call · new customer',
        body: 'They wanted Saturday. They booked someone else.',
        meta: 'Yesterday, 4:12 PM',
      },
      {
        id: 'email',
        kind: 'email',
        hue: 'amber',
        title: 'Inbox',
        body: '47 unread. Six of them matter. Which six?',
        meta: 'Growing since Tuesday',
      },
      {
        id: 'note-tiles',
        kind: 'note',
        hue: 'amber',
        title: 'Note to self',
        body: 'Call the tile guy back. TODAY.',
      },
      {
        id: 'note-website',
        kind: 'note',
        hue: 'red',
        title: 'Note to self',
        body: 'Fix the website?? (someday)',
      },
    ],
  },
  turn: {
    heading: 'Then, quietly, it all gets handled',
    lede: 'While you were asleep:',
    time: '2:14 AM',
    closer: 'You find out over coffee. Everything just… happened.',
    events: [
      {
        id: 'customer-message',
        kind: 'customer',
        wash: 'sky',
        text: '“Hey — do you have anything free this Saturday?”',
        meta: '2:14 AM',
      },
      {
        id: 'helper-reply',
        kind: 'helper',
        wash: 'lavender',
        text: '“We do — 10:30 on Saturday just opened up. Want me to book you in?”',
        meta: 'Answered in 4 seconds',
      },
      {
        id: 'booking-confirmed',
        kind: 'event',
        wash: 'sky',
        text: 'Booking confirmed — Saturday, 10:30 AM',
      },
      {
        id: 'invoice-sent',
        kind: 'event',
        wash: 'lavender',
        text: 'Invoice sent, with a pay-now link',
      },
      {
        id: 'follow-up',
        kind: 'event',
        wash: 'blush',
        text: 'Follow-up scheduled for Tuesday morning',
      },
    ],
  },
  storefront: {
    heading: 'And it looks gorgeous doing it',
    punchline: 'Your website should be your best salesperson.',
    before: {
      title: 'WELCOME TO OUR WEBSITE',
      nav: ['Home', 'About Us', 'Services', 'Gallery', 'Contact', 'FAQ'],
      line: 'We are committed to quality and service since 2009.',
    },
    after: {
      title: 'Saturday has three openings left.',
      line: 'Pick a time — it takes under a minute.',
      cta: 'Book Saturday',
    },
    metric: { label: 'enquiries this week', from: 2, to: 11 },
  },
})
```

- [ ] **Step 5: Create `web/content/projects.ts`**:

```ts
import { ProofSchema, type ProofContent } from './schema'

/**
 * Beat 5 — "Built before. Shipped before."
 *
 * CLIENT-URL SLOT MECHANISM (in use): `kind: 'client'` entries are shipped
 * client work — all URLs verified live 2026-07-10. Append future client
 * sites the same way; the gallery renders whatever validates, no component
 * changes needed. Safewash is real work with no public site, so it ships as
 * the one card without a link.
 *
 * Ditch Navigation is where the ticker's "1M+ requests a day" figure comes
 * from — the canonical number lives in content/stats.json (manual block);
 * keep that outcome line in sync with it.
 */
export const proof: ProofContent = ProofSchema.parse({
  heading: 'Built before. Shipped before.',
  lede: 'Real products with real customers — built end-to-end, not mocked up.',
  projects: [
    {
      slug: 'extrack',
      name: 'Extrack',
      tagline: 'Money tracking that answers back',
      outcome: 'From idea to paying customers in 15 days',
      url: 'https://myextrack.com',
      kind: 'product',
    },
    {
      slug: 'whycosmos',
      name: 'WhyCosmos',
      tagline: 'A learning platform built around curiosity',
      outcome: 'Lessons, progress, and payments — one place',
      url: 'https://whycosmos.com',
      kind: 'product',
    },
    {
      slug: 'quri',
      name: 'quri',
      tagline: 'The quiet watchtower for your business numbers',
      outcome: 'Spots trouble before customers ever notice',
      url: 'https://myquri.com',
      kind: 'product',
    },
    {
      slug: 'safewash',
      name: 'Safewash',
      tagline: 'Billing without the back-and-forth',
      outcome: 'Invoices for business customers, sent and settled on time',
      kind: 'product',
    },
    {
      slug: 'ditch-navigation',
      name: 'Ditch Navigation',
      tagline: 'Helps mariners find safe water',
      outcome: 'Client work in the US — where the 1M+ requests a day come from',
      url: 'https://www.ditchnavigation.com',
      kind: 'client',
    },
    {
      slug: 'aimers-international',
      name: 'Aimers International',
      tagline: 'The public face of an international consultancy',
      outcome: 'Client work, from first sketch to live site',
      url: 'https://www.aimersinternational.com',
      kind: 'client',
    },
    {
      slug: 'fidus-global',
      name: 'Fidus Global',
      tagline: 'A business site that gets to the point',
      outcome: 'Client work, shipped and maintained',
      url: 'https://www.fidusglobal.in',
      kind: 'client',
    },
    {
      slug: 'rtopilot',
      name: 'RTOPilot',
      tagline: 'Runs the paperwork for Australian training providers',
      outcome: 'Heavy compliance admin, handled quietly',
      url: 'https://www.rtopilot.com.au',
      kind: 'client',
    },
  ],
})
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npm run test:unit -w web`
Expected: PASS — `Tests  31 passed` (21 existing + 10 new).

- [ ] **Step 7: Typecheck + lint**

Run: `npm run typecheck -w web && npm run lint -w web`
Expected: both exit 0, no output errors.

- [ ] **Step 8: Commit**

```bash
git add web/content/schema.ts web/content/story.ts web/content/projects.ts web/test/unit/story-content.test.ts
git commit -m "feat(content): story beats 2-4 and proof gallery content with Zod schemas

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: Shared primitives — `ScrollScene`, `GlassCard`, `CountUp`, `TiltCard`

**Files:**
- Create: `web/lib/use-media.ts`
- Create: `web/components/ui/glass-card.tsx`
- Create: `web/components/ui/count-up.tsx`
- Create: `web/components/ui/tilt-card.tsx`
- Create: `web/components/ui/scroll-scene.tsx`
- Modify: `web/test/setup.ts` (full replacement shown below — adds wide-viewport toggle + ResizeObserver stub)
- Test: `web/test/unit/primitives.test.tsx`, `web/test/unit/scroll-scene.test.tsx`, `web/test/unit/scroll-scene-reduced.test.tsx`

**Interfaces:**
- Consumes: `motion/react` (`useScroll`, `useTransform`, `useReducedMotion`, `useInView`, `useSpring`, `animate`, `MotionValue`) — all from the existing dependency.
- Produces (beats consume these exact signatures):
  - `useMediaQuery(query: string): boolean` — SSR-safe, `false` on server/first render.
  - `GlassCard({ className?, children, ...divProps })` — plain div wrapper.
  - `CountUp({ to: number, notation?: 'plain' | 'compact', durationS?: number, className?: string })` — renders the FINAL value in static HTML / reduced motion; animates 0→to when scrolled into view.
  - `TiltCard({ children, restRotate?: number, maxTiltDeg?: number, className?: string })` — mouse-only hover tilt.
  - `ScrollScene({ id?, ariaLabel: string, lengthSvh: number, scene: (progress: MotionValue<number>) => ReactNode, fallback: ReactNode, className? })` — renders `<section aria-label=…>`; scrub (sticky pin, `height: lengthSvh*100svh`) only when viewport ≥ 768 px AND motion allowed; otherwise renders `fallback` directly inside the section.
  - `test/setup.ts`: `setViewportWide(value: boolean)` alongside the existing `setPrefersReducedMotion`.

- [ ] **Step 1: Update `web/test/setup.ts`** (test infrastructure first — the new components need `(min-width: 768px)` and `ResizeObserver` in jsdom). Replace the whole file with:

```ts
import { beforeEach, vi } from 'vitest'

// jsdom implements none of matchMedia / IntersectionObserver / ResizeObserver.
// motion (motion/react) needs all three: useReducedMotion -> matchMedia,
// whileInView/useInView -> IntersectionObserver, useScroll -> ResizeObserver.

let reducedMotion = false
let wideViewport = false

/** Toggle the simulated `prefers-reduced-motion` media query for a test. */
export function setPrefersReducedMotion(value: boolean): void {
  reducedMotion = value
}

/** Toggle the simulated `(min-width: 768px)` query — ScrollScene's scrub gate. */
export function setViewportWide(value: boolean): void {
  wideViewport = value
}

beforeEach(() => {
  reducedMotion = false
  wideViewport = false
})

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string): MediaQueryList =>
    ({
      get matches() {
        if (query.includes('prefers-reduced-motion')) return reducedMotion
        if (query.includes('min-width: 768px')) return wideViewport
        return false
      },
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(() => false),
    }) as unknown as MediaQueryList,
})

class IntersectionObserverStub {
  readonly root = null
  readonly rootMargin = ''
  readonly thresholds: ReadonlyArray<number> = []
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: IntersectionObserverStub,
})

class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: ResizeObserverStub,
})
```

- [ ] **Step 2: Write the failing tests** — create `web/test/unit/primitives.test.tsx`:

```tsx
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CountUp } from '../../components/ui/count-up'
import { GlassCard } from '../../components/ui/glass-card'
import { TiltCard } from '../../components/ui/tilt-card'

describe('GlassCard', () => {
  it('renders children inside a glass-styled div and merges className', () => {
    const { container } = render(
      <GlassCard className="p-6">
        <p>inside</p>
      </GlassCard>,
    )
    expect(screen.getByText('inside')).toBeDefined()
    const card = container.firstElementChild as HTMLElement
    expect(card.className).toContain('backdrop-blur')
    expect(card.className).toContain('p-6')
  })

  it('passes through arbitrary div attributes', () => {
    const { container } = render(<GlassCard data-testid="glass">x</GlassCard>)
    expect(container.querySelector('[data-testid="glass"]')).not.toBeNull()
  })
})

describe('CountUp', () => {
  // jsdom's IntersectionObserver stub never fires, so what renders here is
  // exactly what no-JS / reduced-motion / pre-scroll visitors get: the FINAL
  // value, always readable (spec §2 accessibility).
  it('renders the final value with plain notation', () => {
    render(<CountUp to={1850} />)
    expect(screen.getByText('1,850')).toBeDefined()
  })

  it('renders the final value with compact notation', () => {
    render(<CountUp to={1000000} notation="compact" />)
    expect(screen.getByText('1M')).toBeDefined()
  })
})

describe('TiltCard', () => {
  it('renders children with a resting rotation transform', () => {
    const { container } = render(
      <TiltCard restRotate={-2}>
        <p>card</p>
      </TiltCard>,
    )
    expect(screen.getByText('card')).toBeDefined()
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper.style.transform).toContain('rotate')
  })

  it('ignores touch pointers and zero-size rects without crashing (mobile-light)', () => {
    const { container } = render(
      <TiltCard>
        <p>card</p>
      </TiltCard>,
    )
    const wrapper = container.firstElementChild as HTMLElement
    const before = wrapper.style.transform
    fireEvent.pointerMove(wrapper, { pointerType: 'touch', clientX: 40, clientY: 40 })
    fireEvent.pointerMove(wrapper, { pointerType: 'mouse', clientX: 40, clientY: 40 })
    expect(wrapper.style.transform).toBe(before)
  })
})
```

Create `web/test/unit/scroll-scene.test.tsx`:

```tsx
import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ScrollScene } from '../../components/ui/scroll-scene'
import { setViewportWide } from '../setup'

describe('ScrollScene', () => {
  it('renders the readable static fallback by default (narrow viewport / SSR shape)', () => {
    const { container } = render(
      <ScrollScene
        ariaLabel="Demo scene"
        lengthSvh={3}
        scene={() => <p>SCENE</p>}
        fallback={<p>FALLBACK</p>}
      />,
    )
    expect(screen.getByText('FALLBACK')).toBeDefined()
    expect(screen.queryByText('SCENE')).toBeNull()
    const section = container.querySelector('section[aria-label="Demo scene"]') as HTMLElement
    expect(section).not.toBeNull()
    // no pinned emptiness: no sticky pin, no multi-viewport height
    expect(section.querySelector('.sticky')).toBeNull()
    expect(section.style.height).toBe('')
  })

  it('upgrades to the pinned scrub scene on wide viewports', async () => {
    setViewportWide(true)
    const { container } = render(
      <ScrollScene
        ariaLabel="Demo scene"
        lengthSvh={3}
        scene={() => <p>SCENE</p>}
        fallback={<p>FALLBACK</p>}
      />,
    )
    await waitFor(() => expect(screen.queryByText('SCENE')).not.toBeNull())
    expect(screen.queryByText('FALLBACK')).toBeNull()
    const section = container.querySelector('section[aria-label="Demo scene"]') as HTMLElement
    expect(section.querySelector('.sticky')).not.toBeNull()
    expect(section.style.height).toBe('300svh')
  })
})
```

Create `web/test/unit/scroll-scene-reduced.test.tsx` (separate file on purpose: motion's `useReducedMotion` caches its very first matchMedia read for the life of the module, so the reduced case needs a fresh vitest worker — same isolation trick P1's hero tests documented):

```tsx
import { act, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ScrollScene } from '../../components/ui/scroll-scene'
import { setPrefersReducedMotion, setViewportWide } from '../setup'

describe('ScrollScene under prefers-reduced-motion', () => {
  it('renders the static fallback even on a wide viewport', async () => {
    setPrefersReducedMotion(true)
    setViewportWide(true)
    const { container } = render(
      <ScrollScene
        ariaLabel="Demo scene"
        lengthSvh={3}
        scene={() => <p>SCENE</p>}
        fallback={<p>FALLBACK</p>}
      />,
    )
    await act(async () => {})
    expect(screen.getByText('FALLBACK')).toBeDefined()
    expect(screen.queryByText('SCENE')).toBeNull()
    expect(container.querySelector('.sticky')).toBeNull()
  })
})
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npm run test:unit -w web`
Expected: FAIL — the three new files error with `Cannot find module '../../components/ui/glass-card'` (and siblings). The prior 31 tests still pass.

- [ ] **Step 4: Create `web/lib/use-media.ts`**

```ts
'use client'

import { useEffect, useState } from 'react'

/**
 * SSR-safe media query. Returns false on the server and on the first client
 * render (so static-export HTML and hydration always match), then tracks the
 * live media query. Used by ScrollScene (scrub gate) and Proof (parallax gate).
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const list = window.matchMedia(query)
    const update = () => setMatches(list.matches)
    update()
    list.addEventListener('change', update)
    return () => list.removeEventListener('change', update)
  }, [query])

  return matches
}
```

- [ ] **Step 5: Create `web/components/ui/glass-card.tsx`**

```tsx
import type { HTMLAttributes } from 'react'

export type GlassCardProps = HTMLAttributes<HTMLDivElement>

/** Soft glass card (spec §2 texture). Pure presentational wrapper — no hooks,
 * safe in server and client trees alike. */
export function GlassCard({ className = '', children, ...rest }: GlassCardProps) {
  return (
    <div
      className={`rounded-2xl border border-white/60 bg-white/70 shadow-lg shadow-ink/5 backdrop-blur ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}
```

- [ ] **Step 6: Create `web/components/ui/count-up.tsx`**

```tsx
'use client'

import { animate, useInView, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

export interface CountUpProps {
  to: number
  /** 'plain' → 1,850 · 'compact' → 1M */
  notation?: 'plain' | 'compact'
  durationS?: number
  className?: string
}

const formatters = {
  plain: new Intl.NumberFormat('en-US'),
  compact: new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 0 }),
} as const

/**
 * "Counters count up on entry" (spec §3, beat 5). The static HTML carries the
 * FINAL value so no-JS, reduced-motion, and pre-scroll visitors always read
 * the real number; when the span scrolls into view with motion allowed, it
 * re-runs 0 → `to` once. Number formatting only — the numbers themselves come
 * from the stats content module, never from components.
 */
export function CountUp({ to, notation = 'plain', durationS = 1.4, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement | null>(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })
  const prefersReducedMotion = useReducedMotion()
  const [display, setDisplay] = useState(() => formatters[notation].format(to))

  useEffect(() => {
    if (!inView || prefersReducedMotion) return
    const controls = animate(0, to, {
      duration: durationS,
      ease: 'easeOut',
      onUpdate: (latest) => setDisplay(formatters[notation].format(Math.round(latest))),
    })
    return () => controls.stop()
  }, [inView, prefersReducedMotion, to, durationS, notation])

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  )
}
```

- [ ] **Step 7: Create `web/components/ui/tilt-card.tsx`**

```tsx
'use client'

import { motion, useReducedMotion, useSpring } from 'motion/react'
import { useRef, type PointerEvent, type ReactNode } from 'react'

export interface TiltCardProps {
  children: ReactNode
  /** Resting tilt in degrees — the proof gallery scatters cards at lazy angles. */
  restRotate?: number
  maxTiltDeg?: number
  className?: string
}

/**
 * Hover-tilt wrapper for the proof gallery ("cards drift/tilt on hover").
 * Mouse-only: touch pointers are ignored (mobile-light variant), and reduced
 * motion zeroes both the tilt and the resting rotation.
 */
export function TiltCard({ children, restRotate = 0, maxTiltDeg = 8, className = '' }: TiltCardProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const prefersReducedMotion = useReducedMotion()
  const rotateX = useSpring(0, { stiffness: 180, damping: 18 })
  const rotateY = useSpring(0, { stiffness: 180, damping: 18 })

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (prefersReducedMotion || event.pointerType !== 'mouse' || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return
    const px = (event.clientX - rect.left) / rect.width - 0.5
    const py = (event.clientY - rect.top) / rect.height - 0.5
    rotateY.set(px * maxTiltDeg * 2)
    rotateX.set(-py * maxTiltDeg * 2)
  }

  function onPointerLeave() {
    rotateX.set(0)
    rotateY.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      style={{
        rotateX,
        rotateY,
        rotate: prefersReducedMotion ? 0 : restRotate,
        transformPerspective: 800,
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
```

- [ ] **Step 8: Create `web/components/ui/scroll-scene.tsx`**

```tsx
'use client'

import { useScroll, useReducedMotion, type MotionValue } from 'motion/react'
import { useRef, type ReactNode } from 'react'
import { useMediaQuery } from '@/lib/use-media'

export interface ScrollSceneProps {
  id?: string
  /** Landmark label — every beat keeps a stable aria-label for tests. */
  ariaLabel: string
  /** Pin duration: total section height in viewport-heights while scrubbing. */
  lengthSvh: number
  /** Scrubbed scene. Receives pin progress 0→1 while the viewport is inside the section. */
  scene: (progress: MotionValue<number>) => ReactNode
  /**
   * Static variant — FULLY readable with no scroll-scrubbing (spec §4:
   * reduced-motion + mobile-light variants are mandatory per scene).
   * Rendered on the server / first client paint (static-export HTML, SEO,
   * no-JS), under prefers-reduced-motion, and below 768px.
   */
  fallback: ReactNode
  className?: string
}

/**
 * Sticky pinning + useScroll scrub (spec §4). The scrubbed scene is a pure
 * client-side enhancement: the section always ships the readable fallback in
 * HTML and only swaps to the pinned scene after mount, when the viewport is
 * wide AND the visitor has not asked for reduced motion. MotionConfig cannot
 * strip style-bound motion values, so this gate is explicit by design.
 */
export function ScrollScene({
  id,
  ariaLabel,
  lengthSvh,
  scene,
  fallback,
  className = '',
}: ScrollSceneProps) {
  const ref = useRef<HTMLElement | null>(null)
  const prefersReducedMotion = useReducedMotion()
  const isWide = useMediaQuery('(min-width: 768px)')
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const scrub = isWide && !prefersReducedMotion

  return (
    <section
      id={id}
      ref={ref}
      aria-label={ariaLabel}
      className={className}
      style={scrub ? { height: `${lengthSvh * 100}svh` } : undefined}
    >
      {scrub ? (
        <div className="sticky top-0 flex h-svh flex-col items-center justify-center overflow-hidden px-6">
          {scene(scrollYProgress)}
        </div>
      ) : (
        fallback
      )}
    </section>
  )
}
```

- [ ] **Step 9: Run tests to verify they pass**

Run: `npm run test:unit -w web`
Expected: PASS — `Tests  40 passed` (31 + 9 new).

- [ ] **Step 10: Typecheck + lint**

Run: `npm run typecheck -w web && npm run lint -w web`
Expected: both exit 0.

- [ ] **Step 11: Commit**

```bash
git add web/lib/use-media.ts web/components/ui/glass-card.tsx web/components/ui/count-up.tsx web/components/ui/tilt-card.tsx web/components/ui/scroll-scene.tsx web/test/setup.ts web/test/unit/primitives.test.tsx web/test/unit/scroll-scene.test.tsx web/test/unit/scroll-scene-reduced.test.tsx
git commit -m "feat(ui): ScrollScene, GlassCard, CountUp, TiltCard primitives

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: Beat 2 — The chaos ("Your week right now")

**Files:**
- Create: `web/components/beats/chaos.tsx`
- Modify: `web/app/globals.css` (append `.chaos-wash`)
- Test: `web/test/unit/chaos.test.tsx`

**Interfaces:**
- Consumes: `story.chaos` shape (`StoryContent['chaos']` from Task 2), `ScrollScene` + variants from Task 3, `fadeRise`/`staggerContainer` from `web/lib/motion.ts`, tokens `chaos-amber`/`chaos-red` from `globals.css`.
- Produces: `Chaos({ chaos: StoryContent['chaos'] })` — renders `<section aria-label="The chaos">`. Task 9 wires it; Task 5 reuses nothing from it (beats never import beats).

Motion (spec §3, binding): cards tumble in with physics-feel, stack messily, scroll-driven, hot hues. Physics-feel = per-card keyframe overshoot (drop from above, 3vh past the resting spot, settle) — no physics engine, no new deps.

- [ ] **Step 1: Write the failing tests** — create `web/test/unit/chaos.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Chaos } from '../../components/beats/chaos'
import { story } from '../../content/story'

// jsdom never matches (min-width: 768px), so these tests exercise the static
// fallback — exactly what mobile and reduced-motion visitors get. The pinned
// scrub path is covered by scroll-scene.test.tsx (unit) and e2e/story.spec.ts.
describe('Chaos (beat 2)', () => {
  it('renders the heading and lede', () => {
    render(<Chaos chaos={story.chaos} />)
    expect(screen.getByRole('heading', { level: 2 }).textContent).toBe('Your week right now')
    expect(
      screen.getByText("Running the business is the part you love. It's everything else that piles up."),
    ).toBeDefined()
  })

  it('renders every chaos card fully readable with no pinned emptiness', () => {
    const { container } = render(<Chaos chaos={story.chaos} />)
    for (const card of story.chaos.cards) {
      expect(screen.getByText(card.body)).toBeDefined()
    }
    const section = container.querySelector('section[aria-label="The chaos"]') as HTMLElement
    expect(section).not.toBeNull()
    expect(section.querySelector('.sticky')).toBeNull()
    expect(section.style.height).toBe('')
  })

  it('paints cards in the hot alert hues (spec §2 palette story)', () => {
    const { container } = render(<Chaos chaos={story.chaos} />)
    expect(container.querySelector('.bg-chaos-red\\/15')).not.toBeNull()
    expect(container.querySelector('.bg-chaos-amber\\/15')).not.toBeNull()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test:unit -w web`
Expected: FAIL — `Cannot find module '../../components/beats/chaos'`. Prior 40 tests pass.

- [ ] **Step 3: Append `.chaos-wash` to `web/app/globals.css`** (after the `badge-pulse` reduced-motion block):

```css
/* Beat 2 — hot chaos wash (spec §2: chaos uses alert hues #FFA94D / #FF6B6B).
   Static gradient, no animation, so no reduced-motion override needed. */
.chaos-wash {
  position: absolute;
  inset: -10%;
  z-index: -1;
  background:
    radial-gradient(
      55% 45% at 25% 25%,
      color-mix(in srgb, var(--color-chaos-amber) 20%, transparent) 0%,
      transparent 70%
    ),
    radial-gradient(
      50% 50% at 75% 65%,
      color-mix(in srgb, var(--color-chaos-red) 16%, transparent) 0%,
      transparent 70%
    );
}
```

- [ ] **Step 4: Create `web/components/beats/chaos.tsx`**

```tsx
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
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm run test:unit -w web`
Expected: PASS — `Tests  43 passed` (40 + 3 new).

- [ ] **Step 6: Typecheck + lint**

Run: `npm run typecheck -w web && npm run lint -w web`
Expected: both exit 0.

- [ ] **Step 7: Commit**

```bash
git add web/components/beats/chaos.tsx web/app/globals.css web/test/unit/chaos.test.tsx
git commit -m "feat(web): beat 2 - the chaos, tumbling hot-hue cards

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 5: Beat 3 — The turn ("Then, quietly, it all gets handled")

**Files:**
- Create: `web/components/beats/turn.tsx`
- Modify: `web/app/globals.css` (append `.calm-wash`)
- Test: `web/test/unit/turn.test.tsx`

**Interfaces:**
- Consumes: `story.turn` + `story.chaos.cards` (handed over by the page in Task 9 — beats never import beats), `ScrollScene`, `fadeRise`/`staggerContainer`, wash tokens.
- Produces: `Turn({ turn: StoryContent['turn'], cards: StoryContent['chaos']['cards'] })` — renders `<section aria-label="The turn">`. `.calm-wash` CSS class (reused by Task 6).

Motion (spec §3, binding): scroll-scrubbed — chaos cards fly into tidy stacks (first ~35% of the pin, hot hues resolving to calm pastel via color interpolation), then chat bubbles type themselves (character reveal scrubbed by progress), then the closer fades in.

- [ ] **Step 1: Write the failing tests** — create `web/test/unit/turn.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Turn } from '../../components/beats/turn'
import { story } from '../../content/story'

// jsdom = static fallback path (see chaos.test.tsx for the rationale).
describe('Turn (beat 3)', () => {
  const renderTurn = () => render(<Turn turn={story.turn} cards={story.chaos.cards} />)

  it('renders the heading, lede, and the 2:14 AM badge', () => {
    renderTurn()
    expect(screen.getByRole('heading', { level: 2 }).textContent).toBe(
      'Then, quietly, it all gets handled',
    )
    expect(screen.getByText('While you were asleep:')).toBeDefined()
    // '2:14 AM' appears twice by design: the header badge and the customer
    // message meta — getAllByText, not getByText
    expect(screen.getAllByText('2:14 AM').length).toBeGreaterThanOrEqual(1)
  })

  it('renders every event fully readable, including the 4-second reply meta', () => {
    const { container } = renderTurn()
    for (const event of story.turn.events) {
      expect(screen.getByText(event.text)).toBeDefined()
    }
    expect(screen.getByText('Answered in 4 seconds')).toBeDefined()
    const section = container.querySelector('section[aria-label="The turn"]') as HTMLElement
    expect(section.querySelector('.sticky')).toBeNull()
  })

  it('shows the beat-2 cards resolved into a tidy calm stack', () => {
    renderTurn()
    // first four chaos cards appear as tidied mini-cards (titles only)
    expect(screen.getByText('WhatsApp · 11:47 PM')).toBeDefined()
    expect(screen.getByText('Invoice #114')).toBeDefined()
    expect(screen.getByText('Missed call · new customer')).toBeDefined()
    expect(screen.getByText('Inbox')).toBeDefined()
  })

  it('renders the closer line', () => {
    renderTurn()
    expect(screen.getByText('You find out over coffee. Everything just… happened.')).toBeDefined()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test:unit -w web`
Expected: FAIL — `Cannot find module '../../components/beats/turn'`. Prior 43 pass.

- [ ] **Step 3: Append `.calm-wash` to `web/app/globals.css`** (directly after `.chaos-wash`):

```css
/* Beats 3–4 — the palette resolves to calm pastels (spec §2 palette story).
   Static gradient, no animation. */
.calm-wash {
  position: absolute;
  inset: -10%;
  z-index: -1;
  background:
    radial-gradient(55% 45% at 30% 20%, var(--color-wash-lavender) 0%, transparent 70%),
    radial-gradient(50% 50% at 75% 70%, var(--color-wash-sky) 0%, transparent 70%);
}
```

- [ ] **Step 4: Create `web/components/beats/turn.tsx`**

```tsx
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
          <div className="mt-10 flex w-full max-w-xs flex-col gap-2">
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
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm run test:unit -w web`
Expected: PASS — `Tests  47 passed` (43 + 4 new).

- [ ] **Step 6: Typecheck + lint**

Run: `npm run typecheck -w web && npm run lint -w web`
Expected: both exit 0.

- [ ] **Step 7: Commit**

```bash
git add web/components/beats/turn.tsx web/app/globals.css web/test/unit/turn.test.tsx
git commit -m "feat(web): beat 3 - the turn, 2:14 AM cards fly tidy and bubbles type

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 6: Beat 4 — The storefront ("And it looks gorgeous doing it")

**Files:**
- Create: `web/components/beats/storefront.tsx`
- Test: `web/test/unit/storefront.test.tsx`

**Interfaces:**
- Consumes: `story.storefront` (`StoryContent['storefront']`), `ScrollScene`, `GlassCard`, `CountUp`, `fadeRise`/`staggerContainer`, `.calm-wash` from Task 5.
- Produces: `Storefront({ storefront: StoryContent['storefront'] })` — renders `<section aria-label="The storefront">`.

Motion (spec §3, binding): bland generic page morphs into a beautiful one tied to scroll; conversion needle/metrics tick up; the line "Your website should be your best salesperson." Both mock pages are styled divs (no images). The numeric metric reuses `CountUp` (counts on entry); the needle is scrubbed.

- [ ] **Step 1: Write the failing tests** — create `web/test/unit/storefront.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Storefront } from '../../components/beats/storefront'
import { story } from '../../content/story'

// jsdom = static fallback path (before/after side by side, all copy readable).
describe('Storefront (beat 4)', () => {
  const renderStorefront = () => render(<Storefront storefront={story.storefront} />)

  it('renders the heading and the salesperson punchline', () => {
    renderStorefront()
    expect(screen.getByRole('heading', { level: 2 }).textContent).toBe(
      'And it looks gorgeous doing it',
    )
    expect(screen.getByText('Your website should be your best salesperson.')).toBeDefined()
  })

  it('renders the bland before-page mock', () => {
    renderStorefront()
    expect(screen.getByText('WELCOME TO OUR WEBSITE')).toBeDefined()
    expect(screen.getByText('We are committed to quality and service since 2009.')).toBeDefined()
  })

  it('renders the gorgeous after-page mock with its booking CTA', () => {
    renderStorefront()
    expect(screen.getByText('Saturday has three openings left.')).toBeDefined()
    expect(screen.getByText('Pick a time — it takes under a minute.')).toBeDefined()
    expect(screen.getByText('Book Saturday')).toBeDefined()
  })

  it('shows the metric at its final value with the improvement note', () => {
    const { container } = renderStorefront()
    // CountUp renders the final value statically (11 enquiries this week)
    expect(screen.getByText('11')).toBeDefined()
    expect(screen.getByText(/enquiries this week/)).toBeDefined()
    expect(screen.getByText('up from 2')).toBeDefined()
    const section = container.querySelector('section[aria-label="The storefront"]') as HTMLElement
    expect(section.querySelector('.sticky')).toBeNull()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test:unit -w web`
Expected: FAIL — `Cannot find module '../../components/beats/storefront'`. Prior 47 pass.

- [ ] **Step 3: Create `web/components/beats/storefront.tsx`**

```tsx
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test:unit -w web`
Expected: PASS — `Tests  51 passed` (47 + 4 new).

- [ ] **Step 5: Typecheck + lint**

Run: `npm run typecheck -w web && npm run lint -w web`
Expected: both exit 0.

- [ ] **Step 6: Commit**

```bash
git add web/components/beats/storefront.tsx web/test/unit/storefront.test.tsx
git commit -m "feat(web): beat 4 - the storefront, before-after morph with metric

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 7: Build-time stats — fetch script, committed fallback, ticker module

**Files:**
- Create: `web/content/stats.json`
- Modify: `web/content/schema.ts` (append `StatsSchema`, `TickerItemSchema`, `TickerSchema` + types)
- Create: `web/content/stats.ts`
- Create: `web/content/ticker.ts`
- Create: `web/scripts/fetch-stats.ts`
- Modify: `web/package.json` (add `prebuild` script)
- Modify: `.github/workflows/deploy.yml` (pass `GITHUB_TOKEN` to the two `npm run build -w web` steps)
- Test: `web/test/unit/stats.test.ts`

**Interfaces:**
- Consumes: nothing from other P2 tasks (deliberately decoupled — the script re-declares its file schema so it runs standalone under `node --experimental-strip-types`; a lockstep test pins both schemas to the same committed file).
- Produces:
  - `content/stats.ts`: `export const stats: Stats` (Zod-parsed `stats.json`).
  - `content/ticker.ts`: `export const ticker: TickerItem[]` — exactly 3 items, ids `speed`/`scale`/`reach`, values sourced from `stats.manual.*`. Task 8's `Proof` takes `ticker` as a prop.
  - `scripts/fetch-stats.ts` exports (for tests): `StatsFileSchema`, `type StatsFile`, `resolveToken(env, runGh)`, `fetchGithubNumbers(token, fetchImpl)`, `mergeStats(current, github, today)`.
  - npm lifecycle: `prebuild` runs automatically before every `npm run build -w web`.

**Failure-mode contract (binding):** the build NEVER fails — no token → keep committed values; offline/API error/bad payload → keep committed values; local Node 20 can't run `--experimental-strip-types` → the `||` fallback in `prebuild` prints a skip message and the build proceeds with committed values. Only `github.*` numbers are refreshed; `manual.*` (the ticker's three business results) are user-owned and never touched. The `github.*` block is not displayed in P2 — it exists because spec §4 puts the stats mechanism in this phase and P4's MCP/llms.txt read the same modules (decision recorded here).

- [ ] **Step 1: Write the failing tests** — create `web/test/unit/stats.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { StatsSchema, TickerSchema } from '../../content/schema'
import { stats } from '../../content/stats'
import { ticker } from '../../content/ticker'
import rawStats from '../../content/stats.json'
import {
  StatsFileSchema,
  fetchGithubNumbers,
  mergeStats,
  resolveToken,
} from '../../scripts/fetch-stats'

describe('committed stats.json', () => {
  it('satisfies both the app schema and the script schema (lockstep)', () => {
    expect(StatsSchema.safeParse(rawStats).success).toBe(true)
    expect(StatsFileSchema.safeParse(rawStats).success).toBe(true)
  })

  it('rejects a non-positive manual number', () => {
    const bad = { ...rawStats, manual: { ...rawStats.manual, clientCountries: 0 } }
    expect(StatsSchema.safeParse(bad).success).toBe(false)
  })
})

describe('resolveToken', () => {
  it('prefers the GITHUB_TOKEN env var', () => {
    expect(resolveToken({ GITHUB_TOKEN: 'env-token' }, () => 'gh-token')).toBe('env-token')
  })

  it('falls back to gh auth token output (trimmed)', () => {
    expect(resolveToken({}, () => 'gh-token\n')).toBe('gh-token')
  })

  it('returns null when there is no env token and gh fails', () => {
    expect(
      resolveToken({}, () => {
        throw new Error('gh: command not found')
      }),
    ).toBeNull()
  })
})

describe('fetchGithubNumbers', () => {
  const goodBody = {
    data: {
      user: {
        repositories: { totalCount: 42 },
        contributionsCollection: { contributionCalendar: { totalContributions: 1234 } },
      },
    },
  }

  it('parses a good GraphQL response', async () => {
    const fetchImpl = (async () => new Response(JSON.stringify(goodBody))) as unknown as typeof fetch
    await expect(fetchGithubNumbers('token', fetchImpl)).resolves.toEqual({
      publicRepos: 42,
      contributionsPastYear: 1234,
    })
  })

  it('returns null on a non-OK response', async () => {
    const fetchImpl = (async () => new Response('nope', { status: 401 })) as unknown as typeof fetch
    await expect(fetchGithubNumbers('token', fetchImpl)).resolves.toBeNull()
  })

  it('returns null on a malformed payload', async () => {
    const fetchImpl = (async () => new Response('{"data":{}}')) as unknown as typeof fetch
    await expect(fetchGithubNumbers('token', fetchImpl)).resolves.toBeNull()
  })

  it('returns null when fetch rejects (offline)', async () => {
    const fetchImpl = (async () => {
      throw new Error('network down')
    }) as unknown as typeof fetch
    await expect(fetchGithubNumbers('token', fetchImpl)).resolves.toBeNull()
  })
})

describe('mergeStats', () => {
  it('keeps manual numbers untouched, swaps the github block, stamps the date', () => {
    const current = StatsFileSchema.parse(rawStats)
    const next = mergeStats(current, { publicRepos: 99, contributionsPastYear: 5000 }, '2026-08-01')
    expect(next.manual).toEqual(current.manual)
    expect(next.github).toEqual({ publicRepos: 99, contributionsPastYear: 5000 })
    expect(next.updatedAt).toBe('2026-08-01')
  })
})

describe('ticker module', () => {
  it('exposes exactly the three spec numbers, sourced from the stats module', () => {
    expect(TickerSchema.safeParse(ticker).success).toBe(true)
    expect(ticker.map((item) => item.id)).toEqual(['speed', 'scale', 'reach'])
    expect(ticker[0].value).toBe(stats.manual.daysToFirstPayingCustomer)
    expect(ticker[1].value).toBe(stats.manual.requestsPerDay)
    expect(ticker[2].value).toBe(stats.manual.clientCountries)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test:unit -w web`
Expected: FAIL — `Cannot find module '../../content/stats.json'` (and siblings). Prior 51 pass.

- [ ] **Step 3: Create `web/content/stats.json`** (the committed fallback — `manual` numbers are the user-approved business results; `github` seeds get refreshed on the first CI deploy):

```json
{
  "updatedAt": "2026-07-10",
  "manual": {
    "daysToFirstPayingCustomer": 15,
    "requestsPerDay": 1000000,
    "clientCountries": 4
  },
  "github": {
    "publicRepos": 20,
    "contributionsPastYear": 1500
  }
}
```

- [ ] **Step 4: Append stats/ticker schemas to `web/content/schema.ts`** (after the `ProofSchema` block; add the types next to the other P2 type exports):

```ts
/* ——— P2: build-time stats (spec §4) ——— */

export const StatsSchema = z.object({
  updatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  /** User-owned business results — scripts/fetch-stats.ts never touches these. */
  manual: z.object({
    daysToFirstPayingCustomer: z.number().int().positive(),
    requestsPerDay: z.number().int().positive(),
    clientCountries: z.number().int().positive(),
  }),
  /** Refreshed pre-build by scripts/fetch-stats.ts when a token is available.
   * Not displayed in P2; P4's MCP server / llms.txt read the same module. */
  github: z.object({
    publicRepos: z.number().int().nonnegative(),
    contributionsPastYear: z.number().int().nonnegative(),
  }),
})

export const TickerItemSchema = z.object({
  id: z.string().regex(/^[a-z][a-z0-9-]*$/),
  value: z.number().int().positive(),
  notation: z.enum(['plain', 'compact']),
  suffix: z.string(),
  label: z.string().min(1),
})

/** Exactly the three spec §3 results: 15 days · 1M+/day · 4 countries. */
export const TickerSchema = z.array(TickerItemSchema).length(3)

export type Stats = z.infer<typeof StatsSchema>
export type TickerItem = z.infer<typeof TickerItemSchema>
```

- [ ] **Step 5: Create `web/content/stats.ts`**

```ts
import { StatsSchema, type Stats } from './schema'
import rawStats from './stats.json'

/** Zod-validated build-time stats (spec §4). The JSON is the committed
 * fallback; scripts/fetch-stats.ts refreshes it pre-build when it can. */
export const stats: Stats = StatsSchema.parse(rawStats)
```

- [ ] **Step 6: Create `web/content/ticker.ts`**

```ts
import { TickerSchema, type TickerItem } from './schema'
import { stats } from './stats'

/**
 * Beat 5 results ticker. NUMBERS come from the stats module (never hardcoded
 * in components); LABELS are copy and live here with the rest of the content.
 */
export const ticker: TickerItem[] = TickerSchema.parse([
  {
    id: 'speed',
    value: stats.manual.daysToFirstPayingCustomer,
    notation: 'plain',
    suffix: ' days',
    label: 'from idea to paying customers',
  },
  {
    id: 'scale',
    value: stats.manual.requestsPerDay,
    notation: 'compact',
    suffix: '+',
    label: 'requests served every day',
  },
  {
    id: 'reach',
    value: stats.manual.clientCountries,
    notation: 'plain',
    suffix: '',
    label: 'countries where clients run my work',
  },
])
```

- [ ] **Step 7: Create `web/scripts/fetch-stats.ts`**

```ts
/**
 * Build-time stats refresh (spec §4). Wired as web's `prebuild` script, so it
 * runs before every `next build`.
 *
 * HARD RULE — this script NEVER fails the build:
 *   - no GITHUB_TOKEN and no `gh` auth        → keep committed stats.json, exit 0
 *   - offline / API error / malformed payload → keep committed stats.json, exit 0
 *   - unexpected crash                        → caught in main().catch, exit 0
 *   - local Node without --experimental-strip-types (Node 20)
 *                                             → `|| echo` in package.json covers it
 *
 * Only `github.*` is refreshed. `manual.*` (the ticker's business results) is
 * user-owned and never touched.
 */
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { z } from 'zod'

const GITHUB_LOGIN = 'hiteshmodi0624'
const STATS_PATH = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'content',
  'stats.json',
)

/** Deliberately re-declared rather than imported from content/schema.ts: the
 * script must run standalone under `node --experimental-strip-types`, where
 * extensionless cross-file .ts imports don't resolve. The unit suite asserts
 * both schemas accept the committed stats.json, keeping them in lockstep. */
export const StatsFileSchema = z.object({
  updatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  manual: z.object({
    daysToFirstPayingCustomer: z.number().int().positive(),
    requestsPerDay: z.number().int().positive(),
    clientCountries: z.number().int().positive(),
  }),
  github: z.object({
    publicRepos: z.number().int().nonnegative(),
    contributionsPastYear: z.number().int().nonnegative(),
  }),
})
export type StatsFile = z.infer<typeof StatsFileSchema>

export function resolveToken(
  env: Record<string, string | undefined>,
  runGh: () => string,
): string | null {
  if (env.GITHUB_TOKEN) return env.GITHUB_TOKEN
  try {
    const token = runGh().trim()
    return token.length > 0 ? token : null
  } catch {
    return null
  }
}

const GithubResponseSchema = z.object({
  data: z.object({
    user: z.object({
      repositories: z.object({ totalCount: z.number().int().nonnegative() }),
      contributionsCollection: z.object({
        contributionCalendar: z.object({
          totalContributions: z.number().int().nonnegative(),
        }),
      }),
    }),
  }),
})

export async function fetchGithubNumbers(
  token: string,
  fetchImpl: typeof fetch,
): Promise<StatsFile['github'] | null> {
  try {
    const response = await fetchImpl('https://api.github.com/graphql', {
      method: 'POST',
      headers: { authorization: `bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        query: `query {
          user(login: "${GITHUB_LOGIN}") {
            repositories(privacy: PUBLIC, ownerAffiliations: OWNER) { totalCount }
            contributionsCollection { contributionCalendar { totalContributions } }
          }
        }`,
      }),
    })
    if (!response.ok) return null
    const parsed = GithubResponseSchema.safeParse(await response.json())
    if (!parsed.success) return null
    const user = parsed.data.data.user
    return {
      publicRepos: user.repositories.totalCount,
      contributionsPastYear: user.contributionsCollection.contributionCalendar.totalContributions,
    }
  } catch {
    return null
  }
}

export function mergeStats(
  current: StatsFile,
  github: StatsFile['github'],
  today: string,
): StatsFile {
  return { ...current, updatedAt: today, github }
}

async function main(): Promise<void> {
  const current = StatsFileSchema.parse(JSON.parse(readFileSync(STATS_PATH, 'utf8')))
  const token = resolveToken(process.env, () =>
    execFileSync('gh', ['auth', 'token'], { encoding: 'utf8' }),
  )
  if (!token) {
    console.log('fetch-stats: no GITHUB_TOKEN and no gh auth — keeping committed stats.json')
    return
  }
  const github = await fetchGithubNumbers(token, fetch)
  if (!github) {
    console.log('fetch-stats: GitHub unreachable or token rejected — keeping committed stats.json')
    return
  }
  const next = mergeStats(current, github, new Date().toISOString().slice(0, 10))
  writeFileSync(STATS_PATH, `${JSON.stringify(next, null, 2)}\n`)
  console.log(
    `fetch-stats: refreshed github stats (repos=${github.publicRepos}, contributions=${github.contributionsPastYear})`,
  )
}

// Execute only when run directly (`node --experimental-strip-types
// scripts/fetch-stats.ts`), never when imported by the unit suite.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error: unknown) => {
    console.log(
      `fetch-stats: skipped (${error instanceof Error ? error.message : 'unknown error'}) — keeping committed stats.json`,
    )
  })
}
```

- [ ] **Step 8: Wire the `prebuild` lifecycle script** — in `web/package.json` `"scripts"`, add directly above `"build"`:

```json
    "prebuild": "node --experimental-strip-types scripts/fetch-stats.ts || echo 'fetch-stats: skipped on this Node - using committed content/stats.json'",
```

- [ ] **Step 9: Pass the ambient token in CI** — in `.github/workflows/deploy.yml`, change BOTH `- run: npm run build -w web` steps (one in `build-test`, one in `deploy`) to:

```yaml
      - run: npm run build -w web
        env:
          GITHUB_TOKEN: ${{ github.token }}
```

(If the ambient Actions token can't read the GraphQL fields, the script logs its skip message and the committed values ship — that's the designed failure mode, not an error.)

- [ ] **Step 10: Run tests to verify they pass**

Run: `npm run test:unit -w web`
Expected: PASS — `Tests  62 passed` (51 + 11 new).

- [ ] **Step 11: Prove the never-fail contract end to end**

Run: `npm run build -w web && echo "BUILD OK"`
Expected: on local Node 20 the prebuild line prints `fetch-stats: skipped on this Node - using committed content/stats.json` (after Node's bad-option complaint — that noise is expected); on Node 22 it prints one `fetch-stats: …` line (refreshed or keeping committed, depending on `gh` auth). In every case the build completes and `BUILD OK` prints.
Then run: `git diff --stat web/content/stats.json` — if the script refreshed values locally, `git checkout -- web/content/stats.json` to keep the committed fallback deterministic for review.

- [ ] **Step 12: Typecheck + lint**

Run: `npm run typecheck -w web && npm run lint -w web`
Expected: both exit 0.

- [ ] **Step 13: Commit**

```bash
git add web/content/stats.json web/content/schema.ts web/content/stats.ts web/content/ticker.ts web/scripts/fetch-stats.ts web/package.json .github/workflows/deploy.yml web/test/unit/stats.test.ts
git commit -m "feat(content): build-time stats - fetch script, committed fallback, ticker module

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 8: Beat 5 — Proof gallery + results ticker ("Built before. Shipped before.")

**Files:**
- Create: `web/components/beats/proof.tsx`
- Test: `web/test/unit/proof.test.tsx`

**Interfaces:**
- Consumes: `proof: ProofContent` (Task 2), `ticker: TickerItem[]` (Task 7), `GlassCard`/`TiltCard`/`CountUp`/`useMediaQuery` (Task 3), `fadeRise`/`staggerContainer`.
- Produces: `Proof({ proof: ProofContent, ticker: TickerItem[] })` — renders `<section aria-label="Proof">`.

Motion (spec §3, binding): floating tilted gallery — cards drift/tilt on hover (TiltCard, mouse-only), parallax (alternate cards drift on scroll, gated to wide + motion-allowed viewports since MotionConfig can't strip style-bound motion values), counters count up on entry (CountUp). No pin — this beat scrolls normally, so the section itself is its own reduced-motion/mobile-light variant: everything readable, fades only.

- [ ] **Step 1: Write the failing tests** — create `web/test/unit/proof.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Proof } from '../../components/beats/proof'
import { proof } from '../../content/projects'
import { ticker } from '../../content/ticker'

describe('Proof (beat 5)', () => {
  const renderProof = () => render(<Proof proof={proof} ticker={ticker} />)

  it('renders the heading and lede', () => {
    renderProof()
    expect(screen.getByRole('heading', { level: 2 }).textContent).toBe(
      'Built before. Shipped before.',
    )
    expect(
      screen.getByText('Real products with real customers — built end-to-end, not mocked up.'),
    ).toBeDefined()
  })

  it('renders all eight project cards with names and taglines', () => {
    renderProof()
    expect(proof.projects).toHaveLength(8)
    for (const project of proof.projects) {
      expect(screen.getByRole('heading', { level: 3, name: project.name })).toBeDefined()
      expect(screen.getByText(project.tagline)).toBeDefined()
    }
  })

  it('links Extrack with a safe external anchor and shows its outcome', () => {
    renderProof()
    expect(screen.getByText('From idea to paying customers in 15 days')).toBeDefined()
    const link = screen.getByRole('link', { name: /myextrack\.com/ })
    expect(link.getAttribute('href')).toBe('https://myextrack.com')
    expect(link.getAttribute('rel')).toContain('noopener')
    expect(link.getAttribute('target')).toBe('_blank')
  })

  it('marks the four client-work entries with the client pill', () => {
    renderProof()
    expect(screen.getAllByText('client work')).toHaveLength(4)
  })

  it('renders the results ticker at final values with its labels', () => {
    const { container } = renderProof()
    const values = Array.from(container.querySelectorAll('dd')).map((dd) =>
      dd.textContent?.trim(),
    )
    expect(values).toEqual(['15 days', '1M+', '4'])
    for (const item of ticker) {
      expect(screen.getByText(item.label)).toBeDefined()
    }
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test:unit -w web`
Expected: FAIL — `Cannot find module '../../components/beats/proof'`. Prior 62 pass.

- [ ] **Step 3: Create `web/components/beats/proof.tsx`**

```tsx
'use client'

import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import type { ProofContent, TickerItem } from '@/content/schema'
import { fadeRise, staggerContainer } from '@/lib/motion'
import { useMediaQuery } from '@/lib/use-media'
import { CountUp } from '@/components/ui/count-up'
import { GlassCard } from '@/components/ui/glass-card'
import { TiltCard } from '@/components/ui/tilt-card'

export interface ProofProps {
  proof: ProofContent
  ticker: TickerItem[]
}

/** Lazy scatter angles for the floating gallery. */
const REST_ROTATIONS = [-2, 1.5, -1, 2.5, -1.5, 1]

/** Beat 5 — "Built before. Shipped before." Floating tilted gallery with a
 * results ticker whose numbers flow from the stats content module. Parallax
 * and tilt are gated (wide viewport + motion allowed); reduced motion and
 * mobile get the same content with opacity fades only. */
export function Proof({ proof, ticker }: ProofProps) {
  const ref = useRef<HTMLElement | null>(null)
  const prefersReducedMotion = useReducedMotion()
  const isWide = useMediaQuery('(min-width: 768px)')
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const drift = useTransform(scrollYProgress, [0, 1], [32, -32])
  const parallax = isWide && !prefersReducedMotion

  return (
    <section ref={ref} aria-label="Proof" className="relative overflow-hidden px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <motion.header
          variants={fadeRise}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          className="text-center"
        >
          <h2 className="font-display text-4xl font-semibold tracking-tight text-ink md:text-5xl">
            {proof.heading}
          </h2>
          <p className="mt-4 text-muted">{proof.lede}</p>
        </motion.header>

        <motion.ul
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="mt-14 grid list-none gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {proof.projects.map((project, index) => (
            <motion.li key={project.slug} variants={fadeRise}>
              <motion.div style={parallax && index % 2 === 1 ? { y: drift } : undefined} className="h-full">
                <TiltCard restRotate={REST_ROTATIONS[index % REST_ROTATIONS.length]} className="h-full">
                  <GlassCard className="flex h-full flex-col p-6 text-left">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="font-display text-xl font-semibold text-ink">{project.name}</h3>
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
                </TiltCard>
              </motion.div>
            </motion.li>
          ))}
        </motion.ul>

        <dl className="mt-16 grid gap-4 sm:grid-cols-3">
          {ticker.map((item) => (
            <GlassCard key={item.id} className="flex flex-col-reverse p-6 text-center">
              <dt className="mt-1 text-sm text-muted">{item.label}</dt>
              <dd className="font-display text-4xl font-semibold text-ink">
                <CountUp to={item.value} notation={item.notation} />
                {item.suffix}
              </dd>
            </GlassCard>
          ))}
        </dl>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test:unit -w web`
Expected: PASS — `Tests  67 passed` (62 + 5 new).

- [ ] **Step 5: Typecheck + lint**

Run: `npm run typecheck -w web && npm run lint -w web`
Expected: both exit 0.

- [ ] **Step 6: Commit**

```bash
git add web/components/beats/proof.tsx web/test/unit/proof.test.tsx
git commit -m "feat(web): beat 5 - proof gallery and results ticker

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 9: Page wiring — hero → chaos → turn → storefront → proof → finale

**Files:**
- Modify: `web/app/page.tsx` (full replacement below)
- Test: `web/test/unit/page.test.tsx`

**Interfaces:**
- Consumes: every beat component and content module from Tasks 2–8, plus P1's `Hero`/`Finale`/`MotionProvider`/`profile`.
- Produces: the single static route `/` with all six beats in story order. E2E (Task 10) depends on the exact `aria-label` sequence `['Intro', 'The chaos', 'The turn', 'The storefront', 'Proof', 'Contact']`.

- [ ] **Step 1: Write the failing test** — create `web/test/unit/page.test.tsx`:

```tsx
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import HomePage from '../../app/page'

describe('home page wiring', () => {
  it('renders all six beats in story order (hero → chaos → turn → storefront → proof → finale)', () => {
    const { container } = render(<HomePage />)
    const labels = Array.from(container.querySelectorAll('main > section')).map((section) =>
      section.getAttribute('aria-label'),
    )
    expect(labels).toEqual(['Intro', 'The chaos', 'The turn', 'The storefront', 'Proof', 'Contact'])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:unit -w web`
Expected: FAIL — the new test reports `expected [ 'Intro', 'Contact' ] to deeply equal [ 'Intro', 'The chaos', … ]`. Prior 67 pass.

- [ ] **Step 3: Replace `web/app/page.tsx`**

```tsx
import { Chaos } from '@/components/beats/chaos'
import { Finale } from '@/components/beats/finale'
import { Hero } from '@/components/beats/hero'
import { Proof } from '@/components/beats/proof'
import { Storefront } from '@/components/beats/storefront'
import { Turn } from '@/components/beats/turn'
import { MotionProvider } from '@/components/motion-provider'
import { profile } from '@/content/profile'
import { proof } from '@/content/projects'
import { story } from '@/content/story'
import { ticker } from '@/content/ticker'

export default function HomePage() {
  return (
    <MotionProvider>
      <main>
        <Hero hero={profile.hero} />
        <Chaos chaos={story.chaos} />
        {/* the page hands beat-2's cards to beat 3 — beats never import beats */}
        <Turn turn={story.turn} cards={story.chaos.cards} />
        <Storefront storefront={story.storefront} />
        <Proof proof={proof} ticker={ticker} />
        <Finale finale={profile.finale} />
      </main>
    </MotionProvider>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test:unit -w web`
Expected: PASS — `Tests  68 passed` (67 + 1 new).

- [ ] **Step 5: Full local sanity — typecheck, lint, build**

Run: `npm run typecheck -w web && npm run lint -w web && npm run build -w web`
Expected: all exit 0; build emits `out/index.html` containing the strings `Your week right now`, `2:14 AM`, `Your website should be your best salesperson.`, and `Built before. Shipped before.` — verify with:
`grep -c "Your week right now" web/out/index.html` → Expected: `1` (or more)

- [ ] **Step 6: Commit**

```bash
git add web/app/page.tsx web/test/unit/page.test.tsx
git commit -m "feat(web): wire story beats 2-5 into the home page

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 10: E2E extension — scrub, reduced motion, 375 px

**Files:**
- Create: `web/e2e/story.spec.ts`

**Interfaces:**
- Consumes: the exported site in `web/out` (Playwright's webServer serves it), section aria-labels from Task 9, copy strings from Tasks 2 & 7. `web/e2e/home.spec.ts` is NOT modified — its 16 tests must stay green.
- Produces: 6 new test cases → 9 executed runs + 3 per-project skips across the two Playwright projects (`desktop-1440`, `mobile-375`).

Playwright visibility notes baked into these tests (learned in P1): `toBeVisible()` ignores CSS `opacity`, so readability is asserted by polling `getComputedStyle(...).opacity` on the ANIMATED wrapper (the `motion.li`/`motion.p`, not the text node — a child's computed opacity is always its own). `html { scroll-behavior: smooth }` means in-page `scrollTo` must pass `behavior: 'instant'`.

- [ ] **Step 1: Create `web/e2e/story.spec.ts`** (write it all — every test here fails against the current export only if Task 9 wasn't done; this task's TDD cycle is "run → all pass, and the OLD 16 still pass"):

```ts
import { expect, test, type Page } from '@playwright/test'

const BEATS = [
  { label: 'The chaos', heading: 'Your week right now' },
  { label: 'The turn', heading: 'Then, quietly, it all gets handled' },
  { label: 'The storefront', heading: 'And it looks gorgeous doing it' },
  { label: 'Proof', heading: 'Built before. Shipped before.' },
] as const

/** Scroll the window to the start or end of a pinned section, instantly
 * (the site sets scroll-behavior: smooth; tests must not animate there). */
async function scrollToPin(page: Page, label: string, position: 'start' | 'end') {
  await page.evaluate(
    ({ label, position }) => {
      const section = document.querySelector(`section[aria-label="${label}"]`)
      if (!section) throw new Error(`no section ${label}`)
      const rect = section.getBoundingClientRect()
      const top = rect.top + window.scrollY
      const target = position === 'start' ? top + 1 : top + rect.height - window.innerHeight
      window.scrollTo({ top: target, behavior: 'instant' })
    },
    { label, position },
  )
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
    // the four client-work entries wear the pill (exact: true — plain getByText
    // is a case-insensitive substring match and would also hit the outcome
    // lines that begin with "Client work…")
    await expect(proof.getByText('client work', { exact: true })).toHaveCount(4)
    // Ticker numbers flow from content/stats.json via the Zod stats module —
    // CountUp settles on the real values (toHaveText retries through the count-up).
    await expect(proof.locator('dd').nth(0)).toHaveText('15 days')
    await expect(proof.locator('dd').nth(1)).toHaveText('1M+')
    await expect(proof.locator('dd').nth(2)).toHaveText('4')
    await expect(proof.getByText('from idea to paying customers')).toBeVisible()
    await expect(proof.getByText('requests served every day')).toBeVisible()
    await expect(proof.getByText('countries where clients run my work')).toBeVisible()
  })
})

test.describe('scroll scrub (desktop pin)', () => {
  test.skip(({ isMobile }) => Boolean(isMobile), 'below 768px the beats ship the static light variant')

  test('chaos pins for multiple viewports and tumbles cards in', async ({ page }) => {
    await page.goto('/')
    const section = page.locator('section[aria-label="The chaos"]')
    const height = await section.evaluate((el) => el.getBoundingClientRect().height)
    const viewport = page.viewportSize()!
    // pinned: the section reserves ~3 viewport-heights of scroll runway
    expect(height).toBeGreaterThan(viewport.height * 2)

    const invoice = page.getByText('$1,850 — three weeks overdue')
    // at the top of the pin the card has not tumbled in yet…
    await scrollToPin(page, 'The chaos', 'start')
    await expect
      .poll(() => invoice.evaluate((el) => getComputedStyle(el.closest('.absolute')!).opacity))
      .toBe('0')
    // …and by the end of the pin every card has settled
    await scrollToPin(page, 'The chaos', 'end')
    await expect
      .poll(() => invoice.evaluate((el) => getComputedStyle(el.closest('.absolute')!).opacity))
      .toBe('1')
    await expect(page.getByText('47 unread. Six of them matter. Which six?')).toBeVisible()
  })

  test('turn types its bubbles and storefront completes its morph by pin end', async ({ page }) => {
    await page.goto('/')
    await scrollToPin(page, 'The turn', 'end')
    // TypedText has revealed the whole helper reply (first() = the typed
    // copy; a visually-hidden duplicate exists for screen readers)
    await expect(page.getByText('Want me to book you in?').first()).toBeVisible()
    await expect(
      page.getByText('You find out over coffee. Everything just… happened.').first(),
    ).toBeVisible()

    await scrollToPin(page, 'The storefront', 'end')
    // the morph layers carry data-morph anchors (see storefront.tsx MorphScene)
    await expect
      .poll(() =>
        page.locator('[data-morph="after"]').evaluate((el) => getComputedStyle(el).opacity),
      )
      .toBe('1')
    await expect
      .poll(() =>
        page.locator('[data-morph="before"]').evaluate((el) => getComputedStyle(el).opacity),
      )
      .toBe('0')
    await expect(page.getByText('Saturday has three openings left.')).toBeVisible()
    await expect(page.getByText('Your website should be your best salesperson.')).toBeVisible()
  })
})

test.describe('reduced motion — the story stays fully readable', () => {
  test('beats 2–5 ship static variants: no pinning, all copy settles visible', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    // no pinned emptiness anywhere: fallbacks never render the sticky pin
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
  })
})

test.describe('mobile-light (375px)', () => {
  test.skip(({ isMobile }) => !isMobile, 'desktop ships the pinned scrub scenes')

  test('beats 2–5 ship the light static variant and stay readable', async ({ page }) => {
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
  })
})
```

- [ ] **Step 2: Rebuild the export and run the FULL E2E suite (old + new)**

Run: `npm run build -w web && npm run test:e2e -w web`
Expected: `25 passed, 3 skipped` — the 16 P1 tests (including "loads with no console errors", which now sweeps all six beats) plus 9 new runs; the 3 skips are the per-project scrub/mobile gates. No failures.

- [ ] **Step 3: If anything fails** — use superpowers:systematic-debugging before touching assertions: re-run the failing project only (`npx playwright test e2e/story.spec.ts --project=desktop-1440` from `web/`), inspect `web/playwright-report`, and fix the component or the scroll math — never loosen a readability assertion to green a test.

- [ ] **Step 4: Commit**

```bash
git add web/e2e/story.spec.ts
git commit -m "test(e2e): story beats coverage - scrub, reduced motion, 375px

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 11: Final verification — full pipeline + budget gate + deploy note

**Files:**
- None expected. (Only touched if the budget gate trips — see the pre-approved ladder in Task 1.)

**Interfaces:**
- Consumes: everything above.
- Produces: a green P2 ready to merge; the measured budget number for the record.

- [ ] **Step 1: Full pipeline from a clean state**

Run (repo root):

```bash
npm run lint -w web && npm run typecheck -w web && npm run typecheck -w infra && npm run test:unit -w web && npm run build -w web && npm run test:e2e -w web
```

Expected: every stage exits 0 — lint clean, both typechecks clean, `Tests  68 passed`, build completes (with one `fetch-stats:` line during prebuild), E2E `25 passed, 3 skipped`.

- [ ] **Step 2: Budget gate (binding)**

Run: `npm run budget -w web`
Expected: `TOTAL: <n> KB gz (budget 150 KB) — OK` with n ≤ 150 and exit 0. Paste the full table into the task notes/PR description alongside the P1 baseline (140.8 KB) so the P2 delta is on the record.
If it prints `OVER BUDGET`: follow the Task 1 decision ladder exactly — 150–158 KB → one commit raising `BUDGET_KB` to 160 in `web/scripts/measure-bundle.mjs` with the measured table in the commit message; > 158 KB → cut TypedText first, then the Beat 4 scrub morph, re-measuring after each cut. Do not merge red.

- [ ] **Step 3: Confirm no stray changes to protected areas**

Run: `git status --short && git log --oneline main..HEAD -- infra scripts/deploy-prod.sh`
Expected: clean tree; the second command prints nothing (no commits touch `infra/` or `scripts/deploy-prod.sh`).

- [ ] **Step 4: Review gate**

Invoke the `review-branch` skill (whole branch vs `main`): verify scope (only the files in this plan's File Structure), no dependency changes in any lockfile beyond none-at-all, tests green, and every finding verified with `file:line` evidence before claiming done.

- [ ] **Step 5: Commit any verification residue and hand off**

```bash
git status --short
```
Expected: empty. If the budget ladder forced a change, it was already committed in Step 2's own commit.

**Deploy note (no action in this plan):** merging to `main` auto-deploys via the existing gated workflow (`AWS_DEPLOY_ROLE_ARN` secret → CDK deploy → S3 sync → CloudFront invalidation). The deploy build re-runs `prebuild`, so GitHub numbers refresh per deploy with the ambient token — with the committed `stats.json` as the permanent fallback. Nothing manual to do.

**Client-work entries (recorded, shipped in this phase):** the user's client URLs — all verified live 2026-07-10 — ship as `kind: 'client'` entries in `web/content/projects.ts`: Ditch Navigation (US, the "1M+ requests/day" story), Aimers International, Fidus Global, and RTOPilot (AU). The slot mechanism stays open: append future client sites the same way; the schema, gallery, and client pill already handle them, and the Task 2 client-slot test pins the shipped set.





