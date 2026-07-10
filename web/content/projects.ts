import { ProofSchema, type ProofContent } from './schema'

/**
 * Beat 5 — "Built before. Shipped before."
 *
 * CLIENT-URL SLOT MECHANISM (in use): `kind: 'client'` entries are shipped
 * client work — all URLs verified live 2026-07-10. Append future client
 * sites the same way; the gallery renders whatever validates, no component
 * changes needed. Safewash's public site is live (https://www.safewash.co.in, verified 2026-07-10).
 *
 * Ditch Navigation is where the ticker's "1M+ requests a day" figure comes
 * from — the canonical number lives in content/stats.json (manual block);
 * keep that outcome line in sync with it.
 */
export const proof: ProofContent = ProofSchema.parse({
  heading: 'Built before. Shipped before.',
  lede: 'Real products with real customers, built end-to-end. Every link below is live. Go click around.',
  projects: [
    {
      slug: 'extrack',
      name: 'Extrack',
      tagline: 'Money tracking that answers back',
      outcome: 'From idea to paying customers in 15 days',
      url: 'https://myextrack.com',
      kind: 'product',
      image: { src: '/shots/extrack.png', width: 1200, height: 750, alt: 'The Extrack website, live' },
      logo: { src: '/logos/extrack.png', alt: 'Extrack logo' },
    },
    {
      slug: 'whycosmos',
      name: 'WhyCosmos',
      tagline: 'A learning platform built around curiosity',
      outcome: 'Lessons, progress, and payments in one place',
      url: 'https://whycosmos.com',
      kind: 'product',
      image: { src: '/shots/whycosmos.png', width: 1200, height: 750, alt: 'The WhyCosmos website, live' },
      logo: { src: '/logos/whycosmos.png', alt: 'WhyCosmos logo' },
    },
    {
      slug: 'quri',
      name: 'quri',
      tagline: 'The quiet watchtower for your business numbers',
      outcome: 'Spots trouble before customers ever notice',
      url: 'https://myquri.com',
      kind: 'product',
      image: { src: '/shots/quri.png', width: 1200, height: 750, alt: 'The quri website, live' },
      logo: { src: '/logos/quri.png', alt: 'quri logo' },
    },
    {
      slug: 'safewash',
      name: 'Safewash',
      tagline: 'Billing without the back-and-forth',
      outcome: 'Invoices for business customers, sent and settled on time',
      url: 'https://www.safewash.co.in',
      kind: 'product',
      image: { src: '/shots/safewash.png', width: 1200, height: 750, alt: 'The Safewash website, live' },
      logo: { src: '/logos/safewash.png', alt: 'Safewash logo' },
    },
    {
      slug: 'ditch-navigation',
      name: 'Ditch Navigation',
      tagline: 'Helps mariners find safe water',
      outcome: 'Client work in the US. Where the 1M+ requests a day come from.',
      url: 'https://www.ditchnavigation.com',
      kind: 'client',
      image: { src: '/shots/ditch-navigation.png', width: 1200, height: 750, alt: 'The Ditch Navigation website, live' },
      logo: { src: '/logos/ditch-navigation.png', alt: 'Ditch Navigation logo' },
    },
    {
      slug: 'aimers-international',
      name: 'Aimers International',
      tagline: 'The public face of an international consultancy',
      outcome: 'Taken from first sketch to live site',
      url: 'https://www.aimersinternational.com',
      kind: 'client',
      // Screenshot is the approved pdf-portfolio capture (resized to the
      // gallery's 1200x750). Only the logo chip stays omitted: the favicon
      // fetch still throws ("Request path contains unescaped characters").
      image: {
        src: '/shots/aimers-international.png',
        width: 1200,
        height: 750,
        alt: 'The Aimers International website, live',
      },
    },
    {
      slug: 'fidus-global',
      name: 'Fidus Global',
      tagline: 'A business site that gets to the point',
      outcome: 'Shipped, and still maintained today',
      url: 'https://www.fidusglobal.in',
      kind: 'client',
      image: { src: '/shots/fidus-global.png', width: 1200, height: 750, alt: 'The Fidus Global website, live' },
      logo: { src: '/logos/fidus-global.png', alt: 'Fidus Global logo' },
    },
    {
      slug: 'rtopilot',
      name: 'RTOPilot',
      tagline: 'Runs enrolments, schedules and invoices for Australian training providers',
      outcome: 'Saves the team 15+ hours of admin every week',
      url: 'https://www.rtopilot.com.au',
      kind: 'client',
      image: { src: '/shots/rtopilot.png', width: 1200, height: 750, alt: 'The RTOPilot website, live' },
      logo: { src: '/logos/rtopilot.png', alt: 'RTOPilot logo' },
    },
  ],
})
