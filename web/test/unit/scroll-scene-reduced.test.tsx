import { act, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ScrollScene } from '../../components/ui/scroll-scene'
import { setPrefersReducedMotion, setViewportWide } from '../setup'

describe('ScrollScene under prefers-reduced-motion', () => {
  it('renders the static fallback even on a wide viewport', async () => {
    setPrefersReducedMotion(true)
    setViewportWide(true)
    const { container } = render(
      <ScrollScene
        ariaLabel="Demo scene"
        lengthSvh={3}
        scene={() => <p>SCENE</p>}
        fallback={<p>FALLBACK</p>}
      />,
    )
    await act(async () => {})
    expect(screen.getByText('FALLBACK')).toBeDefined()
    expect(screen.queryByText('SCENE')).toBeNull()
    expect(container.querySelector('.sticky')).toBeNull()
  })
})
