/**
 * Build-time stats refresh (spec §4). Wired as web's `prebuild` script, so it
 * runs before every `next build`.
 *
 * HARD RULE — this script NEVER fails the build:
 *   - no GITHUB_TOKEN and no `gh` auth        → keep committed stats.json, exit 0
 *   - offline / API error / malformed payload → keep committed stats.json, exit 0
 *   - unexpected crash                        → caught in main().catch, exit 0
 *   - local Node without --experimental-strip-types (Node 20)
 *                                             → `|| echo` in package.json covers it
 *
 * Only `github.*` is refreshed. `manual.*` (the ticker's business results) is
 * user-owned and never touched.
 */
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { z } from 'zod'

const GITHUB_LOGIN = 'hiteshmodi0624'
const STATS_PATH = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'content',
  'stats.json',
)

/** Deliberately re-declared rather than imported from content/schema.ts: the
 * script must run standalone under `node --experimental-strip-types`, where
 * extensionless cross-file .ts imports don't resolve. The unit suite asserts
 * both schemas accept the committed stats.json, keeping them in lockstep. */
export const StatsFileSchema = z.object({
  updatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  manual: z.object({
    daysToFirstPayingCustomer: z.number().int().positive(),
    requestsPerDay: z.number().int().positive(),
    clientCountries: z.number().int().positive(),
  }),
  github: z.object({
    publicRepos: z.number().int().nonnegative(),
    contributionsPastYear: z.number().int().nonnegative(),
  }),
})
export type StatsFile = z.infer<typeof StatsFileSchema>

export function resolveToken(
  env: Record<string, string | undefined>,
  runGh: () => string,
): string | null {
  if (env.GITHUB_TOKEN) return env.GITHUB_TOKEN
  try {
    const token = runGh().trim()
    return token.length > 0 ? token : null
  } catch {
    return null
  }
}

const GithubResponseSchema = z.object({
  data: z.object({
    user: z.object({
      repositories: z.object({ totalCount: z.number().int().nonnegative() }),
      contributionsCollection: z.object({
        contributionCalendar: z.object({
          totalContributions: z.number().int().nonnegative(),
        }),
      }),
    }),
  }),
})

export async function fetchGithubNumbers(
  token: string,
  fetchImpl: typeof fetch,
): Promise<StatsFile['github'] | null> {
  try {
    const response = await fetchImpl('https://api.github.com/graphql', {
      method: 'POST',
      headers: { authorization: `bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        query: `query {
          user(login: "${GITHUB_LOGIN}") {
            repositories(privacy: PUBLIC, ownerAffiliations: OWNER) { totalCount }
            contributionsCollection { contributionCalendar { totalContributions } }
          }
        }`,
      }),
    })
    if (!response.ok) return null
    const parsed = GithubResponseSchema.safeParse(await response.json())
    if (!parsed.success) return null
    const user = parsed.data.data.user
    return {
      publicRepos: user.repositories.totalCount,
      contributionsPastYear: user.contributionsCollection.contributionCalendar.totalContributions,
    }
  } catch {
    return null
  }
}

export function mergeStats(
  current: StatsFile,
  github: StatsFile['github'],
  today: string,
): StatsFile {
  return { ...current, updatedAt: today, github }
}

async function main(): Promise<void> {
  const current = StatsFileSchema.parse(JSON.parse(readFileSync(STATS_PATH, 'utf8')))
  const token = resolveToken(process.env, () =>
    execFileSync('gh', ['auth', 'token'], { encoding: 'utf8' }),
  )
  if (!token) {
    console.log('fetch-stats: no GITHUB_TOKEN and no gh auth — keeping committed stats.json')
    return
  }
  const github = await fetchGithubNumbers(token, fetch)
  if (!github) {
    console.log('fetch-stats: GitHub unreachable or token rejected — keeping committed stats.json')
    return
  }
  const next = mergeStats(current, github, new Date().toISOString().slice(0, 10))
  writeFileSync(STATS_PATH, `${JSON.stringify(next, null, 2)}\n`)
  console.log(
    `fetch-stats: refreshed github stats (repos=${github.publicRepos}, contributions=${github.contributionsPastYear})`,
  )
}

// Execute only when run directly (`node --experimental-strip-types
// scripts/fetch-stats.ts`), never when imported by the unit suite.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error: unknown) => {
    console.log(
      `fetch-stats: skipped (${error instanceof Error ? error.message : 'unknown error'}) — keeping committed stats.json`,
    )
  })
}
