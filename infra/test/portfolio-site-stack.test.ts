import { App } from 'aws-cdk-lib'
import { Match, Template } from 'aws-cdk-lib/assertions'
import { describe, expect, it } from 'vitest'
import { PortfolioSiteStack } from '../lib/portfolio-site-stack'

function synth(props?: { domainName?: string; hostedZoneId?: string }): Template {
  const app = new App()
  const stack = new PortfolioSiteStack(app, 'TestStack', {
    env: { account: '111111111111', region: 'us-east-1' },
    ...props,
  })
  return Template.fromStack(stack)
}

describe('PortfolioSiteStack — default (no custom domain)', () => {
  const template = synth()

  it('blocks all public access on the site bucket', () => {
    template.hasResourceProperties('AWS::S3::Bucket', {
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        BlockPublicPolicy: true,
        IgnorePublicAcls: true,
        RestrictPublicBuckets: true,
      },
    })
  })

  it('fronts the bucket with CloudFront using OAC', () => {
    template.resourceCountIs('AWS::CloudFront::OriginAccessControl', 1)
    template.hasResourceProperties('AWS::CloudFront::Distribution', {
      DistributionConfig: Match.objectLike({
        Origins: Match.arrayWith([
          Match.objectLike({ OriginAccessControlId: Match.anyValue() }),
        ]),
      }),
    })
  })

  it('redirects viewers to https', () => {
    template.hasResourceProperties('AWS::CloudFront::Distribution', {
      DistributionConfig: Match.objectLike({
        DefaultCacheBehavior: Match.objectLike({
          ViewerProtocolPolicy: 'redirect-to-https',
        }),
      }),
    })
  })

  it('caches HTML short and /_next/static/* with the immutable-friendly managed policy', () => {
    template.hasResourceProperties('AWS::CloudFront::CachePolicy', {
      CachePolicyConfig: Match.objectLike({ DefaultTTL: 300, MaxTTL: 300, MinTTL: 0 }),
    })
    template.hasResourceProperties('AWS::CloudFront::Distribution', {
      DistributionConfig: Match.objectLike({
        CacheBehaviors: Match.arrayWith([
          Match.objectLike({
            PathPattern: '/_next/static/*',
            // Managed CachingOptimized policy id
            CachePolicyId: '658327ea-f89d-4fab-a63d-7e88639e58f6',
          }),
        ]),
      }),
    })
  })

  it('rewrites directory URLs to index.html via a viewer-request function', () => {
    template.resourceCountIs('AWS::CloudFront::Function', 1)
    template.hasResourceProperties('AWS::CloudFront::Distribution', {
      DistributionConfig: Match.objectLike({
        DefaultCacheBehavior: Match.objectLike({
          FunctionAssociations: Match.arrayWith([
            Match.objectLike({ EventType: 'viewer-request' }),
          ]),
        }),
      }),
    })
  })

  it('creates no DNS or certificate resources by default', () => {
    template.resourceCountIs('AWS::Route53::RecordSet', 0)
    template.resourceCountIs('AWS::CertificateManager::Certificate', 0)
  })
})

describe('PortfolioSiteStack — with domain context', () => {
  const template = synth({ domainName: 'hiteshmodi.in', hostedZoneId: 'Z00000000000000000000' })

  it('creates a DNS-validated ACM certificate for the domain', () => {
    template.hasResourceProperties('AWS::CertificateManager::Certificate', {
      DomainName: 'hiteshmodi.in',
      ValidationMethod: 'DNS',
    })
  })

  it('aliases apex A and AAAA records to the distribution', () => {
    template.resourceCountIs('AWS::Route53::RecordSet', 2)
    template.hasResourceProperties('AWS::Route53::RecordSet', {
      Name: 'hiteshmodi.in.',
      Type: 'A',
      AliasTarget: Match.objectLike({ DNSName: Match.anyValue() }),
    })
  })

  it('attaches the alias domain to the distribution', () => {
    template.hasResourceProperties('AWS::CloudFront::Distribution', {
      DistributionConfig: Match.objectLike({ Aliases: ['hiteshmodi.in'] }),
    })
  })
})
