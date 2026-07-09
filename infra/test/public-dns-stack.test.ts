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

  it('creates an apex A record with both IPs and TTL 300', () => {
    template.hasResourceProperties('AWS::Route53::RecordSet', {
      Name: 'hiteshmodi.in.',
      Type: 'A',
      TTL: '300',
      ResourceRecords: ['66.33.60.129', '76.76.21.164'],
    })
  })

  it('creates a www A record with both IPs and TTL 300', () => {
    template.hasResourceProperties('AWS::Route53::RecordSet', {
      Name: 'www.hiteshmodi.in.',
      Type: 'A',
      TTL: '300',
      ResourceRecords: ['66.33.60.66', '76.76.21.22'],
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

  it('creates the verification TXT record', () => {
    template.hasResourceProperties('AWS::Route53::RecordSet', {
      Name: 'hiteshmodi.in.',
      Type: 'TXT',
      TTL: '3600',
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
