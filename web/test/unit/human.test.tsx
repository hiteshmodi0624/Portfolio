import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Human } from '../../components/beats/human'
import { human } from '../../content/human'

describe('Human (beat 7)', () => {
  const renderHuman = () => render(<Human human={human} />)

  it('renders the heading and every story paragraph', () => {
    renderHuman()
    expect(screen.getByRole('heading', { level: 2 }).textContent).toBe('One engineer, no circus')
    for (const paragraph of human.story) {
      expect(screen.getByText(paragraph)).toBeDefined()
    }
  })

  it('renders the tilted framed photo with alt and explicit dimensions', () => {
    renderHuman()
    const img = screen.getByRole('img', { name: human.photo.alt })
    expect(img.getAttribute('src')).toBe(human.photo.src)
    expect(img.getAttribute('width')).toBe(String(human.photo.width))
    expect(img.getAttribute('height')).toBe(String(human.photo.height))
    expect(img.getAttribute('loading')).toBe('lazy')
  })

  it('renders every fact card — micro-label and body', () => {
    renderHuman()
    expect(human.facts.length).toBeGreaterThanOrEqual(1)
    for (const fact of human.facts) {
      expect(screen.getByText(fact.label)).toBeDefined()
      expect(screen.getByText(fact.body)).toBeDefined()
    }
  })

  it('ships the nerdy bits open by default in a still-native <details> dark panel', () => {
    const { container } = renderHuman()
    const details = container.querySelector('details') as HTMLDetailsElement
    expect(details).not.toBeNull()
    // open by default but still a native disclosure (collapsible for free)
    expect(details.open).toBe(true)
    // PDF page 9 .nerdy treatment: dark ink panel, blush mono summary
    expect(details.className).toContain('bg-ink')
    const summary = details.querySelector('summary') as HTMLElement
    expect(summary.textContent).toBe(human.nerdyBits.label)
    expect(summary.className).toContain('text-blush')
    for (const item of human.nerdyBits.items) {
      expect(screen.getByText(item)).toBeDefined()
    }
  })

  it('renders the Off hours chess link — new tab, safe rel, AA-dark violet mono', () => {
    renderHuman()
    const link = screen.getByRole('link', { name: /chess\.com\/hiteshmodi0624/ })
    expect(link.getAttribute('href')).toBe('https://www.chess.com/member/hiteshmodi0624')
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toBe('noopener noreferrer')
    expect(link.textContent).toMatch(/ ↗$/)
    // #7C5CFF fails 4.5:1 at small mono size on the glass card; the
    // branch-established darker violet (see proof.tsx url pill) passes
    expect(link.className).toContain('text-[#6741D9]')
  })

  it('never pins: plain section, no sticky, no inline height', () => {
    const { container } = renderHuman()
    const section = container.querySelector('section[aria-label="The human"]') as HTMLElement
    expect(section).not.toBeNull()
    expect(section.querySelector('.sticky')).toBeNull()
    expect(section.style.height).toBe('')
  })
})
