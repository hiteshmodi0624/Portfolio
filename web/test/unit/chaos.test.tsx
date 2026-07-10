import { act, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Chaos } from '../../components/beats/chaos'
import { story } from '../../content/story'
import { setViewportWide } from '../setup'

// P3.1: Chaos is a normal-flow section on every viewport — no ScrollScene, no
// pinning. jsdom's IntersectionObserver stub never fires, so cards render in
// their whileInView "hidden" state; all copy is still in the DOM (what no-JS
// visitors get). Entry choreography is proven in e2e/story.spec.ts.
describe('Chaos (beat 2)', () => {
  it('renders the heading and lede', () => {
    render(<Chaos chaos={story.chaos} />)
    expect(screen.getByRole('heading', { level: 2 }).textContent).toBe('Your week right now')
    expect(
      screen.getByText("Running the business is the part you love. It's everything else that piles up."),
    ).toBeDefined()
  })

  it('renders every chaos card fully readable with no pinned emptiness', () => {
    const { container } = render(<Chaos chaos={story.chaos} />)
    for (const card of story.chaos.cards) {
      expect(screen.getByText(card.body)).toBeDefined()
    }
    const section = container.querySelector('section[aria-label="The chaos"]') as HTMLElement
    expect(section).not.toBeNull()
    expect(section.querySelector('.sticky')).toBeNull()
    expect(section.style.height).toBe('')
  })

  it('paints cards in the hot alert hues (spec §2 palette story)', () => {
    const { container } = render(<Chaos chaos={story.chaos} />)
    expect(container.querySelector('.bg-chaos-red\\/15')).not.toBeNull()
    expect(container.querySelector('.bg-chaos-amber\\/15')).not.toBeNull()
  })

  it('never pins: wide viewports get the same normal-flow section (P3.1)', async () => {
    setViewportWide(true)
    const { container } = render(<Chaos chaos={story.chaos} />)
    await act(async () => {})
    const section = container.querySelector('section[aria-label="The chaos"]') as HTMLElement
    expect(section.querySelector('.sticky')).toBeNull()
    expect(section.style.height).toBe('')
    for (const card of story.chaos.cards) {
      expect(screen.getByText(card.body)).toBeDefined()
    }
  })
})
