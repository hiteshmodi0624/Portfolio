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

export type HeroContent = z.infer<typeof HeroContentSchema>
export type FinaleContent = z.infer<typeof FinaleContentSchema>
export type Profile = z.infer<typeof ProfileSchema>
export type Service = z.infer<typeof ServiceSchema>
export type StoryContent = z.infer<typeof StorySchema>
export type Project = z.infer<typeof ProjectSchema>
export type ProofContent = z.infer<typeof ProofSchema>
