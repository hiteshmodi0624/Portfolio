import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Proof } from '../../components/beats/proof'
import { ProofSchema, type ProofContent } from '../../content/schema'
import { proof } from '../../content/projects'
import { ticker } from '../../content/ticker'

describe('Proof (beat 5)', () => {
  const renderProof = () => render(<Proof proof={proof} ticker={ticker} />)

  it('renders the heading and lede', () => {
    renderProof()
    expect(screen.getByRole('heading', { level: 2 }).textContent).toBe(
      'Built before. Shipped before.',
    )
    expect(
      screen.getByText('Real products with real customers — built end-to-end, not mocked up.'),
    ).toBeDefined()
  })

  it('renders all eight project cards with names and taglines', () => {
    renderProof()
    expect(proof.projects).toHaveLength(8)
    for (const project of proof.projects) {
      expect(screen.getByRole('heading', { level: 3, name: project.name })).toBeDefined()
      expect(screen.getByText(project.tagline)).toBeDefined()
    }
  })

  it('links Extrack with a safe external anchor and shows its outcome', () => {
    renderProof()
    expect(screen.getByText('From idea to paying customers in 15 days')).toBeDefined()
    const link = screen.getByRole('link', { name: /myextrack\.com/ })
    expect(link.getAttribute('href')).toBe('https://myextrack.com')
    expect(link.getAttribute('rel')).toContain('noopener')
    expect(link.getAttribute('target')).toBe('_blank')
  })

  it('marks the four client-work entries with the client pill', () => {
    renderProof()
    expect(screen.getAllByText('client work')).toHaveLength(4)
  })

  it('renders the results ticker at final values with its labels', () => {
    const { container } = renderProof()
    const values = Array.from(container.querySelectorAll('dd')).map((dd) =>
      dd.textContent?.trim(),
    )
    expect(values).toEqual(['15 days', '1M+', '4'])
    for (const item of ticker) {
      expect(screen.getByText(item.label)).toBeDefined()
    }
  })
})

describe('Proof gallery visuals (P3.4)', () => {
  const galleryFixture: ProofContent = ProofSchema.parse({
    heading: 'Built before. Shipped before.',
    lede: 'Fixture lede.',
    projects: [
      {
        slug: 'with-image',
        name: 'With Image',
        tagline: 't',
        outcome: 'o',
        url: 'https://example.com',
        kind: 'product',
        image: { src: '/shots/with-image.png', width: 1200, height: 750, alt: 'With Image — live site' },
        logo: { src: '/logos/with-image.png', alt: 'With Image logo' },
      },
      {
        slug: 'logo-only',
        name: 'Logo Only',
        tagline: 't',
        outcome: 'o',
        kind: 'product',
        logo: { src: '/logos/logo-only.png', alt: 'Logo Only logo' },
      },
      { slug: 'text-only', name: 'Text Only', tagline: 't', outcome: 'o', kind: 'product' },
    ],
  })

  it('renders a lazy screenshot header with explicit dimensions when image is present', () => {
    render(<Proof proof={galleryFixture} ticker={ticker} />)
    const shot = screen.getByRole('img', { name: 'With Image — live site' })
    expect(shot.getAttribute('src')).toBe('/shots/with-image.png')
    expect(shot.getAttribute('loading')).toBe('lazy')
    expect(shot.getAttribute('width')).toBe('1200')
    expect(shot.getAttribute('height')).toBe('750')
  })

  it('renders a logo chip beside the name when logo is present', () => {
    render(<Proof proof={galleryFixture} ticker={ticker} />)
    const logo = screen.getByRole('img', { name: 'With Image logo' })
    expect(logo.getAttribute('src')).toBe('/logos/with-image.png')
    expect(logo.getAttribute('loading')).toBe('lazy')
  })

  it('renders a logo chip without a screenshot header when only logo is present', () => {
    render(<Proof proof={galleryFixture} ticker={ticker} />)
    const logo = screen.getByRole('img', { name: 'Logo Only logo' })
    expect(logo.getAttribute('src')).toBe('/logos/logo-only.png')
    expect(logo.getAttribute('loading')).toBe('lazy')
    expect(logo.getAttribute('width')).toBe('20')
    expect(logo.getAttribute('height')).toBe('20')
    // scope to this project's own card: exactly one img (the logo chip) —
    // no screenshot header renders when image is absent, even with a logo
    const heading = screen.getByRole('heading', { level: 3, name: 'Logo Only' })
    const card = heading.closest('li')
    expect(card).not.toBeNull()
    expect(card!.querySelectorAll('img')).toHaveLength(1)
  })

  it('falls back to text-only when image and logo are absent', () => {
    const { container } = render(<Proof proof={galleryFixture} ticker={ticker} />)
    expect(screen.getByRole('heading', { level: 3, name: 'Text Only' })).toBeDefined()
    // exactly three imgs in the whole gallery: with-image's screenshot + its
    // logo, plus logo-only's logo chip — text-only contributes none
    expect(container.querySelectorAll('img')).toHaveLength(3)
  })
})
