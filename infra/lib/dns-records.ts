import * as fs from 'node:fs'

/** Apex domain this repo's DNS stack manages. One zone, one JSON file. */
export const DEFAULT_ZONE_NAME = 'hiteshmodi.in'

export type DnsRecordType = 'TXT' | 'CNAME' | 'A' | 'MX'

const RECORD_TYPES: readonly DnsRecordType[] = ['TXT', 'CNAME', 'A', 'MX']

export interface DnsRecord {
  /** '@' for the apex, otherwise a label relative to the zone (e.g. "www", "_dmarc"). */
  name: string
  type: DnsRecordType
  ttlSeconds: number
  /** MX values are "<priority> <hostname>" strings, split by the stack. */
  values: string[]
}

/**
 * Validates and normalizes a JSON value into DnsRecord[]. Throws a descriptive
 * error on the first malformed entry — this is meant to fail loudly before
 * CDK ever sees the data, per the "file is the source of truth" pattern.
 */
export function parseDnsRecords(json: unknown): DnsRecord[] {
  if (!Array.isArray(json)) {
    throw new Error(`DNS records root must be an array, got ${typeof json}`)
  }
  return json.map((entry, index) => parseRecord(entry, index))
}

function parseRecord(entry: unknown, index: number): DnsRecord {
  const prefix = `DNS record at index ${index}`

  if (typeof entry !== 'object' || entry === null) {
    throw new Error(`${prefix} must be an object`)
  }

  const { name, type, ttlSeconds, values } = entry as Record<string, unknown>

  if (typeof name !== 'string' || name.length === 0) {
    throw new Error(`${prefix} must have a non-empty string "name"`)
  }
  if (name.endsWith('.')) {
    throw new Error(
      `${prefix} ("${name}") must not have a trailing dot — CDK appends the zone suffix`,
    )
  }
  if (name !== '@' && name.includes(DEFAULT_ZONE_NAME)) {
    throw new Error(
      `${prefix} ("${name}") must not include the apex domain "${DEFAULT_ZONE_NAME}" — ` +
        `use a relative label ("@" for the apex, "www" for a subdomain)`,
    )
  }

  if (!RECORD_TYPES.includes(type as DnsRecordType)) {
    throw new Error(
      `${prefix} has invalid "type" ${JSON.stringify(type)} — must be one of ${RECORD_TYPES.join(', ')}`,
    )
  }

  if (typeof ttlSeconds !== 'number' || !Number.isInteger(ttlSeconds) || ttlSeconds <= 0) {
    throw new Error(
      `${prefix} has invalid "ttlSeconds" ${JSON.stringify(ttlSeconds)} — must be a positive integer`,
    )
  }

  if (!Array.isArray(values) || values.length === 0) {
    throw new Error(`${prefix} must have a non-empty "values" array`)
  }
  values.forEach((value, valueIndex) => {
    if (typeof value !== 'string' || value.length === 0) {
      throw new Error(
        `${prefix} has an invalid value at values[${valueIndex}] — must be a non-empty string`,
      )
    }
  })

  return { name, type: type as DnsRecordType, ttlSeconds, values: values as string[] }
}

/**
 * Loads dns-records.json from disk. A missing file is not an error — it means
 * "no extra records yet". A malformed file is always an error, wrapped with a
 * consistent "Invalid DNS records file: …" prefix so diff:dns/deploy:dns fail
 * loudly and point at the JSON file, not at CDK internals.
 */
export function loadDnsRecords(filePath: string): DnsRecord[] {
  if (!fs.existsSync(filePath)) {
    return []
  }

  const raw = fs.readFileSync(filePath, 'utf-8')

  let json: unknown
  try {
    json = JSON.parse(raw)
  } catch (err) {
    throw new Error(`Invalid DNS records file: ${filePath}: ${(err as Error).message}`)
  }

  try {
    return parseDnsRecords(json)
  } catch (err) {
    throw new Error(`Invalid DNS records file: ${filePath}: ${(err as Error).message}`)
  }
}
