import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Turn } from '../../components/beats/turn'
import { story } from '../../content/story'

// jsdom = static fallback path (see chaos.test.tsx for the rationale).
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
