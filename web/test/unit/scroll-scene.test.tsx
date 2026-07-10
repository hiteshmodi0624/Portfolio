import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ScrollScene } from '../../components/ui/scroll-scene'
import { setViewportWide } from '../setup'

describe('ScrollScene', () => {
  it('renders the readable static fallback by default (narrow viewport / SSR shape)', () => {
    const { container } = render(
      <ScrollScene
        ariaLabel="Demo scene"
        lengthSvh={3}
        scene={() => <p>SCENE</p>}
        fallback={<p>FALLBACK</p>}
      />,
    )
    expect(screen.getByText('FALLBACK')).toBeDefined()
    expect(screen.queryByText('SCENE')).toBeNull()
    const section = container.querySelector('section[aria-label="Demo scene"]') as HTMLElement
    expect(section).not.toBeNull()
    // no pinned emptiness: no sticky pin, no multi-viewport height
    expect(section.querySelector('.sticky')).toBeNull()
    expect(section.style.height).toBe('')
  })

  it('upgrades to the pinned scrub scene on wide viewports', async () => {
    setViewportWide(true)
    const { container } = render(
      <ScrollScene
        ariaLabel="Demo scene"
        lengthSvh={3}
        scene={() => <p>SCENE</p>}
        fallback={<p>FALLBACK</p>}
      />,
    )
    await waitFor(() => expect(screen.queryByText('SCENE')).not.toBeNull())
    expect(screen.queryByText('FALLBACK')).toBeNull()
    const section = container.querySelector('section[aria-label="Demo scene"]') as HTMLElement
    expect(section.querySelector('.sticky')).not.toBeNull()
    expect(section.style.height).toBe('300svh')
  })
})
