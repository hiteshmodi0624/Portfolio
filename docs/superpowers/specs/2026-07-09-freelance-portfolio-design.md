# hiteshmodi.in — Freelance Portfolio Redesign (Design Spec)

**Date:** 2026-07-09
**Status:** Approved (user delegated final design calls after selecting direction)
**Supersedes:** `2026-05-30-portfolio-redesign.md` (job-seeking site — fully replaced)

## 1. Purpose & positioning

The current site sells Hitesh as a hireable employee. The new site sells freelance
services and must convert visitors into booked calls / inquiries.

- **Primary audience:** founders and small-business owners — including non-technical
  ones — who want AI in their business or a beautiful website that sells.
- **Secondary audience:** technical founders/teams wanting AI, agents, or full product
  builds. Served by a collapsed "nerdy bits" layer and the MCP easter egg, never by
  jargon in the main narrative.
- **Positioning statement (internal):** AI-native product engineer who ships full
  products and wires AI into businesses — proof: Extrack (paying customers), WhyCosmos,
  quri, Safewash-B2B, RTOPilot (Australia), client work in US/Indonesia/Singapore.
- **Voice:** warm, plain-spoken, confident. Zero dev jargon above the fold. Benefit-led.
- **No pricing anywhere.** Offers show scope + timeline; CTA is always "book a call".

## 2. Visual direction (user-selected)

**"Scroll Story Cinematic" narrative in a "Luminous Magic" skin.**

- **Palette (light-only in v1):** near-white base `#FDFCFB` with pastel gradient washes
  (lavender `#F5F3FF`, sky `#EEF7FF`, blush `#FDF2F8`); ink `#1E1B2E`; muted `#5B5773`;
  accents violet `#7C5CFF`, sky `#4DABF7`, blush `#F783AC`.
  **Color tells the story:** the chaos scene (beat 2) uses hot alert hues
  (`#FFA94D`, `#FF6B6B`); the "handled" scene (beat 3) resolves them into calm pastels.
- **Type:** Bricolage Grotesque (display), Inter (body), JetBrains Mono (nerdy bits
  only) — all via `next/font/google`, self-hosted at build (static-export safe).
- **Texture:** soft glass cards, tilted floating project shots, gentle sparkle
  particles (lightweight canvas/CSS — no three.js).
- **Accessibility:** WCAG AA. Violet `#7C5CFF` on white only for large text/decorative;
  body text always ink. Full `prefers-reduced-motion` support: scenes degrade to
  static layouts with simple fades. Semantic landmarks throughout.

## 3. The scroll story — 8 beats (approved)

One long home page. Beats 2–4 are the story; 5–8 convert.

| # | Beat | Content | Motion |
|---|------|---------|--------|
| 1 | **Hero** | "A little magic for your business." Sub: beautiful websites + AI helpers that never sleep, built end-to-end by one engineer. Availability badge, CTA *Start your project*, scroll cue *show me how ↓* | Words materialize; gradient breathes; sparkles drift, gently follow cursor |
| 2 | **The chaos** — "Your week right now" | Floating cards pile up: unanswered WhatsApp, overdue invoice, missed booking, 47 unread emails | Cards tumble in with physics, stack messily (scroll-driven) |
| 3 | **The turn** — "Then, quietly, it all gets handled" | 2:14 AM: customer message arrives, AI answers in 4s, booking lands, invoice sends, follow-up scheduled | Scroll-scrubbed: chaos cards fly into tidy stacks; chat bubbles type themselves |
| 4 | **The storefront** — "And it looks gorgeous doing it" | Bland generic page morphs into a beautiful one; conversion needle moves. "Your website should be your best salesperson." | Before→after morph tied to scroll; metrics tick up |
| 5 | **Proof** — "Built before. Shipped before." | Floating tilted gallery: Extrack (0→paying customers in 15 days), WhyCosmos, quri, Safewash, RTOPilot (AU), + client URLs (user to supply). Ticker: 15 days · 1M+ req/day · clients in 4 countries | Cards drift/tilt on hover; parallax; counters count up on entry |
| 6 | **Services** — three doors, no prices | **The Landing Page** (a site that sells, ~2 weeks) · **The AI Employee** (answers, books, invoices — wired into your tools) · **The Full Build** (idea → live product). Each: what you get, timeline, book-a-call CTA | Doors open on hover revealing contents |
| 7 | **Human** — "One engineer, no circus" | Photo (`web/public/images/hitesh.jpeg` — user-supplied 2026-07-09; strip EXIF + resize before shipping in P3), short story: builds with AI daily (that's why it's fast), clients in AU/US/SEA, same-day replies. Collapsed "the nerdy bits" expandable: AWS, MCP, agent infra — jargon lives here only | Restrained: photo tilt, text reveals |
| 8 | **Finale** — "Let's build your magic" | Cal.com embed + plain email fallback. Easter egg: "Ask Claude about me — add my MCP server." Footer: tools, glossary, socials | Hero sparkles return and gather around the CTA — loop closes |

## 4. Architecture

### App (rewrite, total nuke of old code)

- **Stack:** Next.js 15 App Router, `output: 'export'` (pure static), TypeScript strict,
  Tailwind CSS 4, Motion (framer-motion successor), Zod. No UI kit, no CSS-in-JS,
  no three.js. JS budget ~150KB gz; LCP < 2s.
- **Content layer:** all copy/data in typed `content/*.ts` modules validated by Zod
  schemas (`content/schema.ts`). Components are pure — content in via props. Single
  source of truth; the MCP server (P4) and llms.txt generation read the same modules.
- **Sections:** each beat = one self-contained component in `components/beats/`,
  no cross-imports between beats; shared primitives in `components/ui/`
  (SparkleField, GlassCard, TiltCard, CountUp, ScrollScene).
- **Motion system:** one `lib/motion.ts` with shared variants/springs; scroll scenes
  use Motion's `useScroll` + sticky pinning; every scene has a reduced-motion and
  a mobile-light variant.
- **Live product data (build-time):** `scripts/fetch-stats.ts` runs at build, writes
  `content/stats.json` (commit counts, projects shipped, etc.). Site stays static;
  numbers refresh per deploy. Failure mode: falls back to last committed stats.

### Infra (own CDK pattern)

- `infra/` — separate CDK workspace (TypeScript). Stack: private S3 bucket + CloudFront
  with OAC, ACM cert (us-east-1), Route53 records for hiteshmodi.in, http→https
  redirect, SPA-less static routing (`index.html` rewrite for directory URLs),
  long-cache immutable assets / short-cache HTML.
- **CI/CD:** GitHub Actions — lint, typecheck, unit tests, build, Playwright E2E
  against the export, then `cdk deploy` + S3 sync + CloudFront invalidation on main.
- **Cutover:** old Vercel site stays live until CloudFront is verified, then DNS
  switches. Rollback = point DNS back.

### Later-phase services (recorded, not designed here)

- **P3 lead form:** small Lambda (API GW or function URL) using the existing `relay`
  library (SES) for lead emails.
- **P4 MCP server:** `mcp.hiteshmodi.in` Lambda — read-only tools over the same
  content modules (about, projects, services, book-call link).
- **P5 analytics:** lightweight first-party beacon → Lambda → storage; funnel
  instrumentation ("portfolio as conversion proof"). No third-party pixels in v1.

## 5. Phases

1. **P1 — Foundation live on AWS:** scaffold, design system (tokens/type/palette),
   content schema + profile/services content, Beat 1 (hero) + Beat 8 (finale, mailto +
   cal.com link, no embed yet), CDK stack, CI deploy. Site live behind CloudFront.
2. **P2 — The story:** Beats 2–5 (chaos, turn, storefront, proof gallery) + live
   build-time stats. Needs client URLs from user.
3. **P3 — Convert:** Beat 6 services doors, Beat 7 human section, testimonials
   (user to supply quotes), cal.com embed, lead-form Lambda via relay.
4. **P4 — Magic:** animation polish pass, MCP server + easter egg, OG image,
   regenerated JSON-LD (Person + ProfessionalService), llms.txt, sitemap.
5. **P5 — Measure:** first-party funnel beacon, A/B hooks, tools/glossary rebuild
   (SEO satellites), Lighthouse CI budget.

## 6. Test specs (P1 — written first, must fail before implementation)

- **Content:** Zod schemas reject invalid content (missing name, malformed URLs,
  empty services); all outbound links are https.
- **Build:** static export emits `/` containing hero H1 text, meta description,
  canonical `https://hiteshmodi.in`, OG tags.
- **E2E (Playwright, against exported output):** hero renders with H1 + CTA; CTA
  scrolls/links correctly; finale email + cal.com links present; no console errors;
  renders at 375px and 1440px; honors `prefers-reduced-motion` (no scroll-pinned
  transforms applied).
- **Infra (CDK assertions):** bucket blocks public access; CloudFront uses OAC;
  viewer protocol redirects to https; HTML short-cache / assets immutable;
  Route53 alias targets the distribution.

## 7. Risks & mitigations

- **Scroll-scenes jank on mobile** → every scene ships a mobile-light variant;
  perf budget enforced in CI (P5 Lighthouse gate; manual check before).
- **Pastel contrast failures** → tokens locked in design system with contrast-checked
  pairs; violet never used for body text.
- **"Landing pages that convert" proof** → user supplies client URLs/testimonials
  (P2/P3 input); meanwhile the site itself is the proof and funnel tooling backs it.
- **Static export limits** → no server features anywhere in app code; dynamic needs
  (lead form, MCP) live in separate Lambdas behind their own endpoints.
- **Content accuracy** — old `data/*.ts` deleted (total nuke): dates/facts were
  re-verified from the 2026-07-09 repo + GitHub research reports before deletion;
  resume dates (Extrack May 2026–, WhyCosmos Oct 2025–, Digital Alpha Feb 2024–Oct
  2025) carried into new content modules.

## 8. Out of scope (v1)

Dark mode · blog · CMS · pricing · multi-page case-study routes (single page first;
case-study depth can become routes in a later cycle) · chat widget.
