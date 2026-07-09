'use client'

import { useEffect, useState } from 'react'

/**
 * SSR-safe media query. Returns false on the server and on the first client
 * render (so static-export HTML and hydration always match), then tracks the
 * live media query. Used by ScrollScene (scrub gate) and Proof (parallax gate).
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const list = window.matchMedia(query)
    const update = () => setMatches(list.matches)
    update()
    list.addEventListener('change', update)
    return () => list.removeEventListener('change', update)
  }, [query])

  return matches
}
