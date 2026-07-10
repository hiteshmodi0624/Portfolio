import { describe, expect, it, vi } from 'vitest'
import { proof } from '../../content/projects'

// The script imports { chromium } from '@playwright/test', which refuses to
// load inside another test runner — stub it; the import-time code under test
// (TARGETS, resolveIconUrl) never touches it. main() is argv-guarded.
vi.mock('@playwright/test', () => ({ chromium: {} }))

import { TARGETS, VIEWPORT, resolveIconUrl, captureTarget } from '../../scripts/capture-shots'

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

describe('captureTarget (per-site failure isolation)', () => {
  it('does not throw the whole run when context.newPage() itself rejects', async () => {
    const context = { newPage: vi.fn().mockRejectedValue(new Error('context crashed')) }
    const result = await captureTarget(context, { slug: 'extrack', url: 'https://myextrack.com' })
    expect(result).toBe(false)
  })

  it('still closes the page when capture fails after the page was created', async () => {
    const close = vi.fn().mockResolvedValue(undefined)
    const page = { goto: vi.fn().mockRejectedValue(new Error('nav failed')), close }
    const context = { newPage: vi.fn().mockResolvedValue(page) }
    const result = await captureTarget(context, { slug: 'extrack', url: 'https://myextrack.com' })
    expect(result).toBe(false)
    expect(close).toHaveBeenCalledTimes(1)
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
