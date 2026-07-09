import * as cdk from 'aws-cdk-lib'
import * as route53 from 'aws-cdk-lib/aws-route53'
import type { Construct } from 'constructs'
import type { DnsRecord } from './dns-records'

export interface PublicDnsStackProps extends cdk.StackProps {
  /** Apex domain for the hosted zone, e.g. "hiteshmodi.in". */
  zoneName: string
  /** Records loaded from dns-records.json (already validated). */
  records: DnsRecord[]
}

export class PublicDnsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: PublicDnsStackProps) {
    super(scope, id, props)
    const { zoneName, records } = props

    const zone = new route53.PublicHostedZone(this, 'Zone', { zoneName })

    const seenIds = new Set<string>()
    for (const record of records) {
      const id = recordConstructId(record)
      if (seenIds.has(id)) {
        throw new Error(
          `Duplicate DNS record in dns-records.json: type "${record.type}" and name ` +
            `"${record.name}" both map to construct id "${id}". Each type+name combination ` +
            'must be unique — rename or remove one of the entries.',
        )
      }
      seenIds.add(id)
      addRecord(this, zone, record, id)
    }

    new cdk.CfnOutput(this, 'HostedZoneId', { value: zone.hostedZoneId })
    new cdk.CfnOutput(this, 'NameServers', {
      value: cdk.Fn.join(',', zone.hostedZoneNameServers ?? []),
    })
  }
}

/**
 * Derives a construct id from record content (type + name) instead of array
 * position. Index-based ids (`CNAMERecord2`) renumber every subsequent record
 * when an earlier entry is removed from dns-records.json; CloudFormation then
 * creates the renumbered record before deleting the old one, so the new
 * logical id collides with an rrset the old logical id still owns —
 * "Tried to create resource record set ... but it already exists" — a failed
 * update that also fails to roll back. Content-keyed ids are stable across
 * additions/removals elsewhere in the file.
 */
function recordConstructId(record: DnsRecord): string {
  return `${typeLabel(record.type)}Record${nameLabel(record.name)}`
}

/** 'TXT' -> 'Txt', 'CNAME' -> 'Cname', 'A' -> 'A', 'MX' -> 'Mx'. */
function typeLabel(type: DnsRecord['type']): string {
  return type.charAt(0) + type.slice(1).toLowerCase()
}

/** '@' -> 'Apex', '*' -> 'Wildcard', '_dmarc' -> 'Dmarc', 'foo.bar' -> 'FooBar'. */
function nameLabel(name: string): string {
  if (name === '@') return 'Apex'
  if (name === '*') return 'Wildcard'

  const parts = name.split(/[^a-zA-Z0-9]+/).filter((part) => part.length > 0)
  if (parts.length === 0) {
    throw new Error(
      `DNS record name "${name}" contains no alphanumeric characters — cannot derive a construct id`,
    )
  }
  return parts.map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join('')
}

function addRecord(scope: Construct, zone: route53.IHostedZone, record: DnsRecord, id: string): void {
  // '@' means the apex itself — recordName undefined defaults to the zone name.
  const recordName = record.name === '@' ? undefined : record.name
  const ttl = cdk.Duration.seconds(record.ttlSeconds)
  // deleteExisting: true so that an ownership transfer (a record moving to a
  // new content-keyed id — including the one-time migration off the old
  // index-based ids) deletes the pre-existing rrset before creating the new
  // one, instead of colliding with it under CloudFormation's create-before-
  // delete ordering. Tradeoff: a brief delete-then-create window where the
  // record is absent during that transfer. Acceptable here — it only fires
  // on rename/ownership-transfer, not routine updates, and SMTP retries
  // cover the MX record during that window.
  const deleteExisting = true

  switch (record.type) {
    case 'TXT':
      new route53.TxtRecord(scope, id, {
        zone,
        recordName,
        values: record.values,
        ttl,
        deleteExisting,
      })
      break
    case 'CNAME':
      new route53.CnameRecord(scope, id, {
        zone,
        recordName,
        domainName: record.values[0],
        ttl,
        deleteExisting,
      })
      break
    case 'A':
      new route53.ARecord(scope, id, {
        zone,
        recordName,
        target: route53.RecordTarget.fromIpAddresses(...record.values),
        ttl,
        deleteExisting,
      })
      break
    case 'MX':
      new route53.MxRecord(scope, id, {
        zone,
        recordName,
        values: record.values.map(parseMxValue),
        ttl,
        deleteExisting,
      })
      break
    default: {
      const exhaustiveCheck: never = record.type
      throw new Error(`Unhandled DNS record type: ${exhaustiveCheck as string}`)
    }
  }
}

function parseMxValue(value: string): route53.MxRecordValue {
  const match = value.match(/^(\d+)\s+(\S+)$/)
  if (!match) {
    throw new Error(`Invalid MX value "${value}" — expected "<priority> <hostname>"`)
  }
  return { priority: Number(match[1]), hostName: match[2] }
}
