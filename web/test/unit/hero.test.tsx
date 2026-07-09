import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Hero } from '../../components/beats/hero'
import { profile } from '../../content/profile'

describe('Hero', () => {
  it('renders the approved H1 copy in a level-1 heading', () => {
    render(<Hero hero={profile.hero} />)
    const h1 = screen.getByRole('heading', { level: 1 })
    // words are split into spans joined by   non-breaking spaces
    expect(h1.textContent?.replace(/ /g, ' ').trim()).toBe(
      'A little magic for your business.',
    )
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
})
