import { act, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Finale } from '../../components/beats/finale'
import { profile } from '../../content/profile'
import { setPrefersReducedMotion } from '../setup'

describe('Finale', () => {
  it('renders the heading, mailto link, and cal.com link', () => {
    render(<Finale finale={profile.finale} />)
    expect(screen.getByRole('heading', { level: 2 }).textContent).toBe("Let's build your magic")

    const mail = screen.getByRole('link', { name: 'mail@hiteshmodi.in' })
    expect(mail.getAttribute('href')).toBe('mailto:mail@hiteshmodi.in')

    const cal = screen.getByRole('link', { name: 'Book a call' })
    expect(cal.getAttribute('href')).toBe('https://cal.com/hiteshmodi')
    expect(cal.getAttribute('rel')).toContain('noopener')
  })

  it('anchors the section as #finale for the hero CTA', () => {
    const { container } = render(<Finale finale={profile.finale} />)
    expect(container.querySelector('section#finale')).not.toBeNull()
  })

  it('renders heading with reduced motion: no animation, no canvas, text immediately visible', async () => {
    setPrefersReducedMotion(true)
    const { container } = render(<Finale finale={profile.finale} />)
    // flush the mount effect that reads matchMedia
    await act(async () => {})
    // Heading should be immediately visible (no hidden animation state)
    const h2 = screen.getByRole('heading', { level: 2 })
    expect(h2.textContent).toBe("Let's build your magic")
    // Under reduced motion, SparkleField returns null, so no canvas
    expect(container.querySelector('canvas')).toBeNull()
  })
})
