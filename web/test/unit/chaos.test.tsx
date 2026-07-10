import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Chaos } from '../../components/beats/chaos'
import { story } from '../../content/story'

// jsdom never matches (min-width: 768px), so these tests exercise the static
// fallback — exactly what mobile and reduced-motion visitors get. The pinned
// scrub path is covered by scroll-scene.test.tsx (unit) and e2e/story.spec.ts.
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
})
