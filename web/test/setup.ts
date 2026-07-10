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

/** Toggle the simulated `(min-width: 768px)` query — Proof's parallax gate
 * and the beats' never-pins regression tests (P3.1). */
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

interface IntersectionObserverInstance {
  callback: IntersectionObserverCallback
  entries: Map<Element, IntersectionObserverEntry>
}

const intersectionInstances: IntersectionObserverInstance[] = []

/**
 * Trigger intersection callbacks for a target element.
 * Used in tests to simulate elements entering/leaving the viewport.
 */
export function triggerIntersection(
  target: Element,
  isIntersecting: boolean,
  ratio = 1,
): void {
  for (const instance of intersectionInstances) {
    const entry: IntersectionObserverEntry = {
      target,
      isIntersecting,
      intersectionRatio: ratio,
      boundingClientRect: target.getBoundingClientRect(),
      intersectionRect: isIntersecting ? target.getBoundingClientRect() : new DOMRect(),
      rootBounds: null,
      time: Date.now(),
    }
    instance.entries.set(target, entry)
    instance.callback([entry], { root: null, rootMargin: '', thresholds: [0.5] } as unknown as IntersectionObserver)
  }
}

class IntersectionObserverStub {
  readonly root = null
  readonly rootMargin = ''
  readonly thresholds: ReadonlyArray<number> = [0.5]
  private callback: IntersectionObserverCallback
  private entries = new Map<Element, IntersectionObserverEntry>()

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
    intersectionInstances.push({ callback, entries: this.entries })
  }

  observe(): void {}
  unobserve(): void {}
  disconnect(): void {
    const idx = intersectionInstances.findIndex((i) => i.callback === this.callback)
    if (idx >= 0) intersectionInstances.splice(idx, 1)
  }
  takeRecords(): IntersectionObserverEntry[] {
    return Array.from(this.entries.values())
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
