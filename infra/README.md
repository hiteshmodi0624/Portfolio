# Portfolio infra — deploy runbook

Stack: `PortfolioSite` (us-east-1). Private S3 + CloudFront (OAC). Static files
come from `web/out` (Next.js `output: 'export'`).

## Prerequisites

- Node 22, `npm ci` run at the repo root
- AWS CLI credentials for the target account (admin for bootstrap/first deploy)

## One-time bootstrap

```bash
cd infra
npx cdk bootstrap aws://<ACCOUNT_ID>/us-east-1
```

## Manual deploy (first deploy, or without CI)

```bash
npm run build -w web

cd infra
npx cdk deploy PortfolioSite --require-approval never
cd ..

BUCKET=$(aws cloudformation describe-stacks --stack-name PortfolioSite \
  --query "Stacks[0].Outputs[?OutputKey=='BucketName'].OutputValue" --output text)
DIST_ID=$(aws cloudformation describe-stacks --stack-name PortfolioSite \
  --query "Stacks[0].Outputs[?OutputKey=='DistributionId'].OutputValue" --output text)
DOMAIN=$(aws cloudformation describe-stacks --stack-name PortfolioSite \
  --query "Stacks[0].Outputs[?OutputKey=='DistributionDomainName'].OutputValue" --output text)

# assets first (immutable), then HTML (short cache)
aws s3 sync web/out/_next/static "s3://$BUCKET/_next/static" \
  --cache-control "public,max-age=31536000,immutable"
aws s3 sync web/out "s3://$BUCKET" --delete --exclude "_next/static/*" \
  --cache-control "public,max-age=300"

aws cloudfront create-invalidation --distribution-id "$DIST_ID" --paths "/*"
echo "Live at: https://$DOMAIN"
```

Verify: open `https://$DOMAIN` — hero renders, CTA jumps to the finale,
`https://$DOMAIN/anything/` 404s to the styled 404 page.

**Note:** CloudFront error responses for 403/404 redirect to `/404.html`, which is
emitted by the Next.js export as `web/out/404.html`.

## CI deploys (GitHub Actions)

`.github/workflows/deploy.yml` deploys on pushes to main **only when** the repo
secret `AWS_DEPLOY_ROLE_ARN` is set. OIDC provider + role setup (provider,
`gha-portfolio-deploy` role, trust + permissions policies) is documented in the
workflow task of `docs/superpowers/plans/2026-07-09-freelance-portfolio-p1.md`.

## DNS cutover to hiteshmodi.in (manual, later — spec §4)

The old Vercel site stays live until the CloudFront URL is verified.

1. Ensure the Route53 hosted zone for `hiteshmodi.in` exists; note its zone id.
2. Redeploy with the domain context (creates ACM cert via DNS validation +
   apex A/AAAA aliases):
   ```bash
   cd infra
   npx cdk deploy PortfolioSite --require-approval never \
     -c domainName=hiteshmodi.in -c hostedZoneId=<ZONE_ID>
   ```
3. If the domain's nameservers are not yet Route53, switch them at the
   registrar (or CNAME/ALIAS at the current DNS host to the CloudFront domain).
4. Verify `https://hiteshmodi.in`, then pause/remove the Vercel project.

**Rollback:** point DNS back at Vercel. The distribution keeps serving on its
CloudFront domain either way.
