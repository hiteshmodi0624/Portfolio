import { act, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Storefront } from '../../components/beats/storefront'
import { story } from '../../content/story'
import { setPrefersReducedMotion, setViewportWide } from '../setup'

// P3.1: Storefront is a normal-flow section. jsdom (motion allowed) renders
// the stacked auto-morph layers at their resting state (before visible,
// after waiting at opacity 0 — jsdom's IntersectionObserver never fires);
// reduced motion renders the labelled side-by-side comparison.
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

  it('never pins: wide viewports get the same normal-flow section (P3.1)', async () => {
    setViewportWide(true)
    const { container } = renderStorefront()
    await act(async () => {})
    const section = container.querySelector('section[aria-label="The storefront"]') as HTMLElement
    expect(section.querySelector('.sticky')).toBeNull()
    expect(section.style.height).toBe('')
  })

  it('mounts the auto-morph layers with their data-morph anchors (P3.1)', () => {
    const { container } = renderStorefront()
    const before = container.querySelector('[data-morph="before"]') as HTMLElement
    const after = container.querySelector('[data-morph="after"]') as HTMLElement
    expect(before).not.toBeNull()
    expect(after).not.toBeNull()
    // resting state pre-entry: before visible, after waiting to crossfade in
    expect(before.style.opacity).toBe('1')
    expect(after.style.opacity).toBe('0')
  })

  it('renders the labelled side-by-side comparison under reduced motion', async () => {
    setPrefersReducedMotion(true)
    const { container } = renderStorefront()
    await act(async () => {})
    expect(container.querySelector('[data-morph="before"]')).toBeNull()
    expect(screen.getByText('before')).toBeDefined()
    expect(screen.getByText('after')).toBeDefined()
    expect(screen.getByText('Saturday has three openings left.')).toBeDefined()
  })
})
