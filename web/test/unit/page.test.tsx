import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import HomePage from '../../app/page'
import { ticker } from '../../content/ticker'

describe('home page wiring', () => {
  it('renders all beats in story order (hero → chaos → turn → storefront → cases → proof → services → human → finale)', () => {
    const { container } = render(<HomePage />)
    const labels = Array.from(container.querySelectorAll('main > section')).map((section) =>
      section.getAttribute('aria-label'),
    )
    expect(labels).toEqual([
      'Intro',
      'The chaos',
      'The turn',
      'The storefront',
      'Case studies',
      'Proof',
      'Services',
      'The human',
      'Contact',
    ])
  })

  it('renders the results ticker inside the hero and nowhere else (no duplicated stats)', () => {
    const { container } = render(<HomePage />)
    const hero = container.querySelector('section[aria-label="Intro"]')
    expect(hero).not.toBeNull()
    for (const item of ticker) {
      const holders = Array.from(container.querySelectorAll('dt')).filter(
        (dt) => dt.textContent === item.label,
      )
      expect(holders).toHaveLength(1)
      expect(hero!.contains(holders[0])).toBe(true)
    }
    const proofSection = container.querySelector('section[aria-label="Proof"]')
    expect(proofSection).not.toBeNull()
    expect(proofSection!.querySelectorAll('dd')).toHaveLength(0)
  })

  it('gives the case-studies section the #work anchor the hero secondary CTA points to', () => {
    const { container } = render(<HomePage />)
    const work = container.querySelector('#work')
    expect(work).not.toBeNull()
    expect(work!.getAttribute('aria-label')).toBe('Case studies')
  })
})
