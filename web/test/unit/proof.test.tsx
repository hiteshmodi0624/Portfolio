import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Proof } from '../../components/beats/proof'
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
