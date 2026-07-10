import { describe, expect, it, vi } from 'vitest'
import { proof } from '../../content/projects'

// The script imports { chromium } from '@playwright/test', which refuses to
// load inside another test runner — stub it; the import-time code under test
// (TARGETS, resolveIconUrl) never touches it. main() is argv-guarded.
vi.mock('@playwright/test', () => ({ chromium: {} }))

import { TARGETS, VIEWPORT, resolveIconUrl } from '../../scripts/capture-shots'

describe('capture-shots targets', () => {
  it('stays in lockstep with content/projects.ts (every linked project, same order)', () => {
    const expected = proof.projects
      .filter((project) => project.url !== undefined)
      .map((project) => ({ slug: project.slug, url: project.url }))
    expect([...TARGETS]).toEqual(expected)
  })

  it('captures at the spec dimensions', () => {
    expect(VIEWPORT).toEqual({ width: 1200, height: 750 })
  })
})

describe('resolveIconUrl', () => {
  it('falls back to /favicon.ico when the page declares no icon', () => {
    expect(resolveIconUrl('https://myextrack.com', null)).toBe('https://myextrack.com/favicon.ico')
  })

  it('resolves a relative icon href against the page url', () => {
    expect(resolveIconUrl('https://myextrack.com/somewhere/', '/icons/fav.png')).toBe(
      'https://myextrack.com/icons/fav.png',
    )
  })

  it('keeps an absolute icon href as-is', () => {
    expect(resolveIconUrl('https://myextrack.com', 'https://cdn.example.com/fav.png')).toBe(
      'https://cdn.example.com/fav.png',
    )
  })
})
