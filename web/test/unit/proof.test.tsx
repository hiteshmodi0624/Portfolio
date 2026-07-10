import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Proof } from '../../components/beats/proof'
import { ProofSchema, type ProofContent } from '../../content/schema'
import { proof } from '../../content/projects'

describe('Proof (beat 5)', () => {
  const renderProof = () => render(<Proof proof={proof} />)

  it('renders the heading and lede', () => {
    renderProof()
    expect(screen.getByRole('heading', { level: 2 }).textContent).toBe(
      'Built before. Shipped before.',
    )
    expect(
      screen.getByText(
        'Real products with real customers, built end-to-end. Every link below is live. Go click around.',
      ),
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

  it('labels every card by kind: four client-work chips, four my-own-product chips', () => {
    renderProof()
    expect(screen.getAllByText('client work')).toHaveLength(4)
    expect(screen.getAllByText('my own product')).toHaveLength(4)
  })

  it('renders a url pill on every card: www-stripped hostname, new tab, safe rel', () => {
    renderProof()
    const pills = screen.getAllByRole('link')
    expect(pills).toHaveLength(proof.projects.length)
    for (const pill of pills) {
      expect(pill.getAttribute('target')).toBe('_blank')
      expect(pill.getAttribute('rel')).toBe('noopener noreferrer')
      expect(pill.textContent).toMatch(/^[a-z0-9.-]+ ↗$/)
      expect(pill.textContent).not.toContain('www.')
    }
  })

  it('ships the Aimers International screenshot (approved capture), still no logo', () => {
    renderProof()
    const aimers = proof.projects.find((project) => project.slug === 'aimers-international')
    expect(aimers?.image).toEqual({
      src: '/shots/aimers-international.png',
      width: 1200,
      height: 750,
      alt: 'The Aimers International website, live',
    })
    // favicon is still unusable — the logo chip stays omitted
    expect(aimers?.logo).toBeUndefined()
    const shot = screen.getByRole('img', { name: 'The Aimers International website, live' })
    expect(shot.getAttribute('src')).toBe('/shots/aimers-international.png')
    expect(shot.getAttribute('loading')).toBe('lazy')
  })

  it('does not render the results ticker (it moved to the hero)', () => {
    const { container } = renderProof()
    expect(container.querySelectorAll('dd')).toHaveLength(0)
    expect(screen.queryByText('15 days')).toBeNull()
    expect(screen.queryByText('from idea to paying customers')).toBeNull()
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
    render(<Proof proof={galleryFixture} />)
    const shot = screen.getByRole('img', { name: 'With Image — live site' })
    expect(shot.getAttribute('src')).toBe('/shots/with-image.png')
    expect(shot.getAttribute('loading')).toBe('lazy')
    expect(shot.getAttribute('width')).toBe('1200')
    expect(shot.getAttribute('height')).toBe('750')
  })

  it('renders a logo chip beside the name when logo is present', () => {
    render(<Proof proof={galleryFixture} />)
    const logo = screen.getByRole('img', { name: 'With Image logo' })
    expect(logo.getAttribute('src')).toBe('/logos/with-image.png')
    expect(logo.getAttribute('loading')).toBe('lazy')
  })

  it('renders a logo chip without a screenshot header when only logo is present', () => {
    render(<Proof proof={galleryFixture} />)
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
    const { container } = render(<Proof proof={galleryFixture} />)
    expect(screen.getByRole('heading', { level: 3, name: 'Text Only' })).toBeDefined()
    // exactly three imgs in the whole gallery: with-image's screenshot + its
    // logo, plus logo-only's logo chip — text-only contributes none
    expect(container.querySelectorAll('img')).toHaveLength(3)
  })
})
