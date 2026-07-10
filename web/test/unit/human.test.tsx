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

  it('tucks the nerdy bits into a native, collapsed <details>', () => {
    const { container } = renderHuman()
    const details = container.querySelector('details') as HTMLDetailsElement
    expect(details).not.toBeNull()
    expect(details.open).toBe(false)
    const summary = details.querySelector('summary') as HTMLElement
    expect(summary.textContent).toBe(human.nerdyBits.label)
    for (const item of human.nerdyBits.items) {
      expect(screen.getByText(item)).toBeDefined()
    }
  })

  it('never pins: plain section, no sticky, no inline height', () => {
    const { container } = renderHuman()
    const section = container.querySelector('section[aria-label="The human"]') as HTMLElement
    expect(section).not.toBeNull()
    expect(section.querySelector('.sticky')).toBeNull()
    expect(section.style.height).toBe('')
  })
})
