import { beforeEach, vi } from 'vitest'

// jsdom implements neither matchMedia nor IntersectionObserver.
// motion (motion/react) needs both: useReducedMotion -> matchMedia,
// whileInView -> IntersectionObserver.

let reducedMotion = false

/** Toggle the simulated `prefers-reduced-motion` media query for a test. */
export function setPrefersReducedMotion(value: boolean): void {
  reducedMotion = value
}

beforeEach(() => {
  reducedMotion = false
})

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string): MediaQueryList =>
    ({
      get matches() {
        return query.includes('prefers-reduced-motion') ? reducedMotion : false
      },
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(() => false),
    }) as unknown as MediaQueryList,
})

class IntersectionObserverStub {
  readonly root = null
  readonly rootMargin = ''
  readonly thresholds: ReadonlyArray<number> = []
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: IntersectionObserverStub,
})
