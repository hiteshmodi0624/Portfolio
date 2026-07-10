// Homepage JS budget gate.
//
// Measures the JS a modern browser actually executes on `/`: every
// <script src> referenced by out/index.html EXCEPT the `noModule` polyfills
// chunk (modern browsers skip noModule scripts). Gzips each file and totals.
//
// BUDGET DECISION (2026-07-10): budget = the spec's ~150 KB gz.
// P1 baseline (commit aa79f3e): 140.8 KB gz → P2 headroom ~9 KB, which is why
// P2 adds ZERO runtime dependencies and reuses the motion engine already in
// the bundle. Pre-approved fallback if P2 lands at 150–158 KB: raise
// BUDGET_KB to 160 in a commit that pastes the measured table (see
// docs/superpowers/plans/2026-07-10-freelance-portfolio-p2.md, Task 1).
// Above 158 KB: cut scene code (TypedText first), never raise again.
//
// BUDGET RAISED (2026-07-10, P2 Task 11 final verification): measured
// 154.3 KB gz, inside the pre-approved 150–158 KB band → raised to 160 per
// the ladder above. Justification: all 6 beats ship on one static page, the
// scroll-scene motion engine is shared across every beat (no per-beat
// duplication), and P2 added zero new runtime dependencies. See the commit
// message for the full measured per-chunk table.

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'

const BUDGET_KB = Number(process.env.BUDGET_KB ?? 160)
const outDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'out')

const html = readFileSync(path.join(outDir, 'index.html'), 'utf8')
const scriptTags = html.match(/<script[^>]+src="[^"]+\.js"[^>]*>/g) ?? []
const files = [
  ...new Set(
    scriptTags
      .filter((tag) => !/nomodule/i.test(tag))
      .map((tag) => tag.match(/src="([^"]+)"/)?.[1])
      .filter((src) => src !== undefined),
  ),
]

let total = 0
for (const file of files) {
  const size = gzipSync(readFileSync(path.join(outDir, file))).length
  total += size
  console.log(`${(size / 1024).toFixed(1).padStart(7)} KB  ${file}`)
}
const totalKb = total / 1024
const over = totalKb > BUDGET_KB
console.log(`TOTAL: ${totalKb.toFixed(1)} KB gz (budget ${BUDGET_KB} KB) — ${over ? 'OVER BUDGET' : 'OK'}`)
process.exit(over ? 1 : 0)
