import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Services } from '../../components/beats/services'
import { ServicesIntroSchema, ServicesSchema } from '../../content/schema'
import { services, servicesIntro } from '../../content/services'

const fixtureIntro = ServicesIntroSchema.parse({
  heading: 'Ways in',
  lede: 'Pick one.',
})

const fixtureServices = ServicesSchema.parse([
  {
    slug: 'the-landing-page',
    title: 'Door One',
    hook: 'Hook one.',
    deliverables: ['Thing A', 'Thing B'],
    fit: 'Good if: you want door one.',
    timeline: 'about 2 weeks',
    ctaLabel: 'Book a call',
  },
  {
    slug: 'a-mystery-door',
    title: 'Door Two',
    hook: 'Hook two.',
    deliverables: ['Thing C'],
    fit: 'Good if: you want door two.',
    timeline: '1 week',
    ctaLabel: 'Book a call',
  },
])

describe('Services (beat 6)', () => {
  it('renders every field of every fixture service', () => {
    render(<Services intro={fixtureIntro} services={fixtureServices} />)
    expect(screen.getByRole('heading', { level: 2 }).textContent).toBe('Ways in')
    expect(screen.getByText('Pick one.')).toBeDefined()
    for (const service of fixtureServices) {
      expect(screen.getByRole('heading', { level: 3, name: service.title })).toBeDefined()
      expect(screen.getByText(service.hook)).toBeDefined()
      for (const item of service.deliverables) {
        expect(screen.getByText(item)).toBeDefined()
      }
      expect(screen.getByText(service.timeline)).toBeDefined()
    }
  })

  it('renders a fit line per door — full copy present, "Good if" lead bolded', () => {
    const { container } = render(<Services intro={fixtureIntro} services={fixtureServices} />)
    const fits = container.querySelectorAll('.service-fit')
    expect(fits).toHaveLength(2)
    fixtureServices.forEach((service, index) => {
      expect(fits[index]?.textContent).toBe(service.fit)
    })
    const leads = screen.getAllByText('Good if:')
    expect(leads).toHaveLength(2)
    for (const lead of leads) {
      expect(lead.tagName).toBe('STRONG')
    }
  })

  it('links every CTA to #finale', () => {
    render(<Services intro={fixtureIntro} services={fixtureServices} />)
    const ctas = screen.getAllByRole('link', { name: 'Book a call' })
    expect(ctas).toHaveLength(2)
    for (const cta of ctas) {
      expect(cta.getAttribute('href')).toBe('#finale')
    }
  })

  it('renders one decorative icon per door — aria-hidden, not focusable, with a fallback for unknown slugs', () => {
    const { container } = render(<Services intro={fixtureIntro} services={fixtureServices} />)
    const icons = container.querySelectorAll('svg')
    expect(icons).toHaveLength(2)
    icons.forEach((icon) => {
      expect(icon.getAttribute('aria-hidden')).toBe('true')
      expect(icon.getAttribute('focusable')).toBe('false')
    })
  })

  it('shows no price strings anywhere in the section', () => {
    const { container } = render(<Services intro={fixtureIntro} services={fixtureServices} />)
    expect(container.textContent).not.toMatch(/\$|₹|€|price/i)
  })

  it('renders the real shipped content: three doors', () => {
    render(<Services intro={servicesIntro} services={services} />)
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(3)
    expect(screen.getByRole('heading', { level: 3, name: 'The Landing Page' })).toBeDefined()
    expect(screen.getByRole('heading', { level: 3, name: 'The AI Employee' })).toBeDefined()
    expect(screen.getByRole('heading', { level: 3, name: 'The Full Build' })).toBeDefined()
  })

  it('ships a "Good if:" fit line on every door', () => {
    render(<Services intro={servicesIntro} services={services} />)
    expect(services.every((service) => service.fit.startsWith('Good if:'))).toBe(true)
    expect(screen.getAllByText('Good if:')).toHaveLength(3)
  })

  it('keeps the deliverables list in the DOM (CSS-only hover reveal — always present for touch/reduced-motion)', () => {
    const { container } = render(<Services intro={servicesIntro} services={services} />)
    const lists = container.querySelectorAll('.service-door-list')
    expect(lists).toHaveLength(3)
    expect(
      screen.getByText('A hand-crafted page designed around one goal: turning visitors into enquiries'),
    ).toBeDefined()
  })
})
