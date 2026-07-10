import { act, render, screen } from '@testing-library/react'
import { MotionConfig } from 'motion/react'
import { describe, expect, it } from 'vitest'
import { Hero } from '../../components/beats/hero'
import { profile } from '../../content/profile'
import { ticker } from '../../content/ticker'
import { setPrefersReducedMotion } from '../setup'

const renderHero = () => render(<Hero hero={profile.hero} ticker={ticker} />)

describe('Hero', () => {
  it('renders the approved H1 copy in a level-1 heading', () => {
    renderHero()
    const h1 = screen.getByRole('heading', { level: 1 })
    // words are split into spans joined by non-breaking spaces
    const normalizedText = h1.textContent?.split(/\s+/).filter(Boolean).join(' ').trim()
    expect(normalizedText).toBe('A little magic for your business.')
  })

  it('renders sub copy and the availability badge', () => {
    renderHero()
    expect(
      screen.getByText(
        'Beautiful websites. AI helpers that never sleep. Built end-to-end by one engineer.',
      ),
    ).toBeDefined()
    expect(screen.getByText('Available for new projects')).toBeDefined()
  })

  it('renders dual CTAs: primary pill to #finale, quiet secondary to #work', () => {
    renderHero()
    const primary = screen.getByRole('link', { name: 'Start your project' })
    expect(primary.getAttribute('href')).toBe('#finale')
    const secondary = screen.getByRole('link', { name: 'See the work ↓' })
    expect(secondary.getAttribute('href')).toBe('#work')
  })

  it('no longer renders the old standalone scroll cue (folded into the secondary CTA)', () => {
    renderHero()
    expect(screen.queryByText('show me how ↓')).toBeNull()
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
        <Hero hero={profile.hero} ticker={ticker} />
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
    renderHero()
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

  it('renders the word "magic" with the animated gradient treatment (grad-word)', () => {
    renderHero()
    const h1 = screen.getByRole('heading', { level: 1 })
    const wordSpans = h1.querySelectorAll('span')
    const magicSpan = Array.from(wordSpans).find((span) =>
      span.textContent?.startsWith('magic'),
    )
    expect(magicSpan).toBeDefined()
    expect(magicSpan?.classList.contains('grad-word')).toBe(true)
  })

  it('renders the identity chip: 48px photo with real alt + name line (P3.2)', () => {
    renderHero()
    const img = screen.getByRole('img', { name: 'Portrait of Hitesh Modi' })
    expect(img.getAttribute('src')).toBe('/images/hitesh-96.jpg')
    expect(img.getAttribute('width')).toBe('48')
    expect(img.getAttribute('height')).toBe('48')
    expect(screen.getByText('Hitesh Modi')).toBeDefined()
    expect(screen.getByText(/builds these end-to-end, replies same day/)).toBeDefined()
  })

  it('renders the results shelf at final values with its labels (moved from proof)', () => {
    const { container } = renderHero()
    const values = Array.from(container.querySelectorAll('dd')).map((dd) =>
      dd.textContent?.trim(),
    )
    expect(values).toEqual(['15 days', '1M+', '4'])
    for (const item of ticker) {
      expect(screen.getByText(item.label)).toBeDefined()
    }
  })
})
