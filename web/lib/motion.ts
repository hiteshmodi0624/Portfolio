import type { Transition, Variants } from 'motion/react'

/** House spring: gentle, settles fast, no overshoot drama. */
export const springSoft: Transition = {
  type: 'spring',
  stiffness: 120,
  damping: 20,
  mass: 0.8,
}

/** Standard entrance: rise 24px and fade in. */
export const fadeRise: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: springSoft },
}

/** Parent that staggers fadeRise children ("words materialize"). */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
}
