/**
 * Manual gallery-asset capture (P3.4, spec §3.5).
 *
 * Run:            npm run capture:shots -w web
 * On this machine (default Node is 20.x; the script needs >= 22.6 for
 * --experimental-strip-types):
 *                 PATH="/opt/homebrew/opt/node@22/bin:$PATH" npm run capture:shots -w web
 *
 * Visits each project site with Playwright's bundled Chromium and saves
 *   - a 1200x750 screenshot -> public/shots/<slug>.png
 *   - the site's favicon    -> public/logos/<slug>.png
 * Assets are COMMITTED; build/CI never runs this (no network at build time).
 * A failing site is SKIPPED with a warning — its card falls back to
 * text-only rendering (image/logo are optional in ProjectSchema). Re-run any
 * time screenshots go stale; git diffs the binaries visibly.
 *
 * TARGETS is deliberately standalone rather than importing
 * content/projects.ts — same rationale as fetch-stats.ts: extensionless
 * cross-file .ts imports don't resolve under --experimental-strip-types.
 * test/unit/capture-shots.test.ts pins TARGETS to content/projects.ts.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { chromium, type Page } from '@playwright/test'

export const TARGETS: ReadonlyArray<{ slug: string; url: string }> = [
  { slug: 'extrack', url: 'https://myextrack.com' },
  { slug: 'whycosmos', url: 'https://whycosmos.com' },
  { slug: 'quri', url: 'https://myquri.com' },
  { slug: 'safewash', url: 'https://www.safewash.co.in' },
  { slug: 'ditch-navigation', url: 'https://www.ditchnavigation.com' },
  { slug: 'aimers-international', url: 'https://www.aimersinternational.com' },
  { slug: 'fidus-global', url: 'https://www.fidusglobal.in' },
  { slug: 'rtopilot', url: 'https://www.rtopilot.com.au' },
]

/** Spec §3.5 capture size. */
export const VIEWPORT = { width: 1200, height: 750 }

const PUBLIC_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public')

/** The page's declared <link rel~=icon> resolved against the page URL, else
 * the /favicon.ico convention. */
export function resolveIconUrl(pageUrl: string, iconHref: string | null): string {
  if (iconHref) return new URL(iconHref, pageUrl).href
  return new URL('/favicon.ico', pageUrl).href
}

async function captureOne(page: Page, target: { slug: string; url: string }): Promise<void> {
  await page.goto(target.url, { waitUntil: 'networkidle', timeout: 45_000 })
  await page.waitForTimeout(1_500) // let entrance animations settle
  await page.screenshot({ path: path.join(PUBLIC_DIR, 'shots', `${target.slug}.png`) })
  console.log(`capture-shots: ${target.slug} — screenshot saved`)

  const iconHref = await page.evaluate(
    () => document.querySelector('link[rel~="icon"]')?.getAttribute('href') ?? null,
  )
  const iconUrl = resolveIconUrl(target.url, iconHref)
  const response = await page.request.get(iconUrl, { timeout: 15_000 })
  if (!response.ok()) {
    console.warn(
      `capture-shots: ${target.slug} — favicon fetch failed (${response.status()}) — logo skipped, chip omitted`,
    )
    return
  }
  writeFileSync(path.join(PUBLIC_DIR, 'logos', `${target.slug}.png`), await response.body())
  console.log(`capture-shots: ${target.slug} — logo saved`)
}

/**
 * Captures one target inside its own try/finally so ANY failure for that
 * target — including `context.newPage()` itself throwing (e.g. a crashed
 * renderer/context after a previous target's heavy site) — is caught and
 * skipped here, never propagating out of main()'s loop and aborting the
 * whole run. Returns whether the capture succeeded. Exported so the
 * per-site-failure-isolation behavior is unit-testable without spinning up
 * a real browser.
 */
export async function captureTarget(
  context: { newPage: () => Promise<Page> },
  target: { slug: string; url: string },
): Promise<boolean> {
  // Declared outside the try so `finally` can close it — but only assigned
  // once newPage() actually succeeds, so a newPage() failure has nothing to
  // clean up.
  let page: Page | undefined
  try {
    page = await context.newPage()
    await captureOne(page, target)
    return true
  } catch (error) {
    console.warn(
      `capture-shots: SKIPPED ${target.slug} (${error instanceof Error ? error.message : 'unknown error'}) — card stays text-only`,
    )
    return false
  } finally {
    await page?.close()
  }
}

async function main(): Promise<void> {
  mkdirSync(path.join(PUBLIC_DIR, 'shots'), { recursive: true })
  mkdirSync(path.join(PUBLIC_DIR, 'logos'), { recursive: true })
  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 1 })
  let captured = 0
  for (const target of TARGETS) {
    if (await captureTarget(context, target)) captured += 1
  }
  await browser.close()
  console.log(`capture-shots: done — ${captured}/${TARGETS.length} sites captured`)
}

// Execute only when run directly, never when imported by the unit suite.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error: unknown) => {
    console.error(
      `capture-shots: fatal (${error instanceof Error ? error.message : 'unknown error'})`,
    )
    process.exitCode = 1
  })
}
