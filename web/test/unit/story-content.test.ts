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

  it('pins dialogue copy with byte-exact typographic quotes', () => {
    // WhatsApp message — chaos card with curly quotes (left and right double quotation marks)
    const whatsappCard = story.chaos.cards.find((card) => card.id === 'whatsapp')
    expect(whatsappCard?.body).toBe('“Hi! Do you have anything free this Saturday?”')

    // Customer dialogue — turn event with curly quotes (left and right double quotation marks)
    const customerMessage = story.turn.events.find((event) => event.id === 'customer-message')
    expect(customerMessage?.text).toBe('“Hey — do you have anything free this Saturday?”')

    // Helper dialogue reply — turn event with curly quotes (left and right double quotation marks)
    const helperReply = story.turn.events.find((event) => event.id === 'helper-reply')
    expect(helperReply?.text).toBe('“We do — 10:30 on Saturday just opened up. Want me to book you in?”')
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
    // Safewash's public site went live 2026-07 (spec P3 §1) — every card links out now
    expect(proof.projects.find((project) => project.slug === 'safewash')?.url).toBe(
      'https://www.safewash.co.in',
    )
    expect(proof.projects.filter((project) => project.url === undefined)).toHaveLength(0)
  })
})
