import { describe, expect, it } from 'vitest'
import { fadeRise, springSoft, staggerContainer } from '../../lib/motion'

describe('motion variants', () => {
  it('fadeRise defines hidden and visible states', () => {
    expect(fadeRise.hidden).toMatchObject({ opacity: 0, y: 24 })
    expect(fadeRise.visible).toMatchObject({ opacity: 1, y: 0 })
  })

  it('staggerContainer staggers children with a soft spring available', () => {
    expect(staggerContainer.visible).toMatchObject({
      transition: { staggerChildren: 0.06, delayChildren: 0.1 },
    })
    expect(springSoft).toMatchObject({ type: 'spring' })
  })
})
