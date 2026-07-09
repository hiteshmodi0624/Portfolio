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

export type HeroContent = z.infer<typeof HeroContentSchema>
export type FinaleContent = z.infer<typeof FinaleContentSchema>
export type Profile = z.infer<typeof ProfileSchema>
export type Service = z.infer<typeof ServiceSchema>
