import { describe, expect, it } from 'vitest'
import { StatsSchema, TickerSchema } from '../../content/schema'
import { stats } from '../../content/stats'
import { ticker } from '../../content/ticker'
import rawStats from '../../content/stats.json'
import {
  StatsFileSchema,
  fetchGithubNumbers,
  mergeStats,
  resolveToken,
} from '../../scripts/fetch-stats'

describe('committed stats.json', () => {
  it('satisfies both the app schema and the script schema (lockstep)', () => {
    expect(StatsSchema.safeParse(rawStats).success).toBe(true)
    expect(StatsFileSchema.safeParse(rawStats).success).toBe(true)
  })

  it('rejects a non-positive manual number', () => {
    const bad = { ...rawStats, manual: { ...rawStats.manual, clientCountries: 0 } }
    expect(StatsSchema.safeParse(bad).success).toBe(false)
  })
})

describe('resolveToken', () => {
  it('prefers the GITHUB_TOKEN env var', () => {
    expect(resolveToken({ GITHUB_TOKEN: 'env-token' }, () => 'gh-token')).toBe('env-token')
  })

  it('falls back to gh auth token output (trimmed)', () => {
    expect(resolveToken({}, () => 'gh-token\n')).toBe('gh-token')
  })

  it('returns null when there is no env token and gh fails', () => {
    expect(
      resolveToken({}, () => {
        throw new Error('gh: command not found')
      }),
    ).toBeNull()
  })
})

describe('fetchGithubNumbers', () => {
  const goodBody = {
    data: {
      user: {
        repositories: { totalCount: 42 },
        contributionsCollection: { contributionCalendar: { totalContributions: 1234 } },
      },
    },
  }

  it('parses a good GraphQL response', async () => {
    const fetchImpl = (async () => new Response(JSON.stringify(goodBody))) as unknown as typeof fetch
    await expect(fetchGithubNumbers('token', fetchImpl)).resolves.toEqual({
      publicRepos: 42,
      contributionsPastYear: 1234,
    })
  })

  it('returns null on a non-OK response', async () => {
    const fetchImpl = (async () => new Response('nope', { status: 401 })) as unknown as typeof fetch
    await expect(fetchGithubNumbers('token', fetchImpl)).resolves.toBeNull()
  })

  it('returns null on a malformed payload', async () => {
    const fetchImpl = (async () => new Response('{"data":{}}')) as unknown as typeof fetch
    await expect(fetchGithubNumbers('token', fetchImpl)).resolves.toBeNull()
  })

  it('returns null when fetch rejects (offline)', async () => {
    const fetchImpl = (async () => {
      throw new Error('network down')
    }) as unknown as typeof fetch
    await expect(fetchGithubNumbers('token', fetchImpl)).resolves.toBeNull()
  })
})

describe('mergeStats', () => {
  it('keeps manual numbers untouched, swaps the github block, stamps the date', () => {
    const current = StatsFileSchema.parse(rawStats)
    const next = mergeStats(current, { publicRepos: 99, contributionsPastYear: 5000 }, '2026-08-01')
    expect(next.manual).toEqual(current.manual)
    expect(next.github).toEqual({ publicRepos: 99, contributionsPastYear: 5000 })
    expect(next.updatedAt).toBe('2026-08-01')
  })
})

describe('ticker module', () => {
  it('exposes exactly the three spec numbers, sourced from the stats module', () => {
    expect(TickerSchema.safeParse(ticker).success).toBe(true)
    expect(ticker.map((item) => item.id)).toEqual(['speed', 'scale', 'reach'])
    expect(ticker[0].value).toBe(stats.manual.daysToFirstPayingCustomer)
    expect(ticker[1].value).toBe(stats.manual.requestsPerDay)
    expect(ticker[2].value).toBe(stats.manual.clientCountries)
  })
})
