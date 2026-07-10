import { act, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Turn, TypedText } from '../../components/beats/turn'
import { story } from '../../content/story'
import { setViewportWide } from '../setup'

// P3.1: Turn is a normal-flow section on every viewport — no ScrollScene.
// jsdom's IntersectionObserver stub never fires, so `play` stays false and
// bubbles hold their whileInView "hidden" state; copy is still in the DOM
// (typed bubbles always carry an sr-only full-sentence copy).
describe('Turn (beat 3)', () => {
  const renderTurn = () => render(<Turn turn={story.turn} cards={story.chaos.cards} />)

  it('renders the heading, lede, and the 2:14 AM badge', () => {
    renderTurn()
    expect(screen.getByRole('heading', { level: 2 }).textContent).toBe(
      'Then, quietly, it all gets handled',
    )
    expect(screen.getByText('While you were asleep:')).toBeDefined()
    // '2:14 AM' appears twice by design: the header badge and the customer
    // message meta — getAllByText, not getByText
    expect(screen.getAllByText('2:14 AM').length).toBeGreaterThanOrEqual(1)
  })

  it('renders every event fully readable, including the 4-second reply meta', () => {
    const { container } = renderTurn()
    for (const event of story.turn.events) {
      expect(screen.getByText(event.text)).toBeDefined()
    }
    expect(screen.getByText('Answered in 4 seconds')).toBeDefined()
    const section = container.querySelector('section[aria-label="The turn"]') as HTMLElement
    expect(section.querySelector('.sticky')).toBeNull()
  })

  it('shows the beat-2 cards resolved into a tidy calm stack', () => {
    renderTurn()
    // first four chaos cards appear as tidied mini-cards (titles only)
    expect(screen.getByText('WhatsApp · 11:47 PM')).toBeDefined()
    expect(screen.getByText('Invoice #114')).toBeDefined()
    expect(screen.getByText('Missed call · new customer')).toBeDefined()
    expect(screen.getByText('Inbox')).toBeDefined()
  })

  it('renders the closer line', () => {
    renderTurn()
    expect(screen.getByText('You find out over coffee. Everything just… happened.')).toBeDefined()
  })
})

describe('Turn — never pins (P3.1)', () => {
  it('wide viewports get the same normal-flow section', async () => {
    setViewportWide(true)
    const { container } = render(<Turn turn={story.turn} cards={story.chaos.cards} />)
    await act(async () => {})
    const section = container.querySelector('section[aria-label="The turn"]') as HTMLElement
    expect(section.querySelector('.sticky')).toBeNull()
    expect(section.style.height).toBe('')
  })
})

describe('TypedText (P3.1 — timer-driven)', () => {
  const visibleText = (container: HTMLElement) =>
    (container.querySelector('span[aria-hidden="true"]') as HTMLElement).textContent

  it('types the full string over time once play is true', () => {
    vi.useFakeTimers()
    try {
      const { container } = render(
        <TypedText text="Hello there" play reducedMotion={false} startDelayMs={100} msPerChar={20} />,
      )
      expect(visibleText(container)).toBe('')
      // mid-flight: delay (100ms) + 3 chars x 20ms
      act(() => {
        vi.advanceTimersByTime(160)
      })
      expect(visibleText(container)).toBe('Hel')
      // completion: the remaining 8 chars + slack
      act(() => {
        vi.advanceTimersByTime(20 * 8 + 40)
      })
      expect(visibleText(container)).toBe('Hello there')
    } finally {
      vi.useRealTimers()
    }
  })

  it('does not type before play flips true', () => {
    vi.useFakeTimers()
    try {
      const { container } = render(
        <TypedText text="Hello there" play={false} reducedMotion={false} msPerChar={20} />,
      )
      act(() => {
        vi.advanceTimersByTime(2000)
      })
      expect(visibleText(container)).toBe('')
    } finally {
      vi.useRealTimers()
    }
  })

  it('renders the full string immediately under reduced motion', () => {
    const { container } = render(<TypedText text="Hello there" play reducedMotion />)
    expect(visibleText(container)).toBe('Hello there')
  })

  it('always keeps a screen-reader copy of the full sentence', () => {
    render(<TypedText text="Hello there" play={false} reducedMotion={false} />)
    const srCopy = screen.getByText('Hello there')
    expect(srCopy.className).toContain('sr-only')
  })
})
