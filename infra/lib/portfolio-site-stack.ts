import * as cdk from 'aws-cdk-lib'
import * as acm from 'aws-cdk-lib/aws-certificatemanager'
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront'
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins'
import * as route53 from 'aws-cdk-lib/aws-route53'
import * as targets from 'aws-cdk-lib/aws-route53-targets'
import * as s3 from 'aws-cdk-lib/aws-s3'
import type { Construct } from 'constructs'

export interface PortfolioSiteStackProps extends cdk.StackProps {
  /** Apex domain, e.g. "hiteshmodi.in". Omit to serve on the CloudFront domain only. */
  domainName?: string
  /** Existing Route53 hosted zone id for domainName. Required when domainName is set. */
  hostedZoneId?: string
}

export class PortfolioSiteStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: PortfolioSiteStackProps = {}) {
    super(scope, id, props)
    const { domainName, hostedZoneId } = props

    if (domainName && !hostedZoneId) {
      throw new Error('hostedZoneId is required when domainName is set')
    }

    const siteBucket = new s3.Bucket(this, 'SiteBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    })

    // HTML must revalidate quickly after deploys; hashed assets are immutable
    // (their long cache lives in the s3 sync --cache-control headers + the
    // managed CachingOptimized policy on /_next/static/*).
    const htmlCachePolicy = new cloudfront.CachePolicy(this, 'HtmlShortCache', {
      comment: 'Short cache for HTML (max-age=300)',
      defaultTtl: cdk.Duration.seconds(300),
      maxTtl: cdk.Duration.seconds(300),
      minTtl: cdk.Duration.seconds(0),
      enableAcceptEncodingGzip: true,
      enableAcceptEncodingBrotli: true,
    })

    // Static export uses trailing-slash directory URLs: /x/ -> /x/index.html.
    const indexRewriteFunction = new cloudfront.Function(this, 'IndexRewriteFn', {
      runtime: cloudfront.FunctionRuntime.JS_2_0,
      code: cloudfront.FunctionCode.fromInline(
        [
          'function handler(event) {',
          '  var request = event.request;',
          '  var uri = request.uri;',
          "  if (uri.endsWith('/')) {",
          "    request.uri = uri + 'index.html';",
          "  } else if (!uri.split('/').pop().includes('.')) {",
          "    request.uri = uri + '/index.html';",
          '  }',
          '  return request;',
          '}',
        ].join('\n'),
      ),
    })

    let certificate: acm.ICertificate | undefined
    let hostedZone: route53.IHostedZone | undefined
    if (domainName && hostedZoneId) {
      hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, 'Zone', {
        hostedZoneId,
        zoneName: domainName,
      })
      // Stack is pinned to us-east-1 (bin/), which CloudFront certs require.
      certificate = new acm.Certificate(this, 'SiteCertificate', {
        domainName,
        validation: acm.CertificateValidation.fromDns(hostedZone),
      })
    }

    // One origin instance reused across behaviors => a single origin + OAC.
    const siteOrigin = origins.S3BucketOrigin.withOriginAccessControl(siteBucket)

    const distribution = new cloudfront.Distribution(this, 'SiteDistribution', {
      comment: 'hiteshmodi.in portfolio (static export)',
      defaultRootObject: 'index.html',
      defaultBehavior: {
        origin: siteOrigin,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: htmlCachePolicy,
        functionAssociations: [
          {
            function: indexRewriteFunction,
            eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
          },
        ],
      },
      additionalBehaviors: {
        '/_next/static/*': {
          origin: siteOrigin,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        },
      },
      errorResponses: [
        {
          httpStatus: 403, // S3+OAC answers 403 for missing keys
          responseHttpStatus: 404,
          responsePagePath: '/404.html',
          ttl: cdk.Duration.seconds(300),
        },
        {
          httpStatus: 404,
          responseHttpStatus: 404,
          responsePagePath: '/404.html',
          ttl: cdk.Duration.seconds(300),
        },
      ],
      ...(domainName && certificate ? { domainNames: [domainName], certificate } : {}),
    })

    if (domainName && hostedZone) {
      const target = route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution))
      new route53.ARecord(this, 'ApexAlias', { zone: hostedZone, target })
      new route53.AaaaRecord(this, 'ApexAliasV6', { zone: hostedZone, target })
    }

    new cdk.CfnOutput(this, 'BucketName', { value: siteBucket.bucketName })
    new cdk.CfnOutput(this, 'DistributionId', { value: distribution.distributionId })
    new cdk.CfnOutput(this, 'DistributionDomainName', {
      value: distribution.distributionDomainName,
    })
  }
}
