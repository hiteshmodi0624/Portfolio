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
