import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Cases } from '../../components/beats/cases'
import { cases } from '../../content/case-studies'

const HOSTS = ['ditchnavigation.com', 'myquri.com', 'myextrack.com', 'whycosmos.com']

describe('Cases (deep case studies)', () => {
  const renderCases = () => render(<Cases cases={cases} />)

  it('renders the section header inside a labelled section', () => {
    const { container } = renderCases()
    expect(container.querySelector('section[aria-label="Case studies"]')).not.toBeNull()
    expect(screen.getByRole('heading', { level: 2 }).textContent).toBe('Four builds, up close')
    expect(screen.getByText(cases.lede)).toBeDefined()
  })

  it('renders all four case headings as h3', () => {
    renderCases()
    for (const item of cases.items) {
      expect(screen.getByRole('heading', { level: 3, name: item.heading })).toBeDefined()
    }
  })

  it('numbers each case with a mono eyebrow', () => {
    renderCases()
    for (const eyebrow of ['Case study 01', 'Case study 02', 'Case study 03', 'Case study 04']) {
      expect(screen.getByText(eyebrow)).toBeDefined()
    }
  })

  it('renders one category chip per case', () => {
    renderCases()
    for (const item of cases.items) {
      expect(screen.getByText(item.category.label)).toBeDefined()
    }
  })

  it('renders every block label and body', () => {
    renderCases()
    for (const item of cases.items) {
      for (const block of item.blocks) {
        expect(screen.getAllByText(block.label).length).toBeGreaterThan(0)
        expect(screen.getByText(block.body)).toBeDefined()
      }
    }
  })

  it('renders all three stat values and labels per case', () => {
    renderCases()
    for (const item of cases.items) {
      for (const stat of item.stats) {
        expect(screen.getAllByText(stat.value).length).toBeGreaterThan(0)
        expect(screen.getByText(stat.label)).toBeDefined()
      }
    }
  })

  it('renders four safe "see it live" visit links with the right hrefs', () => {
    renderCases()
    const links = screen.getAllByRole('link', { name: /see it live/ })
    expect(links).toHaveLength(4)
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      'https://www.ditchnavigation.com',
      'https://myquri.com',
      'https://myextrack.com',
      'https://whycosmos.com',
    ])
    for (const link of links) {
      expect(link.getAttribute('target')).toBe('_blank')
      expect(link.getAttribute('rel')).toBe('noopener noreferrer')
    }
  })

  it('names the visited domain, www-stripped, inside each visit link', () => {
    renderCases()
    const links = screen.getAllByRole('link', { name: /see it live/ })
    HOSTS.forEach((host, index) => {
      expect(links[index].textContent).toContain(host)
      expect(links[index].textContent).not.toContain('www.')
    })
  })

  it('shows the hostname pill in each browser bar (exact text, distinct from the visit link)', () => {
    renderCases()
    for (const host of HOSTS) {
      // exact match hits only the bar pill; the visit link's text is
      // "see it live → host" and never matches exactly
      expect(screen.getByText(host, { exact: true })).toBeDefined()
    }
  })

  it('renders each screenshot lazily with explicit dimensions', () => {
    renderCases()
    for (const item of cases.items) {
      const shot = screen.getByRole('img', { name: item.image.alt })
      expect(shot.getAttribute('src')).toBe(item.image.src)
      expect(shot.getAttribute('loading')).toBe('lazy')
      expect(shot.getAttribute('width')).toBe(String(item.image.width))
      expect(shot.getAttribute('height')).toBe(String(item.image.height))
    }
  })

  it('renders the mono tech line per case', () => {
    renderCases()
    for (const item of cases.items) {
      expect(screen.getByText(item.tech)).toBeDefined()
    }
  })
})
