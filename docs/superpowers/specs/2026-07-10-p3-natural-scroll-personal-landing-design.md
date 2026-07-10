# hiteshmodi.in — P3: Natural Scroll + Personal Landing Page (Design Spec)

**Date:** 2026-07-10
**Status:** Approved (user selected all directions via brainstorm 2026-07-10)
**Extends:** `2026-07-09-freelance-portfolio-design.md` (P3 cycle; scroll rework added,
cal.com embed / lead-form Lambda / testimonials deferred to next cycle)

## 1. Problem

User feedback on the P2 site:

1. **Scroll feels hijacked.** Chaos, Turn, and Storefront each pin the viewport for
   300svh of wheel travel (~9 screen-heights pinned back-to-back). Visitors fight the
   page.
2. **Doesn't read as an individual's landing page.** The name "Hitesh Modi" appears
   nowhere on screen; no photo, no about section. `content/services.ts` exists but is
   rendered by nothing; Beat 7 (human) was never built.
3. **Not enough visuals.** Proof cards are text-only; no site screenshots, no logos.
   Safewash card has no link — its public site now exists: `https://www.safewash.co.in`.

Goal: keep the "Luminous Magic" wow, return scroll control to the visitor, and make the
page land for non-technical founders.

## 2. Decisions (user-selected)

| Question | Decision |
|---|---|
| Scroll mechanics | **Unpin everything.** No pinned/scrubbed scenes anywhere. Scenes animate on viewport entry (time-driven). |
| Identity | **Face in hero + full human section.** Photo chip + name in hero; Beat 7 "one engineer, no circus" section lower down. |
| Proof visuals | **Screenshots + logo chips.** Real site screenshots on tilted cards, favicon/logo chip beside each name. |
| Cycle scope | **Look & feel + services now.** cal.com embed, lead-form Lambda, testimonials → next cycle. |

## 3. Design

### 3.1 Scroll rework (the fix)

- Delete the pin/scrub system: `components/ui/scroll-scene.tsx` and its unit tests are
  removed once no beat imports them. The `supportsFlags` ScrollTimeline workaround goes
  with it.
- **Chaos:** normal-flow section. Cards tumble in with staggered spring physics
  (~1.5s total choreography) via `whileInView` (fire once). Current static fallback
  layout is the base; entrance animation richened.
- **Turn:** normal-flow. Chat bubbles type themselves **time-driven** — `TypedText`
  converts from progress-driven to timer-driven when the section enters view; event
  cards cascade after their bubble.
- **Storefront:** normal-flow. Before→after morph auto-plays ~2s after entering view
  (crossfade + conversion needle sweep). Plays once per page load.
- Page length drops ~1250vh → ~700vh desktop.
- `html { scroll-behavior: smooth }` **stays** — it affects anchor clicks only, not
  wheel input; it was never the hijack.
- **Reduced motion:** every scene keeps a static/simple-fade variant (today's
  fallbacks, promoted). Mobile gets the same time-driven animations (they're cheap;
  no scrub, no pinning) unless perf testing says otherwise.

### 3.2 Hero identity (Beat 1 amendment)

Under the subhead, above the CTA: round photo chip (~48px) + line
**"Hitesh Modi** · builds these end-to-end, replies same day". Headline, availability
badge, CTA unchanged. Asset: `public/images/hitesh.jpeg` (858KB, EXIF intact) is
processed once — EXIF stripped, resized, exported as webp (~48px and ~640px variants),
committed; original stays out of the served bundle.

### 3.3 Services — Beat 6 (new)

`components/beats/services.tsx` renders the existing (currently unconsumed)
`content/services.ts` through props. Three glass "doors" in a row (stack on mobile):
**The Landing Page** · **The AI Employee** · **The Full Build**. Each shows an inline
SVG icon (hand-rolled, no icon library), plain-language what-you-get list, timeline,
and a "Book a call" CTA linking to `#finale`. Hover lifts the card and reveals the
list (revealed by default on touch/reduced-motion). No prices, no jargon.

### 3.4 Human — Beat 7 (new)

`components/beats/human.tsx` — "One engineer, no circus." Tilted glass-framed photo
(640px variant), short story: builds with AI daily (that's why it's fast), clients in
AU/US/SEA, same-day replies. Collapsed "the nerdy bits" as a native `<details>`
element (a11y for free) holding the tech vocabulary (AWS, MCP, agent infra). Content
comes from a new `human` module in `content/` validated by a new `HumanSchema` in
`content/schema.ts` (name, story paragraphs, nerdy bits list, photo path + alt).

### 3.5 Proof gallery upgrade (Beat 5 amendment)

- `ProjectSchema` gains optional `image` (screenshot path + dimensions + alt) and
  `logo` (chip path + alt) fields.
- New `scripts/capture-shots.ts`: Playwright (already a dev dep) visits each project
  URL, captures a 1200×750 screenshot → `public/shots/<slug>.webp`, and downloads the
  site favicon → `public/logos/<slug>.png`. **Run manually** (`npm run capture:shots`),
  assets committed — build/CI never touches the network for these. Failure on one site
  skips it with a warning (card falls back to text-only rendering).
- Proof cards: tilted screenshot header on top, logo chip beside name. Images
  `loading="lazy"` with explicit width/height (no CLS).
- Safewash: `url: 'https://www.safewash.co.in'` added; stale "no public site" comment
  removed; gets screenshot + logo like the rest.

### 3.6 Page order

Hero → Chaos → Turn → Storefront → Proof → **Services** → **Human** → Finale
(spec beats 1-8 complete except testimonials/cal.com, deferred).

## 4. Architecture notes

- **No new dependencies.** Motion v12 `whileInView` + variants covers everything;
  Playwright (existing dev dep) powers the capture script; image processing is a
  one-time local operation (`sips`/`cwebp`), outputs committed.
- Beats stay self-contained (no cross-imports); content flows in via typed props from
  Zod-validated `content/*.ts` modules — same pattern as P1/P2.
- Bundle: removing scrub logic shrinks JS; screenshots are lazy images, not JS.
  160KB gz budget unchanged.

## 5. Phases (each independently shippable, tests green per phase)

1. **P3.1 — Natural scroll:** unpin chaos/turn/storefront, time-driven choreography,
   delete scroll-scene, rewrite pin-dependent E2E tests. Plus Safewash URL (one-line).
2. **P3.2 — Identity:** hero photo chip + name line; human section (content module,
   schema, component, processed photos).
3. **P3.3 — Services doors:** services beat component + icons, wired into page.
4. **P3.4 — Gallery visuals:** schema fields, capture script, screenshot/logo assets,
   proof card upgrade.

## 6. Test specs (written first, must fail before implementation)

**P3.1**
- E2E: `main` contains zero `.sticky` elements at 1440px and 375px, motion and
  reduced-motion alike; total page height < 8 × viewport height (desktop, motion on).
- E2E: chaos cards / turn bubbles / storefront "after" panel reach opacity 1 after
  scrolling each section into view (no further scrolling needed — proves time-driven).
- E2E: reduced-motion still settles all copy at opacity 1.
- Unit: `TypedText` types full string over time when triggered (fake timers), renders
  full string immediately under reduced motion.
- Unit: Safewash project entry has https URL.
- Existing `story.spec.ts` pin assertions (section height > 2×viewport, scrub
  start/end opacity) are deleted/rewritten — they pin the old behavior.

**P3.2**
- E2E: hero renders "Hitesh Modi" text and a photo `img` with non-empty alt.
- E2E: human section renders heading, photo, and a `<details>` that opens on click.
- Unit: `HumanSchema` rejects missing name/story/photo; content module parses.

**P3.3**
- E2E: services section renders exactly 3 doors, each with heading, timeline text and
  a CTA linking to `#finale`; no `$`/price strings anywhere in section.
- Unit: services component renders all fields from a fixture; icons have aria-hidden.

**P3.4**
- Unit: `ProjectSchema` accepts entries with/without `image`+`logo`; rejects malformed
  paths; card component renders text-only fallback when image absent.
- E2E: proof cards with images render `img[loading="lazy"]` with width+height attrs;
  Safewash card links to `https://www.safewash.co.in`.

## 7. Risks & mitigations

- **Auto-playing scenes missed by fast scrollers** → animations fire `whileInView`
  with `once: true` and conservative viewport margins; content is legible mid-animation
  (no long opacity-0 holds).
- **Screenshot staleness** → capture script is re-runnable any time; assets in git so
  diffs are visible.
- **Photo quality/size** → processed variants committed; 858KB original never served.
- **Favicon quality varies per site** → logo field optional; chip omitted when the
  favicon is unusable.

## 8. Out of scope (this cycle)

cal.com embed · lead-form Lambda (relay/SES) · testimonials (blocked on user quotes) ·
dark mode · P4 MCP/OG/llms.txt · P5 analytics.
