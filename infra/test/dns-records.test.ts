import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { describe, expect, it } from 'vitest'
import { loadDnsRecords, parseDnsRecords } from '../lib/dns-records'

describe('parseDnsRecords', () => {
  it('accepts the seeded shape', () => {
    const records = parseDnsRecords([
      { name: '@', type: 'A', ttlSeconds: 300, values: ['66.33.60.129', '76.76.21.164'] },
      { name: 'www', type: 'CNAME', ttlSeconds: 1800, values: ['target.example.com'] },
    ])
    expect(records).toHaveLength(2)
    expect(records[0]).toEqual({
      name: '@',
      type: 'A',
      ttlSeconds: 300,
      values: ['66.33.60.129', '76.76.21.164'],
    })
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
      parseDnsRecords([{ name: 'www', type: 'A', ttlSeconds: 0, values: ['1.2.3.4'] }]),
    ).toThrow(/ttlSeconds/i)
  })

  it('throws on a negative ttlSeconds', () => {
    expect(() =>
      parseDnsRecords([{ name: 'www', type: 'A', ttlSeconds: -30, values: ['1.2.3.4'] }]),
    ).toThrow(/ttlSeconds/i)
  })

  it('throws on a non-integer ttlSeconds', () => {
    expect(() =>
      parseDnsRecords([{ name: 'www', type: 'A', ttlSeconds: 30.5, values: ['1.2.3.4'] }]),
    ).toThrow(/ttlSeconds/i)
  })

  it('throws on empty values', () => {
    expect(() =>
      parseDnsRecords([{ name: 'www', type: 'A', ttlSeconds: 300, values: [] }]),
    ).toThrow(/values/i)
  })

  it('throws on a non-string value', () => {
    expect(() =>
      parseDnsRecords([{ name: 'www', type: 'A', ttlSeconds: 300, values: [123] }]),
    ).toThrow(/values/i)
  })

  it('throws on a name with a trailing dot', () => {
    expect(() =>
      parseDnsRecords([{ name: 'www.', type: 'A', ttlSeconds: 300, values: ['1.2.3.4'] }]),
    ).toThrow(/trailing dot/i)
  })

  it('throws on a name containing the apex domain', () => {
    expect(() =>
      parseDnsRecords([
        { name: 'www.hiteshmodi.in', type: 'A', ttlSeconds: 300, values: ['1.2.3.4'] },
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
