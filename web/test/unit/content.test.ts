import { describe, expect, it } from 'vitest'
import { profile } from '../../content/profile'
import { ProfileSchema, ServicesSchema } from '../../content/schema'
import { services } from '../../content/services'

const validProfile = {
  name: 'Hitesh Modi',
  siteUrl: 'https://hiteshmodi.in',
  metaDescription:
    'Beautiful websites and AI helpers that never sleep — built end-to-end by one engineer.',
  hero: {
    h1: 'A little magic for your business.',
    sub: 'Beautiful websites. AI helpers that never sleep. Built end-to-end by one engineer.',
    availability: 'Available for new projects',
    ctaLabel: 'Start your project',
    ctaHref: '#finale',
    scrollCue: 'show me how ↓',
  },
  finale: {
    heading: "Let's build your magic",
    email: 'mail@hiteshmodi.in',
    calUrl: 'https://cal.com/hiteshmodi',
  },
}

describe('ProfileSchema', () => {
  it('accepts a valid profile', () => {
    expect(ProfileSchema.safeParse(validProfile).success).toBe(true)
  })

  it('rejects a missing name', () => {
    const { name: _name, ...rest } = validProfile
    expect(ProfileSchema.safeParse(rest).success).toBe(false)
  })

  it('rejects a malformed cal.com URL', () => {
    const bad = { ...validProfile, finale: { ...validProfile.finale, calUrl: 'not-a-url' } }
    expect(ProfileSchema.safeParse(bad).success).toBe(false)
  })

  it('rejects non-https outbound links', () => {
    const bad = {
      ...validProfile,
      finale: { ...validProfile.finale, calUrl: 'http://cal.com/hiteshmodi' },
    }
    expect(ProfileSchema.safeParse(bad).success).toBe(false)
  })
})

describe('ServicesSchema', () => {
  it('rejects an empty services list', () => {
    expect(ServicesSchema.safeParse([]).success).toBe(false)
  })

  it('rejects a service with no deliverables', () => {
    const bad = [
      { slug: 'x', title: 'X', hook: 'x', deliverables: [], timeline: 'x', ctaLabel: 'x' },
    ]
    expect(ServicesSchema.safeParse(bad).success).toBe(false)
  })
})

describe('shipped content', () => {
  it('profile carries the approved beat 1 and beat 8 copy verbatim', () => {
    expect(profile.hero.h1).toBe('A little magic for your business.')
    expect(profile.hero.sub).toBe(
      'Beautiful websites. AI helpers that never sleep. Built end-to-end by one engineer.',
    )
    expect(profile.hero.ctaLabel).toBe('Start your project')
    expect(profile.hero.scrollCue).toBe('show me how ↓')
    expect(profile.finale.heading).toBe("Let's build your magic")
    expect(profile.finale.email).toBe('mail@hiteshmodi.in')
    expect(profile.finale.calUrl).toBe('https://cal.com/hiteshmodi')
  })

  it('ships exactly three valid services', () => {
    expect(ServicesSchema.parse(services)).toHaveLength(3)
  })

  it('uses https for every outbound link', () => {
    for (const url of [profile.siteUrl, profile.finale.calUrl]) {
      expect(url.startsWith('https://')).toBe(true)
    }
  })
})
