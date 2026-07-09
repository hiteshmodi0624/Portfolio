import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CountUp } from '../../components/ui/count-up'
import { GlassCard } from '../../components/ui/glass-card'
import { TiltCard } from '../../components/ui/tilt-card'

describe('GlassCard', () => {
  it('renders children inside a glass-styled div and merges className', () => {
    const { container } = render(
      <GlassCard className="p-6">
        <p>inside</p>
      </GlassCard>,
    )
    expect(screen.getByText('inside')).toBeDefined()
    const card = container.firstElementChild as HTMLElement
    expect(card.className).toContain('backdrop-blur')
    expect(card.className).toContain('p-6')
  })

  it('passes through arbitrary div attributes', () => {
    const { container } = render(<GlassCard data-testid="glass">x</GlassCard>)
    expect(container.querySelector('[data-testid="glass"]')).not.toBeNull()
  })
})

describe('CountUp', () => {
  // jsdom's IntersectionObserver stub never fires, so what renders here is
  // exactly what no-JS / reduced-motion / pre-scroll visitors get: the FINAL
  // value, always readable (spec §2 accessibility).
  it('renders the final value with plain notation', () => {
    render(<CountUp to={1850} />)
    expect(screen.getByText('1,850')).toBeDefined()
  })

  it('renders the final value with compact notation', () => {
    render(<CountUp to={1000000} notation="compact" />)
    expect(screen.getByText('1M')).toBeDefined()
  })
})

describe('TiltCard', () => {
  it('renders children with a resting rotation transform', () => {
    const { container } = render(
      <TiltCard restRotate={-2}>
        <p>card</p>
      </TiltCard>,
    )
    expect(screen.getByText('card')).toBeDefined()
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper.style.transform).toContain('rotate')
  })

  it('ignores touch pointers and zero-size rects without crashing (mobile-light)', () => {
    const { container } = render(
      <TiltCard>
        <p>card</p>
      </TiltCard>,
    )
    const wrapper = container.firstElementChild as HTMLElement
    const before = wrapper.style.transform
    fireEvent.pointerMove(wrapper, { pointerType: 'touch', clientX: 40, clientY: 40 })
    fireEvent.pointerMove(wrapper, { pointerType: 'mouse', clientX: 40, clientY: 40 })
    expect(wrapper.style.transform).toBe(before)
  })
})
