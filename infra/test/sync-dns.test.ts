import { describe, expect, it } from 'vitest'
import type { DnsRecord } from '../lib/dns-records'
import { computePlan, fetchAllLiveRecords, toApiValue, type LiveRecord } from '../scripts/sync-dns'

describe('computePlan', () => {
  it('1. UPSERTs a desired record that is entirely missing from live', () => {
    const desired: DnsRecord[] = [
      { name: 'ftp', type: 'A', ttlSeconds: 1800, values: ['82.180.142.168'] },
    ]
    const live: LiveRecord[] = []

    const plan = computePlan(desired, live)

    expect(plan.upserts).toEqual([
      {
        name: 'ftp.hiteshmodi.in.',
        type: 'A',
        reason: 'missing from live',
        ttlSeconds: 1800,
        values: ['82.180.142.168'],
      },
    ])
    expect(plan.deletes).toEqual([])
  })

  it('2. UPSERTs when live has the record but TTL differs', () => {
    const desired: DnsRecord[] = [
      { name: 'blog', type: 'CNAME', ttlSeconds: 14400, values: ['cname.vercel-dns.com'] },
    ]
    const live: LiveRecord[] = [
      {
        Name: 'blog.hiteshmodi.in.',
        Type: 'CNAME',
        TTL: 300,
        ResourceRecords: [{ Value: 'cname.vercel-dns.com' }],
      },
    ]

    const plan = computePlan(desired, live)

    expect(plan.upserts).toHaveLength(1)
    expect(plan.upserts[0]).toMatchObject({
      name: 'blog.hiteshmodi.in.',
      type: 'CNAME',
      reason: 'TTL differs (live 300, desired 14400)',
      ttlSeconds: 14400,
      values: ['cname.vercel-dns.com'],
    })
    expect(plan.deletes).toEqual([])
  })

  it('3. UPSERTs when TTL matches but values differ', () => {
    const desired: DnsRecord[] = [
      { name: 'blog', type: 'CNAME', ttlSeconds: 14400, values: ['cname.vercel-dns.com'] },
    ]
    const live: LiveRecord[] = [
      {
        Name: 'blog.hiteshmodi.in.',
        Type: 'CNAME',
        TTL: 14400,
        ResourceRecords: [{ Value: 'old-target.example.com' }],
      },
    ]

    const plan = computePlan(desired, live)

    expect(plan.upserts).toHaveLength(1)
    expect(plan.upserts[0]).toMatchObject({
      name: 'blog.hiteshmodi.in.',
      type: 'CNAME',
      reason: 'values differ',
    })
    expect(plan.deletes).toEqual([])
  })

  it('4. in-sync record (including order-insensitive values) produces an empty plan', () => {
    const desired: DnsRecord[] = [
      {
        name: '@',
        type: 'MX',
        ttlSeconds: 3600,
        values: [
          '1 aspmx.l.google.com',
          '5 alt1.aspmx.l.google.com',
          '5 alt2.aspmx.l.google.com',
        ],
      },
    ]
    const live: LiveRecord[] = [
      {
        Name: 'hiteshmodi.in.',
        Type: 'MX',
        TTL: 3600,
        // deliberately different order than desired
        ResourceRecords: [
          { Value: '5 alt2.aspmx.l.google.com' },
          { Value: '1 aspmx.l.google.com' },
          { Value: '5 alt1.aspmx.l.google.com' },
        ],
      },
    ]

    const plan = computePlan(desired, live)

    expect(plan.upserts).toEqual([])
    expect(plan.deletes).toEqual([])
    expect(plan.protectedSkips).toEqual([])
  })

  it('5. DELETEs a live managed-type record absent from desired (legacy www CNAME, no alias)', () => {
    const desired: DnsRecord[] = []
    const live: LiveRecord[] = [
      {
        Name: 'www.hiteshmodi.in.',
        Type: 'CNAME',
        TTL: 3600,
        ResourceRecords: [{ Value: 'hiteshmodi.in' }],
        // no AliasTarget — this is the legacy plain CNAME, not CloudFront-owned
      },
    ]

    const plan = computePlan(desired, live)

    expect(plan.deletes).toEqual([
      {
        name: 'www.hiteshmodi.in.',
        type: 'CNAME',
        reason: 'not in dns-records.json',
        ttlSeconds: 3600,
        values: ['hiteshmodi.in'],
      },
    ])
    expect(plan.protectedSkips).toEqual([])
  })

  it('6. PROTECTs a live NS record — never a delete candidate even though absent from desired', () => {
    const desired: DnsRecord[] = []
    const live: LiveRecord[] = [
      {
        Name: 'hiteshmodi.in.',
        Type: 'NS',
        TTL: 172800,
        ResourceRecords: [{ Value: 'ns-111.awsdns-11.com.' }],
      },
    ]

    const plan = computePlan(desired, live)

    expect(plan.deletes).toEqual([])
    expect(plan.protectedSkips).toHaveLength(1)
    expect(plan.protectedSkips[0]).toMatchObject({ type: 'NS', reason: 'NS record' })
  })

  it('7. PROTECTs a live SOA record', () => {
    const desired: DnsRecord[] = []
    const live: LiveRecord[] = [
      {
        Name: 'hiteshmodi.in.',
        Type: 'SOA',
        TTL: 900,
        ResourceRecords: [{ Value: 'ns-111.awsdns-11.com. hostmaster.awsdns.com. 1 7200 900 1209600 86400' }],
      },
    ]

    const plan = computePlan(desired, live)

    expect(plan.deletes).toEqual([])
    expect(plan.protectedSkips).toHaveLength(1)
    expect(plan.protectedSkips[0]).toMatchObject({ type: 'SOA', reason: 'SOA record' })
  })

  it('8. PROTECTs the apex A/AAAA alias record (CloudFront) — no TTL present', () => {
    const desired: DnsRecord[] = []
    const live: LiveRecord[] = [
      {
        Name: 'hiteshmodi.in.',
        Type: 'A',
        AliasTarget: { HostedZoneId: 'Z2FDTNDATAQYW2', DNSName: 'd2mlk30ybj49og.cloudfront.net.' },
      },
    ]

    const plan = computePlan(desired, live)

    expect(plan.upserts).toEqual([])
    expect(plan.deletes).toEqual([])
    expect(plan.protectedSkips).toHaveLength(1)
    expect(plan.protectedSkips[0].type).toBe('A')
  })

  it('9. PROTECT-vs-DELETE contrast for www (pairs with test 5): alias www A is protected, plain www CNAME is deleted', () => {
    const desired: DnsRecord[] = []
    const live: LiveRecord[] = [
      {
        Name: 'www.hiteshmodi.in.',
        Type: 'A',
        AliasTarget: { HostedZoneId: 'Z2FDTNDATAQYW2', DNSName: 'd2mlk30ybj49og.cloudfront.net.' },
      },
    ]

    const plan = computePlan(desired, live)

    expect(plan.deletes).toEqual([])
    expect(plan.protectedSkips).toHaveLength(1)
    expect(plan.protectedSkips[0]).toMatchObject({ type: 'A', reason: 'www alias (CloudFront-owned)' })

    // Cross-reference: test 5 above proves the non-alias www CNAME (no AliasTarget)
    // is NOT protected and lands in deletes instead — the two must never overlap.
  })

  it('10. PROTECTs ACM validation CNAMEs (both with and without a trailing dot)', () => {
    const desired: DnsRecord[] = []
    const live: LiveRecord[] = [
      {
        Name: '_abc123.hiteshmodi.in.',
        Type: 'CNAME',
        TTL: 300,
        ResourceRecords: [{ Value: '_xyz.jkddzztszm.acm-validations.aws.' }],
      },
      {
        Name: '_def456.hiteshmodi.in.',
        Type: 'CNAME',
        TTL: 300,
        ResourceRecords: [{ Value: '_uvw.jkddzztszm.acm-validations.aws' }],
      },
    ]

    const plan = computePlan(desired, live)

    expect(plan.deletes).toEqual([])
    expect(plan.protectedSkips).toHaveLength(2)
    for (const skip of plan.protectedSkips) {
      expect(skip.reason).toBe('ACM validation CNAME')
    }
  })

  it('11a. wildcard normalization: desired "*" matches live "\\052." form — in sync', () => {
    const desired: DnsRecord[] = [
      { name: '*', type: 'CNAME', ttlSeconds: 14400, values: ['cname.vercel-dns.com'] },
    ]
    const live: LiveRecord[] = [
      {
        Name: '\\052.hiteshmodi.in.',
        Type: 'CNAME',
        TTL: 14400,
        ResourceRecords: [{ Value: 'cname.vercel-dns.com' }],
      },
    ]

    const plan = computePlan(desired, live)

    expect(plan.upserts).toEqual([])
    expect(plan.deletes).toEqual([])
  })

  it('11b. wildcard normalization: desired "*" differs from live "\\052." values — UPSERT uses literal "*." FQDN', () => {
    const desired: DnsRecord[] = [
      { name: '*', type: 'CNAME', ttlSeconds: 14400, values: ['new-target.example.com'] },
    ]
    const live: LiveRecord[] = [
      {
        Name: '\\052.hiteshmodi.in.',
        Type: 'CNAME',
        TTL: 14400,
        ResourceRecords: [{ Value: 'cname.vercel-dns.com' }],
      },
    ]

    const plan = computePlan(desired, live)

    expect(plan.upserts).toHaveLength(1)
    expect(plan.upserts[0]).toMatchObject({
      name: '*.hiteshmodi.in.',
      type: 'CNAME',
      reason: 'values differ',
    })
    expect(plan.deletes).toEqual([])
  })

  it('12. TXT quoting: live raw-quoted value equals desired raw unquoted value — in sync', () => {
    const desired: DnsRecord[] = [{ name: '@', type: 'TXT', ttlSeconds: 3600, values: ['hello'] }]
    const live: LiveRecord[] = [
      {
        Name: 'hiteshmodi.in.',
        Type: 'TXT',
        TTL: 3600,
        ResourceRecords: [{ Value: '"hello"' }],
      },
    ]

    const plan = computePlan(desired, live)

    expect(plan.upserts).toEqual([])
    expect(plan.deletes).toEqual([])
  })

  it('13. MX multi-value order-insensitive equality, and a priority-changed variant UPSERTs', () => {
    const desiredInSync: DnsRecord[] = [
      {
        name: '@',
        type: 'MX',
        ttlSeconds: 3600,
        values: ['10 mail1.example.com', '20 mail2.example.com'],
      },
    ]
    const liveInSync: LiveRecord[] = [
      {
        Name: 'hiteshmodi.in.',
        Type: 'MX',
        TTL: 3600,
        ResourceRecords: [{ Value: '20 mail2.example.com' }, { Value: '10 mail1.example.com' }],
      },
    ]

    expect(computePlan(desiredInSync, liveInSync).upserts).toEqual([])

    const desiredChanged: DnsRecord[] = [
      {
        name: '@',
        type: 'MX',
        ttlSeconds: 3600,
        values: ['10 mail1.example.com', '30 mail2.example.com'],
      },
    ]

    const plan = computePlan(desiredChanged, liveInSync)
    expect(plan.upserts).toHaveLength(1)
    expect(plan.upserts[0]).toMatchObject({ type: 'MX', reason: 'values differ' })
  })

  it('16. throws when a desired entry collides with a protected live record — protected records are never touched, not even by UPSERT', () => {
    // "Missing from live" is exactly how this bug would present: the protected
    // record is filtered out of the match pool, so a desired entry at the same
    // name+type looks absent and would be blindly UPSERTed over it.
    const desired: DnsRecord[] = [
      { name: '_abc123', type: 'CNAME', ttlSeconds: 300, values: ['attacker.example.com'] },
    ]
    const live: LiveRecord[] = [
      {
        Name: '_abc123.hiteshmodi.in.',
        Type: 'CNAME',
        TTL: 300,
        ResourceRecords: [{ Value: '_xyz.jkddzztszm.acm-validations.aws.' }],
      },
    ]

    expect(() => computePlan(desired, live)).toThrow(/protected/i)
  })

  it('17. desired entry at a protected record\'s NAME but a different TYPE is not a conflict', () => {
    // The apex A alias is protected, but MX/TXT at the apex are legitimate
    // JSON-managed records — protection is keyed on name+type, not name alone.
    const desired: DnsRecord[] = [
      { name: '@', type: 'MX', ttlSeconds: 3600, values: ['10 mail.example.com'] },
    ]
    const live: LiveRecord[] = [
      {
        Name: 'hiteshmodi.in.',
        Type: 'A',
        AliasTarget: { HostedZoneId: 'Z2FDTNDATAQYW2', DNSName: 'd2mlk30ybj49og.cloudfront.net.' },
      },
    ]

    const plan = computePlan(desired, live)

    expect(plan.upserts).toHaveLength(1)
    expect(plan.upserts[0]).toMatchObject({ type: 'MX', reason: 'missing from live' })
    expect(plan.protectedSkips).toHaveLength(1)
  })

  it('14. DELETE entries echo the exact LIVE ttl/values, not any desired value', () => {
    const desired: DnsRecord[] = []
    const live: LiveRecord[] = [
      {
        Name: 'stale.hiteshmodi.in.',
        Type: 'TXT',
        TTL: 987,
        ResourceRecords: [{ Value: '"distinctive-live-value"' }],
      },
    ]

    const plan = computePlan(desired, live)

    expect(plan.deletes).toEqual([
      {
        name: 'stale.hiteshmodi.in.',
        type: 'TXT',
        reason: 'not in dns-records.json',
        ttlSeconds: 987,
        values: ['"distinctive-live-value"'],
      },
    ])
  })
})

describe('toApiValue', () => {
  it('wraps TXT values in literal double quotes', () => {
    expect(toApiValue({ type: 'TXT' }, 'hello')).toBe('"hello"')
  })

  it('passes through non-TXT values unchanged', () => {
    expect(toApiValue({ type: 'MX' }, '10 mail.example.com')).toBe('10 mail.example.com')
    expect(toApiValue({ type: 'A' }, '1.2.3.4')).toBe('1.2.3.4')
    expect(toApiValue({ type: 'CNAME' }, 'target.example.com')).toBe('target.example.com')
  })
})

describe('fetchAllLiveRecords', () => {
  it('15. accumulates ResourceRecordSets across a truncated two-page response', () => {
    const calls: string[][] = []
    const execFn = (_cmd: string, args: string[]): string => {
      calls.push(args)
      if (!args.includes('--start-record-name')) {
        return JSON.stringify({
          ResourceRecordSets: [{ Name: 'a.hiteshmodi.in.', Type: 'A', TTL: 300, ResourceRecords: [{ Value: '1.1.1.1' }] }],
          IsTruncated: true,
          NextRecordName: 'b.hiteshmodi.in.',
          NextRecordType: 'A',
        })
      }
      return JSON.stringify({
        ResourceRecordSets: [{ Name: 'b.hiteshmodi.in.', Type: 'A', TTL: 300, ResourceRecords: [{ Value: '2.2.2.2' }] }],
        IsTruncated: false,
      })
    }

    const records = fetchAllLiveRecords(execFn, 'ZONEID123')

    expect(records).toEqual([
      { Name: 'a.hiteshmodi.in.', Type: 'A', TTL: 300, ResourceRecords: [{ Value: '1.1.1.1' }] },
      { Name: 'b.hiteshmodi.in.', Type: 'A', TTL: 300, ResourceRecords: [{ Value: '2.2.2.2' }] },
    ])
    expect(calls).toHaveLength(2)
    expect(calls[1]).toEqual(
      expect.arrayContaining(['--start-record-name', 'b.hiteshmodi.in.', '--start-record-type', 'A']),
    )
  })
})
