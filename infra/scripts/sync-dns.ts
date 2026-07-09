#!/usr/bin/env node
/**
 * Applies infra/dns-records.json directly to the live Route53 hosted zone via
 * the AWS CLI — no CloudFormation involvement for individual record sets.
 *
 * Why this exists: CloudFormation-managed Route53 records caused two
 * production incidents (a logical-id renumbering collision that failed a
 * stack update; then a `deleteExisting` cleanup step that deleted live MX
 * records during a migration). PublicDnsStack (infra/lib/public-dns-stack.ts)
 * now owns only the hosted zone; this script owns every individual record.
 *
 * Usage:
 *   npx tsx scripts/sync-dns.ts              # dry run — prints the plan
 *   npx tsx scripts/sync-dns.ts --apply       # applies the plan via Route53
 *   npx tsx scripts/sync-dns.ts --zone-id Z1234567890ABC [--apply]
 */
import { execFileSync } from 'node:child_process'
import * as path from 'node:path'
import { DEFAULT_ZONE_NAME, loadDnsRecords, type DnsRecord, type DnsRecordType } from '../lib/dns-records'

// ---------------------------------------------------------------------------
// Live Route53 API shapes (subset of `aws route53 list-resource-record-sets`)
// ---------------------------------------------------------------------------

export interface LiveRecordValue {
  Value: string
}

export interface LiveAliasTarget {
  HostedZoneId: string
  DNSName: string
  EvaluateTargetHealth?: boolean
}

export interface LiveRecord {
  /** FQDN with trailing dot. Route53's escaped form for '*' is '\052'. */
  Name: string
  Type: string
  TTL?: number
  ResourceRecords?: LiveRecordValue[]
  AliasTarget?: LiveAliasTarget
}

// ---------------------------------------------------------------------------
// Plan shapes
// ---------------------------------------------------------------------------

export interface PlanEntry {
  /** FQDN, trailing dot, in the form it will appear in the Route53 request. */
  name: string
  type: DnsRecordType | string
  reason: string
  ttlSeconds?: number
  values?: string[]
}

export interface Plan {
  upserts: PlanEntry[]
  deletes: PlanEntry[]
  protectedSkips: PlanEntry[]
}

/** Record types this script ever creates/deletes; anything else is left alone. */
const MANAGED_TYPES: readonly string[] = ['A', 'CNAME', 'TXT', 'MX']

// ---------------------------------------------------------------------------
// Normalization helpers
// ---------------------------------------------------------------------------

/** Desired record name -> FQDN with trailing dot (literal '*' form for wildcards). */
export function desiredNameToFqdn(name: string): string {
  if (name === '@') {
    return `${DEFAULT_ZONE_NAME}.`
  }
  return `${name}.${DEFAULT_ZONE_NAME}.`
}

/**
 * Canonicalizes a live-or-desired FQDN for comparison: lower-cases it and
 * rewrites Route53's escaped wildcard prefix ('\052.') to a literal '*.' so
 * desired '*' and live '\052.<zone>.' compare equal in both directions.
 */
export function canonicalName(name: string): string {
  const lower = name.toLowerCase()
  const escapedWildcard = '\\052.'
  if (lower.startsWith(escapedWildcard)) {
    return `*.${lower.slice(escapedWildcard.length)}`
  }
  return lower
}

/**
 * Value-shape adapter shared between comparison and apply-payload construction,
 * so TXT quoting is handled exactly once. TXT desired values are raw/unquoted;
 * Route53's live TXT values already include literal embedded quote characters.
 * MX (and everything else) passes through unchanged.
 */
export function toApiValue(record: { type: string }, rawValue: string): string {
  if (record.type === 'TXT') {
    return `"${rawValue}"`
  }
  return rawValue
}

function sortedValues(values: string[]): string[] {
  return [...values].sort()
}

function arraysEqual(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index])
}

// ---------------------------------------------------------------------------
// Protection classification — the crux of the incident-avoidance logic.
// Checked first, before anything else, for every live record. Protected
// records are never upserted over or deleted, no matter what desired says.
// ---------------------------------------------------------------------------

function protectionReason(record: LiveRecord, apexFqdn: string, wwwFqdn: string): string | undefined {
  if (record.Type === 'NS') {
    return 'NS record'
  }
  if (record.Type === 'SOA') {
    return 'SOA record'
  }

  const canonicalLiveName = canonicalName(record.Name)

  // www alias is CloudFront-owned — checked ahead of the generic alias rule
  // purely for a more specific reason string; a plain www CNAME with no
  // AliasTarget is deliberately NOT protected by this (or any) rule below.
  if (canonicalLiveName === canonicalName(wwwFqdn) && record.AliasTarget) {
    return 'www alias (CloudFront-owned)'
  }

  if (record.AliasTarget) {
    return 'alias record (CloudFront)'
  }

  // Belt-and-suspenders: protect the apex A/AAAA even if it were ever, for
  // some reason, not an alias record.
  if (canonicalLiveName === canonicalName(apexFqdn) && (record.Type === 'A' || record.Type === 'AAAA')) {
    return 'apex A/AAAA (CloudFront-owned)'
  }

  if (record.Type === 'CNAME') {
    const value = record.ResourceRecords?.[0]?.Value
    if (value && (value.endsWith('.acm-validations.aws') || value.endsWith('.acm-validations.aws.'))) {
      return 'ACM validation CNAME'
    }
  }

  if (!MANAGED_TYPES.includes(record.Type)) {
    return 'not a managed record type'
  }

  return undefined
}

function toProtectedPlanEntry(record: LiveRecord, reason: string): PlanEntry {
  return {
    name: record.Name,
    type: record.Type,
    reason,
    ttlSeconds: record.TTL,
    values: record.ResourceRecords?.map((rr) => rr.Value),
  }
}

function liveKey(record: LiveRecord): string {
  return `${canonicalName(record.Name)}::${record.Type}`
}

// ---------------------------------------------------------------------------
// computePlan — the core diff between desired (dns-records.json) and live
// (Route53). Signature is intentionally exactly (desired, live) — no
// zoneName/env-var parameter — DEFAULT_ZONE_NAME is the only zone this
// repo manages.
// ---------------------------------------------------------------------------

export function computePlan(desired: DnsRecord[], live: LiveRecord[]): Plan {
  const apexFqdn = `${DEFAULT_ZONE_NAME}.`
  const wwwFqdn = `www.${DEFAULT_ZONE_NAME}.`

  const protectedSkips: PlanEntry[] = []
  const candidateLive: LiveRecord[] = []
  const protectedByKey = new Map<string, string>()

  for (const record of live) {
    const reason = protectionReason(record, apexFqdn, wwwFqdn)
    if (reason) {
      protectedSkips.push(toProtectedPlanEntry(record, reason))
      protectedByKey.set(liveKey(record), reason)
    } else {
      candidateLive.push(record)
    }
  }

  const upserts: PlanEntry[] = []
  const matchedLiveKeys = new Set<string>()

  for (const desiredRecord of desired) {
    const fqdn = desiredNameToFqdn(desiredRecord.name)
    const canonicalDesiredName = canonicalName(fqdn)

    // Protected records are NEVER touched — not even by UPSERT. Without this
    // guard, a protected live record is absent from the match pool, so a
    // desired entry at the same name+type would read as "missing from live"
    // and be blindly UPSERTed over it. Fail loudly instead: the JSON entry is
    // the mistake.
    const protectedReason = protectedByKey.get(`${canonicalDesiredName}::${desiredRecord.type}`)
    if (protectedReason) {
      throw new Error(
        `Desired record ${desiredRecord.type} "${desiredRecord.name}" (${fqdn}) collides with a ` +
          `protected live record (${protectedReason}) — protected records are never touched by ` +
          `sync-dns. Remove this entry from dns-records.json.`,
      )
    }

    const match = candidateLive.find(
      (record) => canonicalName(record.Name) === canonicalDesiredName && record.Type === desiredRecord.type,
    )

    if (!match) {
      upserts.push({
        name: fqdn,
        type: desiredRecord.type,
        reason: 'missing from live',
        ttlSeconds: desiredRecord.ttlSeconds,
        values: desiredRecord.values,
      })
      continue
    }

    matchedLiveKeys.add(liveKey(match))

    if (match.TTL !== desiredRecord.ttlSeconds) {
      upserts.push({
        name: fqdn,
        type: desiredRecord.type,
        reason: `TTL differs (live ${match.TTL}, desired ${desiredRecord.ttlSeconds})`,
        ttlSeconds: desiredRecord.ttlSeconds,
        values: desiredRecord.values,
      })
      continue
    }

    const desiredApiValues = sortedValues(desiredRecord.values.map((v) => toApiValue(desiredRecord, v)))
    const liveApiValues = sortedValues((match.ResourceRecords ?? []).map((rr) => rr.Value))

    if (!arraysEqual(desiredApiValues, liveApiValues)) {
      upserts.push({
        name: fqdn,
        type: desiredRecord.type,
        reason: 'values differ',
        ttlSeconds: desiredRecord.ttlSeconds,
        values: desiredRecord.values,
      })
    }
    // else: everything matches — in sync, no plan entry.
  }

  const deletes: PlanEntry[] = []
  for (const record of candidateLive) {
    if (!MANAGED_TYPES.includes(record.Type)) {
      continue
    }
    if (matchedLiveKeys.has(liveKey(record))) {
      continue
    }
    deletes.push({
      name: record.Name,
      type: record.Type,
      reason: 'not in dns-records.json',
      ttlSeconds: record.TTL,
      values: record.ResourceRecords?.map((rr) => rr.Value),
    })
  }

  return {
    upserts: upserts.sort((a, b) => `${a.name}${a.type}`.localeCompare(`${b.name}${b.type}`)),
    deletes: deletes.sort((a, b) => `${a.name}${a.type}`.localeCompare(`${b.name}${b.type}`)),
    protectedSkips,
  }
}

// ---------------------------------------------------------------------------
// Live-zone fetch, with real Route53 pagination (not CLI sugar). Injectable
// exec function so this is unit-testable without any real AWS calls.
// ---------------------------------------------------------------------------

export type ExecFn = (command: string, args: string[]) => string

interface ListResourceRecordSetsResponse {
  ResourceRecordSets: LiveRecord[]
  IsTruncated?: boolean
  NextRecordName?: string
  NextRecordType?: string
  NextRecordIdentifier?: string
}

export function fetchAllLiveRecords(execFn: ExecFn, zoneId: string): LiveRecord[] {
  const records: LiveRecord[] = []
  let startName: string | undefined
  let startType: string | undefined
  let startIdentifier: string | undefined

  for (;;) {
    const args = ['route53', 'list-resource-record-sets', '--hosted-zone-id', zoneId, '--output', 'json']
    if (startName) {
      args.push('--start-record-name', startName)
    }
    if (startType) {
      args.push('--start-record-type', startType)
    }
    if (startIdentifier) {
      args.push('--start-record-identifier', startIdentifier)
    }

    const output = execFn('aws', args)
    const parsed = JSON.parse(output) as ListResourceRecordSetsResponse
    records.push(...parsed.ResourceRecordSets)

    if (!parsed.IsTruncated) {
      break
    }
    startName = parsed.NextRecordName
    startType = parsed.NextRecordType
    startIdentifier = parsed.NextRecordIdentifier
  }

  return records
}

// ---------------------------------------------------------------------------
// CLI entry point — only runs when this file is executed directly (via
// `npx tsx scripts/sync-dns.ts`), never on import (see require.main guard at
// the bottom), so the test file above can import every helper with zero
// AWS/network side effects.
// ---------------------------------------------------------------------------

function awsExec(command: string, args: string[]): string {
  return execFileSync(command, args, { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 })
}

function resolveZoneId(explicitZoneId: string | undefined): string {
  if (explicitZoneId) {
    return explicitZoneId
  }

  const output = execFileSync(
    'aws',
    [
      'cloudformation',
      'describe-stacks',
      '--region',
      'us-east-1',
      '--stack-name',
      'PortfolioDns',
      '--query',
      "Stacks[0].Outputs[?OutputKey=='HostedZoneId'].OutputValue",
      '--output',
      'text',
    ],
    { encoding: 'utf-8' },
  ).trim()

  if (!output || output === 'None') {
    throw new Error(
      'Could not resolve HostedZoneId from the PortfolioDns stack outputs — pass --zone-id explicitly, ' +
        'or confirm the PortfolioDns stack is deployed.',
    )
  }

  return output
}

function describePlanEntry(entry: PlanEntry): string {
  const ttl = entry.ttlSeconds !== undefined ? ` ttl=${entry.ttlSeconds}` : ''
  const values = entry.values && entry.values.length > 0 ? ` values=${JSON.stringify(entry.values)}` : ''
  return `${entry.type} ${entry.name} — ${entry.reason}${ttl}${values}`
}

function printPlan(plan: Plan): void {
  for (const entry of plan.upserts) {
    console.log(`UPSERT  ${describePlanEntry(entry)}`)
  }
  for (const entry of plan.deletes) {
    console.log(`DELETE  ${describePlanEntry(entry)}`)
  }
  for (const entry of plan.protectedSkips) {
    console.log(`SKIP    ${describePlanEntry(entry)}`)
  }

  console.log(
    `${plan.upserts.length} upserts, ${plan.deletes.length} deletes, ${plan.protectedSkips.length} protected-skips`,
  )

  if (plan.upserts.length === 0 && plan.deletes.length === 0) {
    console.log('DNS is already in sync with dns-records.json — nothing to do.')
  }
}

// PlanEntry.values for upserts is always the raw desired value (unquoted,
// even for TXT — see computePlan) so toApiValue is the single place TXT
// quoting happens, consistently for both comparison and apply payloads.
function buildResourceRecordSetForUpsert(entry: PlanEntry): Record<string, unknown> {
  const values = entry.values ?? []
  return {
    Name: entry.name,
    Type: entry.type,
    TTL: entry.ttlSeconds,
    ResourceRecords: values.map((value) => ({ Value: toApiValue({ type: String(entry.type) }, value) })),
  }
}

function buildResourceRecordSetForDelete(entry: PlanEntry): Record<string, unknown> {
  return {
    Name: entry.name,
    Type: entry.type,
    TTL: entry.ttlSeconds,
    ResourceRecords: (entry.values ?? []).map((value) => ({ Value: value })),
  }
}

function applyPlan(zoneId: string, plan: Plan): void {
  if (plan.upserts.length === 0 && plan.deletes.length === 0) {
    console.log('DNS is already in sync with dns-records.json — nothing to do.')
    return
  }

  const changes = [
    ...plan.upserts.map((entry) => ({
      Action: 'UPSERT',
      ResourceRecordSet: buildResourceRecordSetForUpsert(entry),
    })),
    ...plan.deletes.map((entry) => ({
      Action: 'DELETE',
      ResourceRecordSet: buildResourceRecordSetForDelete(entry),
    })),
  ]

  const changeBatch = { Changes: changes }

  const output = execFileSync(
    'aws',
    [
      'route53',
      'change-resource-record-sets',
      '--hosted-zone-id',
      zoneId,
      '--change-batch',
      JSON.stringify(changeBatch),
      '--output',
      'json',
    ],
    { encoding: 'utf-8' },
  )

  const parsed = JSON.parse(output) as { ChangeInfo?: { Id?: string; Status?: string } }
  console.log(`Applied. ChangeInfo: Id=${parsed.ChangeInfo?.Id} Status=${parsed.ChangeInfo?.Status}`)
}

// Post-incident guard: a bad dns-records.json edit must not silently delete
// mail-critical or large swaths of records (deploy-prod runs --apply
// unconditionally). MX deletes and large delete plans need --force-deletes.
const MAX_UNFORCED_DELETES = 3

export function assessPlanSafety(plan: Plan): { safe: true } | { safe: false; reason: string } {
  const mxDeletes = plan.deletes.filter((d) => d.type === 'MX')
  if (mxDeletes.length > 0) {
    return {
      safe: false,
      reason:
        `plan deletes ${mxDeletes.length} MX record set(s) — mail-critical. ` +
        'If intentional, re-run with --force-deletes.',
    }
  }
  if (plan.deletes.length > MAX_UNFORCED_DELETES) {
    return {
      safe: false,
      reason:
        `plan contains ${plan.deletes.length} deletes (max ${MAX_UNFORCED_DELETES} without ` +
        '--force-deletes). Review the plan above; if intentional, re-run with --force-deletes.',
    }
  }
  return { safe: true }
}

function parseArgs(argv: string[]): {
  apply: boolean
  forceDeletes: boolean
  zoneId: string | undefined
} {
  let apply = false
  let forceDeletes = false
  let zoneId: string | undefined

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === '--apply') {
      apply = true
    } else if (arg === '--force-deletes') {
      forceDeletes = true
    } else if (arg === '--zone-id') {
      zoneId = argv[i + 1]
      i += 1
    } else {
      // A typoed flag must never degrade a intended --apply into a silent
      // dry-run (or vice versa) — fail loudly instead.
      console.error(`sync-dns: unknown argument "${arg}" (expected --apply, --force-deletes, --zone-id <id>)`)
      process.exit(2)
    }
  }

  return { apply, forceDeletes, zoneId }
}

function main(): void {
  const { apply, forceDeletes, zoneId: explicitZoneId } = parseArgs(process.argv.slice(2))
  const zoneId = resolveZoneId(explicitZoneId)

  const desired = loadDnsRecords(path.join(__dirname, '..', 'dns-records.json'))
  const live = fetchAllLiveRecords(awsExec, zoneId)
  const plan = computePlan(desired, live)

  // Apply mode shows exactly what it is about to do — the applied plan must
  // never be invisible in deploy logs.
  printPlan(plan)

  if (!apply) {
    return
  }

  const verdict = assessPlanSafety(plan)
  if (!verdict.safe && !forceDeletes) {
    console.error(`sync-dns: REFUSING to apply — ${verdict.reason}`)
    process.exit(1)
  }

  applyPlan(zoneId, plan)
}

if (require.main === module) {
  main()
}
