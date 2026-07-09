import { act, render, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SparkleField } from '../../components/ui/sparkle-field'
import { setPrefersReducedMotion } from '../setup'

describe('SparkleField', () => {
  it('renders an aria-hidden canvas when motion is allowed', async () => {
    setPrefersReducedMotion(false)
    const { container } = render(<SparkleField />)
    await waitFor(() => expect(container.querySelector('canvas')).not.toBeNull())
    expect(container.querySelector('canvas')?.getAttribute('aria-hidden')).toBe('true')
  })

  it('renders nothing under prefers-reduced-motion', async () => {
    setPrefersReducedMotion(true)
    const { container } = render(<SparkleField />)
    // flush the mount effect that reads matchMedia
    await act(async () => {})
    expect(container.firstChild).toBeNull()
  })
})
