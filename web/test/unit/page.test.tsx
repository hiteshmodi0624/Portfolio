import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import HomePage from '../../app/page'

describe('home page wiring', () => {
  it('renders all beats in story order (hero → chaos → turn → storefront → proof → human → finale)', () => {
    const { container } = render(<HomePage />)
    const labels = Array.from(container.querySelectorAll('main > section')).map((section) =>
      section.getAttribute('aria-label'),
    )
    expect(labels).toEqual([
      'Intro',
      'The chaos',
      'The turn',
      'The storefront',
      'Proof',
      'The human',
      'Contact',
    ])
  })
})
