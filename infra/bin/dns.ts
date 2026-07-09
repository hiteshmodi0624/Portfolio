#!/usr/bin/env node
import * as path from 'node:path'
import * as cdk from 'aws-cdk-lib'
import { DEFAULT_ZONE_NAME, loadDnsRecords } from '../lib/dns-records'
import { PublicDnsStack } from '../lib/public-dns-stack'

const app = new cdk.App()

const zoneName = process.env.PORTFOLIO_DNS_ZONE_NAME ?? DEFAULT_ZONE_NAME
const recordsPath = path.join(__dirname, '..', 'dns-records.json')
const records = loadDnsRecords(recordsPath)

new PublicDnsStack(app, 'PortfolioDns', {
  // Cosmetic: Route53 is global, but pinning one region keeps this app
  // consistent with the PortfolioSite app instead of using the CLI default.
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: 'us-east-1' },
  zoneName,
  records,
})
