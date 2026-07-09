import { act, render, screen } from '@testing-library/react'
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

  it('renders h1 with reduced motion: no animation, no canvas, words immediately visible', async () => {
    setPrefersReducedMotion(true)
    const { container } = render(<Hero hero={profile.hero} />)
    // flush the mount effect that reads matchMedia
    await act(async () => {})
    const h1 = screen.getByRole('heading', { level: 1 })
    // Words should be immediately visible (no hidden animation state)
    const normalizedText = h1.textContent?.split(/\s+/).filter(Boolean).join(' ').trim()
    expect(normalizedText).toBe('A little magic for your business.')
    // Under reduced motion, SparkleField returns null, so no canvas
    expect(container.querySelector('canvas')).toBeNull()
    // Assert that NO word span carries hidden-state inline styles
    const wordSpans = h1.querySelectorAll('span')
    wordSpans.forEach((span) => {
      const transform = span.style.transform
      const opacity = span.style.opacity
      expect(transform === '' || transform === 'none').toBe(true)
      expect(opacity === '' || opacity === '1').toBe(true)
    })
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
