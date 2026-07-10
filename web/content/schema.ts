import { z } from 'zod'

/** Absolute URL that must use https (spec §6: all outbound links are https). */
const httpsUrl = z
  .url()
  .refine((value) => value.startsWith('https://'), { message: 'outbound links must be https' })

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

export const FinaleContentSchema = z.object({
  heading: z.string().min(1),
  email: z.email(),
  calUrl: httpsUrl,
})

export const ProfileSchema = z.object({
  name: z.string().min(1),
  siteUrl: httpsUrl,
  /** Meta description; SEO sweet spot enforced loosely. */
  metaDescription: z.string().min(20).max(170),
  hero: HeroContentSchema,
  finale: FinaleContentSchema,
})

export const ServiceSchema = z.object({
  slug: z.string().regex(/^[a-z][a-z-]*$/),
  title: z.string().min(1),
  hook: z.string().min(1),
  deliverables: z.array(z.string().min(1)).min(1),
  timeline: z.string().min(1),
  ctaLabel: z.string().min(1),
})

export const ServicesSchema = z.array(ServiceSchema).min(1)

/** P3.3: the services section's own copy — components never hardcode prose. */
export const ServicesIntroSchema = z.object({
  heading: z.string().min(1),
  lede: z.string().min(1),
})

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

export type HeroContent = z.infer<typeof HeroContentSchema>
export type FinaleContent = z.infer<typeof FinaleContentSchema>
export type Profile = z.infer<typeof ProfileSchema>
export type Service = z.infer<typeof ServiceSchema>
export type ServicesIntro = z.infer<typeof ServicesIntroSchema>
export type HumanContent = z.infer<typeof HumanSchema>
export type StoryContent = z.infer<typeof StorySchema>
export type Project = z.infer<typeof ProjectSchema>
export type ProofContent = z.infer<typeof ProofSchema>
export type Stats = z.infer<typeof StatsSchema>
export type TickerItem = z.infer<typeof TickerItemSchema>
