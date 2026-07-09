import { App } from 'aws-cdk-lib'
import { Template } from 'aws-cdk-lib/assertions'
import { describe, expect, it } from 'vitest'
import { PublicDnsStack } from '../lib/public-dns-stack'

function synth(zoneName = 'hiteshmodi.in'): Template {
  const app = new App()
  const stack = new PublicDnsStack(app, 'TestDnsStack', {
    env: { account: '111111111111', region: 'us-east-1' },
    zoneName,
  })
  return Template.fromStack(stack)
}

describe('PublicDnsStack — zone only', () => {
  const template = synth()

  it('creates the public hosted zone for the apex domain', () => {
    template.hasResourceProperties('AWS::Route53::HostedZone', {
      Name: 'hiteshmodi.in.',
    })
  })

  it('creates zero record set resources — records are applied by scripts/sync-dns.ts, not CloudFormation', () => {
    const recordSets = template.findResources('AWS::Route53::RecordSet')
    expect(Object.keys(recordSets)).toHaveLength(0)
  })

  it('outputs HostedZoneId', () => {
    template.hasOutput('HostedZoneId', {})
  })

  it('outputs NameServers', () => {
    template.hasOutput('NameServers', {})
  })

  it('respects a custom zoneName', () => {
    const custom = synth('example.test')
    custom.hasResourceProperties('AWS::Route53::HostedZone', { Name: 'example.test.' })
  })
})
