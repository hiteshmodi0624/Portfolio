import { ServicesIntroSchema, ServicesSchema, type Service, type ServicesIntro } from './schema'

export const services: Service[] = ServicesSchema.parse([
  {
    slug: 'the-landing-page',
    title: 'The Landing Page',
    hook: 'A site that sells while you sleep.',
    deliverables: [
      'A hand-crafted page designed around one goal: turning visitors into enquiries',
      'Copy shaped with you — plain words, no jargon',
      'Fast, mobile-perfect, and measurable from day one',
    ],
    timeline: 'about 2 weeks',
    ctaLabel: 'Book a call',
  },
  {
    slug: 'the-ai-employee',
    title: 'The AI Employee',
    hook: 'Answers, books, and invoices — even at 2:14 AM.',
    deliverables: [
      'An AI helper wired into the tools you already use',
      'Replies to customers in seconds, books appointments, sends invoices',
      'You approve everything it says before it goes live',
    ],
    timeline: '3–4 weeks',
    ctaLabel: 'Book a call',
  },
  {
    slug: 'the-full-build',
    title: 'The Full Build',
    hook: 'From idea to live product, end-to-end.',
    deliverables: [
      'Product thinking, design, build, and launch — one engineer, no hand-offs',
      'AI woven in where it earns its keep',
      'Live on your own infrastructure, with a clear runbook',
    ],
    timeline: '6–10 weeks',
    ctaLabel: 'Book a call',
  },
])

/** Beat 6 section header (P3.3). Plain words, no prices, no jargon. */
export const servicesIntro: ServicesIntro = ServicesIntroSchema.parse({
  heading: 'Three ways to start',
  lede: 'Pick the door that fits. Every one of them ends with something real, live, and working for you.',
})
