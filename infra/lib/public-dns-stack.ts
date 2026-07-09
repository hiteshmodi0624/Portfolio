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

    records.forEach((record, index) => addRecord(this, zone, record, index))

    new cdk.CfnOutput(this, 'HostedZoneId', { value: zone.hostedZoneId })
    new cdk.CfnOutput(this, 'NameServers', {
      value: cdk.Fn.join(',', zone.hostedZoneNameServers ?? []),
    })
  }
}

function addRecord(
  scope: Construct,
  zone: route53.IHostedZone,
  record: DnsRecord,
  index: number,
): void {
  // '@' means the apex itself — recordName undefined defaults to the zone name.
  const recordName = record.name === '@' ? undefined : record.name
  const id = `${record.type}Record${index}`
  const ttl = cdk.Duration.seconds(record.ttlSeconds)

  switch (record.type) {
    case 'TXT':
      new route53.TxtRecord(scope, id, { zone, recordName, values: record.values, ttl })
      break
    case 'CNAME':
      new route53.CnameRecord(scope, id, {
        zone,
        recordName,
        domainName: record.values[0],
        ttl,
      })
      break
    case 'A':
      new route53.ARecord(scope, id, {
        zone,
        recordName,
        target: route53.RecordTarget.fromIpAddresses(...record.values),
        ttl,
      })
      break
    case 'MX':
      new route53.MxRecord(scope, id, {
        zone,
        recordName,
        values: record.values.map(parseMxValue),
        ttl,
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
