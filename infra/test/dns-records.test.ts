import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { describe, expect, it } from 'vitest'
import { loadDnsRecords, parseDnsRecords } from '../lib/dns-records'

describe('parseDnsRecords', () => {
  it('accepts the seeded shape', () => {
    const records = parseDnsRecords([
      { name: '@', type: 'MX', ttlSeconds: 300, values: ['10 mail.example.com'] },
      { name: 'blog', type: 'CNAME', ttlSeconds: 1800, values: ['target.example.com'] },
    ])
    expect(records).toHaveLength(2)
    expect(records[0]).toEqual({
      name: '@',
      type: 'MX',
      ttlSeconds: 300,
      values: ['10 mail.example.com'],
    })
  })

  it('throws when the apex has an A record', () => {
    expect(() =>
      parseDnsRecords([{ name: '@', type: 'A', ttlSeconds: 300, values: ['1.2.3.4'] }]),
    ).toThrow(/apex/i)
  })

  it('throws on any www entry', () => {
    expect(() =>
      parseDnsRecords([{ name: 'www', type: 'CNAME', ttlSeconds: 300, values: ['x.example.com'] }]),
    ).toThrow(/www/i)
  })

  it('throws on a www entry regardless of record type', () => {
    expect(() =>
      parseDnsRecords([{ name: 'www', type: 'TXT', ttlSeconds: 300, values: ['some-text'] }]),
    ).toThrow(/www/i)
  })

  it('still allows "@" with MX and TXT records (apex rejection is A-only)', () => {
    expect(() =>
      parseDnsRecords([{ name: '@', type: 'MX', ttlSeconds: 300, values: ['10 mail.example.com'] }]),
    ).not.toThrow()
    expect(() =>
      parseDnsRecords([{ name: '@', type: 'TXT', ttlSeconds: 300, values: ['some-text'] }]),
    ).not.toThrow()
  })

  it('throws on a non-array root', () => {
    expect(() => parseDnsRecords({ not: 'an array' })).toThrow(/array/i)
  })

  it('throws on a bad record type', () => {
    expect(() =>
      parseDnsRecords([{ name: 'www', type: 'NS', ttlSeconds: 300, values: ['x'] }]),
    ).toThrow(/type/i)
  })

  it('throws on ttlSeconds of 0', () => {
    expect(() =>
      parseDnsRecords([{ name: 'sub', type: 'A', ttlSeconds: 0, values: ['1.2.3.4'] }]),
    ).toThrow(/ttlSeconds/i)
  })

  it('throws on a negative ttlSeconds', () => {
    expect(() =>
      parseDnsRecords([{ name: 'sub', type: 'A', ttlSeconds: -30, values: ['1.2.3.4'] }]),
    ).toThrow(/ttlSeconds/i)
  })

  it('throws on a non-integer ttlSeconds', () => {
    expect(() =>
      parseDnsRecords([{ name: 'sub', type: 'A', ttlSeconds: 30.5, values: ['1.2.3.4'] }]),
    ).toThrow(/ttlSeconds/i)
  })

  it('throws on empty values', () => {
    expect(() =>
      parseDnsRecords([{ name: 'sub', type: 'A', ttlSeconds: 300, values: [] }]),
    ).toThrow(/values/i)
  })

  it('throws on a non-string value', () => {
    expect(() =>
      parseDnsRecords([{ name: 'sub', type: 'A', ttlSeconds: 300, values: [123] }]),
    ).toThrow(/values/i)
  })

  it('throws on a name with a trailing dot', () => {
    expect(() =>
      parseDnsRecords([{ name: 'sub.', type: 'A', ttlSeconds: 300, values: ['1.2.3.4'] }]),
    ).toThrow(/trailing dot/i)
  })

  it('throws on a name containing the apex domain', () => {
    expect(() =>
      parseDnsRecords([
        { name: 'sub.hiteshmodi.in', type: 'A', ttlSeconds: 300, values: ['1.2.3.4'] },
      ]),
    ).toThrow(/apex domain/i)
  })
})

describe('loadDnsRecords', () => {
  it('returns [] when the file is missing', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dns-records-'))
    expect(loadDnsRecords(path.join(tmpDir, 'missing.json'))).toEqual([])
  })

  it('wraps a malformed-shape error with "Invalid DNS records file"', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dns-records-'))
    const filePath = path.join(tmpDir, 'bad.json')
    fs.writeFileSync(filePath, JSON.stringify({ not: 'an array' }))
    expect(() => loadDnsRecords(filePath)).toThrow(/Invalid DNS records file/)
  })

  it('wraps a JSON syntax error with "Invalid DNS records file"', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dns-records-'))
    const filePath = path.join(tmpDir, 'invalid.json')
    fs.writeFileSync(filePath, '{not valid json')
    expect(() => loadDnsRecords(filePath)).toThrow(/Invalid DNS records file/)
  })

  it('loads and parses a valid file', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dns-records-'))
    const filePath = path.join(tmpDir, 'good.json')
    fs.writeFileSync(
      filePath,
      JSON.stringify([{ name: '@', type: 'TXT', ttlSeconds: 3600, values: ['hello'] }]),
    )
    expect(loadDnsRecords(filePath)).toEqual([
      { name: '@', type: 'TXT', ttlSeconds: 3600, values: ['hello'] },
    ])
  })
})
