import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Storefront } from '../../components/beats/storefront'
import { story } from '../../content/story'

// jsdom = static fallback path (before/after side by side, all copy readable).
describe('Storefront (beat 4)', () => {
  const renderStorefront = () => render(<Storefront storefront={story.storefront} />)

  it('renders the heading and the salesperson punchline', () => {
    renderStorefront()
    expect(screen.getByRole('heading', { level: 2 }).textContent).toBe(
      'And it looks gorgeous doing it',
    )
    expect(screen.getByText('Your website should be your best salesperson.')).toBeDefined()
  })

  it('renders the bland before-page mock', () => {
    renderStorefront()
    expect(screen.getByText('WELCOME TO OUR WEBSITE')).toBeDefined()
    expect(screen.getByText('We are committed to quality and service since 2009.')).toBeDefined()
  })

  it('renders the gorgeous after-page mock with its booking CTA', () => {
    renderStorefront()
    expect(screen.getByText('Saturday has three openings left.')).toBeDefined()
    expect(screen.getByText('Pick a time — it takes under a minute.')).toBeDefined()
    expect(screen.getByText('Book Saturday')).toBeDefined()
  })

  it('shows the metric at its final value with the improvement note', () => {
    const { container } = renderStorefront()
    // CountUp renders the final value statically (11 enquiries this week)
    expect(screen.getByText('11')).toBeDefined()
    expect(screen.getByText(/enquiries this week/)).toBeDefined()
    expect(screen.getByText('up from 2')).toBeDefined()
    const section = container.querySelector('section[aria-label="The storefront"]') as HTMLElement
    expect(section.querySelector('.sticky')).toBeNull()
  })
})
