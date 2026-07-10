import { describe, expect, it } from 'vitest'
import { CaseStudySchema, CasesSchema } from '../../content/schema'
import { cases } from '../../content/case-studies'

describe('CasesSchema (shipped content)', () => {
  it('parses the shipped module', () => {
    expect(CasesSchema.safeParse(cases).success).toBe(true)
  })

  it('ships the section header copy', () => {
    expect(cases.heading).toBe('Four builds, up close')
    expect(cases.lede.length).toBeGreaterThan(0)
  })

  it('ships exactly four case studies in PDF order', () => {
    expect(cases.items.map((item) => item.slug)).toEqual([
      'ditch-navigation',
      'quri',
      'extrack',
      'whycosmos',
    ])
  })

  it('carries the PDF headings verbatim', () => {
    expect(cases.items.map((item) => item.heading)).toEqual([
      'Helping mariners find safe water, a million times a day.',
      'A quiet watchtower for your business numbers.',
      'From idea to paying customers in 15 days.',
      'Course creation used to take a month. Now it takes ten days.',
    ])
  })

  it('wears the PDF category chips with their tones', () => {
    expect(cases.items.map((item) => item.category)).toEqual([
      { label: 'Client project · United States', tone: 'sky' },
      { label: 'My own product · AI for startups', tone: 'violet' },
      { label: 'My own product · Fintech', tone: 'violet' },
      { label: 'Product engineering · EdTech', tone: 'blush' },
    ])
  })

  it('gives every case exactly three stats, at least three blocks, and a tech line', () => {
    for (const item of cases.items) {
      expect(item.stats).toHaveLength(3)
      expect(item.blocks.length).toBeGreaterThanOrEqual(3)
      expect(item.tech.length).toBeGreaterThan(0)
    }
  })

  it('links every case out over https, matching the PDF sites', () => {
    expect(cases.items.map((item) => item.url)).toEqual([
      'https://www.ditchnavigation.com',
      'https://myquri.com',
      'https://myextrack.com',
      'https://whycosmos.com',
    ])
  })

  it('requires a committed screenshot with alt text on every case', () => {
    for (const item of cases.items) {
      expect(item.image.src).toMatch(/^\/shots\/[a-z0-9-]+\.(png|webp)$/)
      expect(item.image.alt.length).toBeGreaterThan(0)
      expect(item.image.width).toBeGreaterThan(0)
      expect(item.image.height).toBeGreaterThan(0)
    }
  })
})

describe('CaseStudySchema validation', () => {
  const valid = {
    slug: 'fixture-case',
    heading: 'A fixture case.',
    category: { label: 'Client project · Fixture', tone: 'sky' },
    blocks: [
      { label: 'The problem', body: 'p' },
      { label: 'What I built', body: 'b' },
      { label: 'The outcome', body: 'o' },
    ],
    stats: [
      { value: '1', label: 'one' },
      { value: '2', label: 'two' },
      { value: '3', label: 'three' },
    ],
    url: 'https://example.com',
    tech: 'React',
    image: { src: '/shots/fixture-case.png', width: 1200, height: 750, alt: 'Fixture site, live' },
  }

  it('accepts a valid case study', () => {
    expect(CaseStudySchema.safeParse(valid).success).toBe(true)
  })

  it('rejects a case without an image (required here, unlike ProjectSchema)', () => {
    const { image: _image, ...rest } = valid
    expect(CaseStudySchema.safeParse(rest).success).toBe(false)
  })

  it('rejects stats lists that are not exactly three long', () => {
    expect(
      CaseStudySchema.safeParse({ ...valid, stats: valid.stats.slice(0, 2) }).success,
    ).toBe(false)
    expect(
      CaseStudySchema.safeParse({
        ...valid,
        stats: [...valid.stats, { value: '4', label: 'four' }],
      }).success,
    ).toBe(false)
  })

  it('rejects fewer than three blocks', () => {
    expect(
      CaseStudySchema.safeParse({ ...valid, blocks: valid.blocks.slice(0, 2) }).success,
    ).toBe(false)
  })

  it('rejects a non-https url', () => {
    expect(
      CaseStudySchema.safeParse({ ...valid, url: 'http://example.com' }).success,
    ).toBe(false)
  })

  it('rejects an unknown chip tone', () => {
    expect(
      CaseStudySchema.safeParse({
        ...valid,
        category: { label: 'x', tone: 'amber' },
      }).success,
    ).toBe(false)
  })

  it('rejects a screenshot outside /shots/', () => {
    expect(
      CaseStudySchema.safeParse({
        ...valid,
        image: { ...valid.image, src: '/images/fixture-case.png' },
      }).success,
    ).toBe(false)
  })
})
