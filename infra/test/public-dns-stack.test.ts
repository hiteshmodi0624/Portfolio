import * as fs from 'node:fs'
import * as path from 'node:path'
import { App } from 'aws-cdk-lib'
import { Match, Template } from 'aws-cdk-lib/assertions'
import { describe, expect, it } from 'vitest'
import type { DnsRecord } from '../lib/dns-records'
import { parseDnsRecords } from '../lib/dns-records'
import { PublicDnsStack } from '../lib/public-dns-stack'

function synth(records: DnsRecord[], zoneName = 'hiteshmodi.in'): Template {
  const app = new App()
  const stack = new PublicDnsStack(app, 'TestDnsStack', {
    env: { account: '111111111111', region: 'us-east-1' },
    zoneName,
    records,
  })
  return Template.fromStack(stack)
}

describe('PublicDnsStack — seeded records (dns-records.json)', () => {
  const recordsPath = path.join(__dirname, '..', 'dns-records.json')
  const records = parseDnsRecords(JSON.parse(fs.readFileSync(recordsPath, 'utf-8')))
  const template = synth(records)

  it('creates the public hosted zone for the apex domain', () => {
    template.hasResourceProperties('AWS::Route53::HostedZone', {
      Name: 'hiteshmodi.in.',
    })
  })

  it('omits the apex A record — the CloudFront alias owns the apex post-cutover', () => {
    const recordSets = template.findResources('AWS::Route53::RecordSet')
    const apexARecords = Object.values(recordSets).filter(
      (r) => r.Properties?.Name === 'hiteshmodi.in.' && r.Properties?.Type === 'A',
    )
    if (apexARecords.length > 0) {
      throw new Error('dns-records.json must not carry an apex A record after cutover')
    }
  })

  it('omits any www record — the CloudFront alias owns www post-cutover', () => {
    const recordSets = template.findResources('AWS::Route53::RecordSet')
    const wwwRecords = Object.values(recordSets).filter(
      (r) => r.Properties?.Name === 'www.hiteshmodi.in.',
    )
    if (wwwRecords.length > 0) {
      throw new Error('dns-records.json must not carry a www record after cutover')
    }
  })

  it('creates ftp A, blog CNAME, and wildcard CNAME records', () => {
    template.hasResourceProperties('AWS::Route53::RecordSet', {
      Name: 'ftp.hiteshmodi.in.',
      Type: 'A',
      TTL: '1800',
      ResourceRecords: ['82.180.142.168'],
    })
    template.hasResourceProperties('AWS::Route53::RecordSet', {
      Name: 'blog.hiteshmodi.in.',
      Type: 'CNAME',
      TTL: '14400',
      ResourceRecords: ['cname.vercel-dns.com'],
    })
    template.hasResourceProperties('AWS::Route53::RecordSet', {
      Name: '*.hiteshmodi.in.',
      Type: 'CNAME',
      TTL: '14400',
      ResourceRecords: ['cname.vercel-dns.com'],
    })
  })

  it('creates an MX record with all 5 priority-host values', () => {
    template.hasResourceProperties('AWS::Route53::RecordSet', {
      Name: 'hiteshmodi.in.',
      Type: 'MX',
      TTL: '3600',
      ResourceRecords: Match.arrayWith([
        '1 aspmx.l.google.com',
        '5 alt1.aspmx.l.google.com',
        '5 alt2.aspmx.l.google.com',
        '10 alt3.aspmx.l.google.com',
        '10 alt4.aspmx.l.google.com',
      ]),
    })
  })

  it('creates the verification + SPF TXT record', () => {
    template.hasResourceProperties('AWS::Route53::RecordSet', {
      Name: 'hiteshmodi.in.',
      Type: 'TXT',
      TTL: '3600',
      ResourceRecords: Match.arrayWith([
        '"google-site-verification=T5Af1FA2o07_ixPaI7V6OukoUJ7pJ-4dlGOjXckTsMs"',
        '"v=spf1 include:_spf.google.com ~all"',
      ]),
    })
  })

  it('creates a DMARC TXT record at p=none (monitoring-first)', () => {
    template.hasResourceProperties('AWS::Route53::RecordSet', {
      Name: '_dmarc.hiteshmodi.in.',
      Type: 'TXT',
      TTL: '3600',
      ResourceRecords: ['"v=DMARC1; p=none; rua=mailto:mail@hiteshmodi.in"'],
    })
  })

  it('outputs HostedZoneId', () => {
    template.hasOutput('HostedZoneId', {})
  })

  it('outputs NameServers', () => {
    template.hasOutput('NameServers', {})
  })
})

describe('PublicDnsStack — synthetic records (MX splitting)', () => {
  const records = parseDnsRecords([
    {
      name: '@',
      type: 'MX',
      ttlSeconds: 3600,
      values: ['10 mail1.example.com', '20 mail2.example.com'],
    },
  ])
  const template = synth(records)

  it('splits each MX value into a "<priority> <hostname>" resource record', () => {
    template.hasResourceProperties('AWS::Route53::RecordSet', {
      Type: 'MX',
      ResourceRecords: ['10 mail1.example.com', '20 mail2.example.com'],
    })
  })
})

describe('PublicDnsStack — content-keyed construct ids (regression)', () => {
  // Guards against the production incident: index-based ids (`CNAMERecord2`)
  // renumber every subsequent record when an earlier entry is removed from
  // dns-records.json. CloudFormation creates the renumbered record before
  // deleting the old one, so the new logical id collides with an rrset the
  // old logical id still owns -> "Tried to create resource record set ...
  // but it already exists" -> failed UPDATE_ROLLBACK_FAILED. Ids must
  // instead be derived from record content (type + name) so removing one
  // record never renames the ids of the records around it.
  function recordSetIdsByKey(template: Template): Map<string, string> {
    const resources = template.findResources('AWS::Route53::RecordSet')
    const byKey = new Map<string, string>()
    for (const [logicalId, resource] of Object.entries(resources)) {
      const key = `${resource.Properties?.Type as string}:${resource.Properties?.Name as string}`
      byKey.set(key, logicalId)
    }
    return byKey
  }

  it('keeps identical logical ids for records unaffected by removing an earlier entry', () => {
    const recordsPath = path.join(__dirname, '..', 'dns-records.json')
    const allRecords = parseDnsRecords(JSON.parse(fs.readFileSync(recordsPath, 'utf-8')))
    // Remove the FIRST entry — this is exactly the shape of the incident:
    // every record after it used to get renumbered.
    const withFirstRemoved = allRecords.slice(1)

    const idsWithAll = recordSetIdsByKey(synth(allRecords))
    const idsWithFirstRemoved = recordSetIdsByKey(synth(withFirstRemoved))

    const sharedKeys = [...idsWithAll.keys()].filter((key) => idsWithFirstRemoved.has(key))
    // Sanity check: the two templates must actually share some records,
    // otherwise the assertion below would vacuously pass.
    expect(sharedKeys.length).toBeGreaterThan(0)

    for (const key of sharedKeys) {
      expect(idsWithFirstRemoved.get(key)).toBe(idsWithAll.get(key))
    }
  })
})

describe('PublicDnsStack — duplicate type+name guard', () => {
  it('throws a descriptive error when two records share the same type and name', () => {
    const records = parseDnsRecords([
      { name: 'www', type: 'CNAME', ttlSeconds: 300, values: ['a.example.com'] },
      { name: 'www', type: 'CNAME', ttlSeconds: 300, values: ['b.example.com'] },
    ])

    expect(() => synth(records)).toThrow(/duplicate/i)
  })
})
