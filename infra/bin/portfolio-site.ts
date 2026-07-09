#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib'
import { PortfolioSiteStack } from '../lib/portfolio-site-stack'

const app = new cdk.App()

new PortfolioSiteStack(app, 'PortfolioSite', {
  // us-east-1 always: CloudFront certificates must live there, and the
  // static site has no other regional affinity.
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: 'us-east-1' },
  domainName: app.node.tryGetContext('domainName'),
  hostedZoneId: app.node.tryGetContext('hostedZoneId'),
})
