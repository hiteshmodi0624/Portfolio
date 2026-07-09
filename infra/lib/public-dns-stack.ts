import * as cdk from 'aws-cdk-lib'
import * as route53 from 'aws-cdk-lib/aws-route53'
import type { Construct } from 'constructs'

export interface PublicDnsStackProps extends cdk.StackProps {
  /** Apex domain for the hosted zone, e.g. "hiteshmodi.in". */
  zoneName: string
}

// Records are no longer managed by CloudFormation — see infra/scripts/sync-dns.ts.
// Two production incidents (logical-id renumbering collision; a deleteExisting
// cleanup step that deleted live MX records) came from CloudFormation owning
// individual Route53 record sets. This stack now owns only the hosted zone.
export class PublicDnsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: PublicDnsStackProps) {
    super(scope, id, props)
    const { zoneName } = props

    const zone = new route53.PublicHostedZone(this, 'Zone', { zoneName })

    new cdk.CfnOutput(this, 'HostedZoneId', { value: zone.hostedZoneId })
    new cdk.CfnOutput(this, 'NameServers', {
      value: cdk.Fn.join(',', zone.hostedZoneNameServers ?? []),
    })
  }
}
