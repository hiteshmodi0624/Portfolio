import { beforeEach, vi } from 'vitest'

// jsdom implements none of matchMedia / IntersectionObserver / ResizeObserver.
// motion (motion/react) needs all three: useReducedMotion -> matchMedia,
// whileInView/useInView -> IntersectionObserver, useScroll -> ResizeObserver.

let reducedMotion = false
let wideViewport = false

/** Toggle the simulated `prefers-reduced-motion` media query for a test. */
export function setPrefersReducedMotion(value: boolean): void {
  reducedMotion = value
}

/** Toggle the simulated `(min-width: 768px)` query — ScrollScene's scrub gate. */
export function setViewportWide(value: boolean): void {
  wideViewport = value
}

beforeEach(() => {
  reducedMotion = false
  wideViewport = false
})

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string): MediaQueryList =>
    ({
      get matches() {
        if (query.includes('prefers-reduced-motion')) return reducedMotion
        if (query.includes('min-width: 768px')) return wideViewport
        return false
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

class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: ResizeObserverStub,
})
