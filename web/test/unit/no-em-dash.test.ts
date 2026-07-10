import { describe, expect, it } from 'vitest'
import * as human from '../../content/human'
import * as profile from '../../content/profile'
import * as projects from '../../content/projects'
import * as services from '../../content/services'
import * as story from '../../content/story'
import * as ticker from '../../content/ticker'

/** Copy sweep guard: user-visible site copy never carries an em dash
 * (U+2014) — the approved PDF-portfolio voice uses plain punctuation
 * instead. En dashes in numeric ranges ('3–4 weeks') stay legal. */
const modules = { human, profile, projects, services, story, ticker }

interface FoundString {
  path: string
  text: string
}

/** Recursively collect every string reachable from an exported value,
 * remembering its path so a failure names the exact offending field. */
function collectStrings(value: unknown, path: string, out: FoundString[]): void {
  if (typeof value === 'string') {
    out.push({ path, text: value })
    return
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectStrings(item, `${path}[${index}]`, out))
    return
  }
  if (value !== null && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      collectStrings(child, `${path}.${key}`, out)
    }
  }
}

describe('content copy carries no em dashes', () => {
  for (const [name, mod] of Object.entries(modules)) {
    it(`content/${name} has no em dash (U+2014) in any exported string`, () => {
      const strings: FoundString[] = []
      for (const [exportName, exported] of Object.entries(mod)) {
        collectStrings(exported, `${name}.${exportName}`, strings)
      }
      // sanity: the walk actually reached copy — an empty list would make
      // this guard pass vacuously after a refactor
      expect(strings.length).toBeGreaterThan(0)

      const offenders = strings.filter((found) => found.text.includes('—'))
      expect(offenders).toEqual([])
    })
  }
})
