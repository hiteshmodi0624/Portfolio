import { act, render, screen } from '@testing-library/react'
import { MotionConfig } from 'motion/react'
import { describe, expect, it } from 'vitest'
import { Hero } from '../../components/beats/hero'
import { profile } from '../../content/profile'
import { setPrefersReducedMotion } from '../setup'

describe('Hero', () => {
  it('renders the approved H1 copy in a level-1 heading', () => {
    render(<Hero hero={profile.hero} />)
    const h1 = screen.getByRole('heading', { level: 1 })
    // words are split into spans joined by non-breaking spaces
    const normalizedText = h1.textContent?.split(/\s+/).filter(Boolean).join(' ').trim()
    expect(normalizedText).toBe('A little magic for your business.')
  })

  it('renders sub copy, availability badge, CTA, and scroll cue', () => {
    render(<Hero hero={profile.hero} />)
    expect(
      screen.getByText(
        'Beautiful websites. AI helpers that never sleep. Built end-to-end by one engineer.',
      ),
    ).toBeDefined()
    expect(screen.getByText('Available for new projects')).toBeDefined()
    const cta = screen.getByRole('link', { name: 'Start your project' })
    expect(cta.getAttribute('href')).toBe('#finale')
    expect(screen.getByText('show me how ↓')).toBeDefined()
  })

  // Reduced motion is applied by the page-level MotionConfig (see
  // components/motion-provider), which degrades transform-based movement
  // to an instant snap while the opacity fade still runs (spec §6). Motion's
  // own `useReducedMotion` lazily caches its very first matchMedia read
  // for the life of the module, so toggling the mocked media query
  // mid-suite can't be trusted to flip it in jsdom; `reducedMotion="always"`
  // exercises the same code path deterministically. The real OS-preference
  // wiring is covered end-to-end by the Playwright reduced-motion suite.
  it('under MotionConfig reducedMotion="always": no canvas, transform suppressed rather than merely delayed', async () => {
    setPrefersReducedMotion(true)
    const { container } = render(
      <MotionConfig reducedMotion="always">
        <Hero hero={profile.hero} />
      </MotionConfig>,
    )
    const h1 = screen.getByRole('heading', { level: 1 })
    // Give the spring transition a window to run, if it were going to.
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 80))
    })
    const normalizedText = h1.textContent?.split(/\s+/).filter(Boolean).join(' ').trim()
    expect(normalizedText).toBe('A little magic for your business.')
    // Under reduced motion, SparkleField returns null, so no canvas
    expect(container.querySelector('canvas')).toBeNull()
    // Every span's transform is already resolved to `none` — not merely
    // converging toward it. This fails if MotionConfig is removed, or if
    // per-span `reduce ? … : …` prop juggling is reintroduced.
    const wordSpans = h1.querySelectorAll('span')
    wordSpans.forEach((span) => {
      expect(span.style.transform === '' || span.style.transform === 'none').toBe(true)
    })
  })

  it('control: without a reduced-motion override, word transforms are still mid-animation at the same instant', async () => {
    render(<Hero hero={profile.hero} />)
    const h1 = screen.getByRole('heading', { level: 1 })
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 80))
    })
    const firstSpan = h1.querySelectorAll('span')[0]
    // Proves the "always" assertion above is a real discriminator, not an
    // artifact of jsdom never animating transforms in the first place.
    expect(firstSpan.style.transform).not.toBe('')
    expect(firstSpan.style.transform).not.toBe('none')
  })

  it('renders the word "magic" with text-violet class', () => {
    render(<Hero hero={profile.hero} />)
    const h1 = screen.getByRole('heading', { level: 1 })
    const wordSpans = h1.querySelectorAll('span')
    const magicSpan = Array.from(wordSpans).find((span) =>
      span.textContent?.startsWith('magic'),
    )
    expect(magicSpan).toBeDefined()
    expect(magicSpan?.classList.contains('text-violet')).toBe(true)
  })
})
