import { describe, expect, it } from 'vitest'
import { human } from '../../content/human'
import { HumanSchema } from '../../content/schema'

const validHuman = {
  heading: 'One engineer, no circus',
  name: 'Hitesh Modi',
  story: ['First paragraph.', 'Second paragraph.'],
  nerdyBits: { label: 'the nerdy bits', items: ['AWS', 'MCP servers'] },
  facts: [{ label: 'Home base', body: 'Guwahati, India.' }],
  photo: {
    src: '/images/hitesh-crop-640.jpg',
    alt: 'Hitesh Modi — portrait',
    width: 640,
    height: 660,
  },
}

describe('HumanSchema', () => {
  it('accepts a valid human section', () => {
    expect(HumanSchema.safeParse(validHuman).success).toBe(true)
  })

  it('rejects a missing name', () => {
    const { name: _name, ...rest } = validHuman
    expect(HumanSchema.safeParse(rest).success).toBe(false)
  })

  it('rejects a single-paragraph story (needs at least two)', () => {
    expect(
      HumanSchema.safeParse({ ...validHuman, story: ['Only one paragraph.'] }).success,
    ).toBe(false)
  })

  it('rejects a photo without dimensions (CLS guard)', () => {
    const bad = {
      ...validHuman,
      photo: { src: '/images/hitesh-640.jpg', alt: 'Hitesh Modi — portrait' },
    }
    expect(HumanSchema.safeParse(bad).success).toBe(false)
  })

  it('rejects a photo outside /images/', () => {
    const bad = {
      ...validHuman,
      photo: { ...validHuman.photo, src: 'https://cdn.example.com/x.jpg' },
    }
    expect(HumanSchema.safeParse(bad).success).toBe(false)
  })

  it('rejects empty nerdy bits', () => {
    const bad = { ...validHuman, nerdyBits: { label: 'the nerdy bits', items: [] } }
    expect(HumanSchema.safeParse(bad).success).toBe(false)
  })

  it('rejects an empty facts list', () => {
    expect(HumanSchema.safeParse({ ...validHuman, facts: [] }).success).toBe(false)
  })

  it('rejects a fact without a body', () => {
    const bad = { ...validHuman, facts: [{ label: 'Home base' }] }
    expect(HumanSchema.safeParse(bad).success).toBe(false)
  })
})

describe('shipped human content', () => {
  it('parses and carries the approved heading, photo, and disclosure label', () => {
    expect(human.heading).toBe('One engineer, no circus')
    expect(human.name).toBe('Hitesh Modi')
    expect(human.story.length).toBeGreaterThanOrEqual(2)
    expect(human.nerdyBits.label).toBe('the nerdy bits')
    expect(human.nerdyBits.items.length).toBeGreaterThanOrEqual(1)
    expect(human.photo.src).toBe('/images/hitesh-crop-640.jpg')
    expect(human.photo.width).toBeGreaterThan(0)
    expect(human.photo.height).toBeGreaterThan(0)
  })

  it('ships the three PDF page 9 fact cards — home base, education, off hours', () => {
    expect(human.facts).toHaveLength(3)
    expect(human.facts.map((fact) => fact.label)).toEqual(['Home base', 'Education', 'Off hours'])
    expect(human.facts[0]?.body).toMatch(/Guwahati/)
    expect(human.facts[1]?.body).toMatch(/NIT Kurukshetra/)
    expect(human.facts[2]?.body).toMatch(/Chess/)
  })

  it('keeps the story jargon-free — the tech vocabulary lives in nerdyBits only', () => {
    for (const paragraph of human.story) {
      expect(paragraph).not.toMatch(/AWS|MCP|Lambda|serverless|agent infra|Next\.js/i)
    }
  })
})
