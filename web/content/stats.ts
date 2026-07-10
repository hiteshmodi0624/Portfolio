import { StatsSchema, type Stats } from './schema'
import rawStats from './stats.json'

/** Zod-validated build-time stats (spec §4). The JSON is the committed
 * fallback; scripts/fetch-stats.ts refreshes it pre-build when it can. */
export const stats: Stats = StatsSchema.parse(rawStats)
