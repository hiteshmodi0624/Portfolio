# Portfolio infra — deploy runbook

Stack: `PortfolioSite` (us-east-1). Private S3 + CloudFront (OAC). Static files
come from `web/out` (Next.js `output: 'export'`).

## One-command deploy

From the repo root:

```bash
npm run deploy:prod
```

This is the whole production deploy: it resolves your AWS account/region and
hard-guards against the wrong account, runs the full local verify gate (lint,
typecheck, unit tests, build, E2E, `cdk synth` for both infra apps — pass
`-- --skip-verify` to skip it on a re-run), deploys `PortfolioDns` (idempotent
every run), auto-resolves every id/hostname it needs from CloudFormation
outputs (nothing hand-copied), checks live DNS delegation against an external
resolver and enables the custom domain automatically once it's safe to do so,
syncs `web/out` to S3 in two passes, invalidates CloudFront, and health-checks
the result. `npm run verify` runs just the local gate on its own.

**The script is idempotent and delegation-aware — safe to re-run any time.**
Domain mode (the ACM cert + `hiteshmodi.in` alias records) activates on its
own on a later run, once nameserver delegation is live and the static
apex/`www` A records have been removed from `infra/dns-records.json`; until
then it deploys `PortfolioSite` on its CloudFront domain only and tells you
exactly what's still needed.

Only three things stay genuinely manual (nothing here can reach outside AWS
or mint credentials on your behalf):

1. **Hostinger nameserver delegation (one-time).** Pointing `hiteshmodi.in`
   at the four `PortfolioDns` nameservers happens at the registrar — outside
   AWS entirely. `npm run deploy:prod` prints them when delegation isn't live
   yet.
2. **First-time AWS credentials on a new machine** (`aws configure` or
   `aws configure sso`) — establishing your own AWS identity is inherently a
   one-time local action.
3. **First-time `cdk bootstrap`** for account `901920055181` / `us-east-1` —
   already done; only needed again for a new account/region.

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

## DNS maintenance

DNS for `hiteshmodi.in` is managed by its own CDK app (`bin/dns.ts` /
`PublicDnsStack`), independent of `PortfolioSite`. **`infra/dns-records.json`
is the single source of truth for every record; the AWS Console is never
touched.** `npm run diff:dns` / `npm run deploy:dns` are the only sanctioned
way to change DNS.

### Change flow

1. Edit `infra/dns-records.json` (add/change/remove a record). Malformed
   entries (bad `type`, non-positive `ttlSeconds`, empty `values`, a `name`
   with a trailing dot or the apex domain baked in) fail loudly at
   `loadDnsRecords` — if `diff:dns`/`deploy:dns` errors immediately with
   `Invalid DNS records file: …`, the JSON file is the bug, not CDK/AWS.
2. ```bash
   cd infra
   npm run diff:dns
   ```
   Confirm only the intended record changed.
3. ```bash
   npm run deploy:dns
   ```
4. Verify against an **external** resolver, not your machine's (a local
   resolver can cache a stale answer):
   ```bash
   dig @8.8.8.8 hiteshmodi.in A
   ```

### Migrating DNS from Vercel to Route53

The zone is pre-seeded with the exact records Vercel's DNS answers today
(apex/`www` A, Google Workspace MX, the Google site-verification TXT), so
delegating the domain to Route53 is a no-op for the site and for mail — the
answers don't change, only who serves them.

1. `npm run deploy:dns` creates the hosted zone, pre-seeded with the current
   records from `dns-records.json`.
2. **Before touching the registrar**, verify the new zone answers match
   `dig @8.8.8.8` by querying the zone's own name servers directly (printed
   as the `NameServers` stack output):
   ```bash
   dig @<ns1-from-output> hiteshmodi.in A
   dig @<ns1-from-output> www.hiteshmodi.in A
   dig @<ns1-from-output> hiteshmodi.in MX
   dig @<ns1-from-output> hiteshmodi.in TXT
   ```
3. Switch NS at the registrar to the four `NameServers` printed by the
   `deploy:dns` output.
4. Wait for propagation. Verify mail flow (send/receive) and that the site is
   still reachable — at this point traffic is still Vercel-served, Route53 is
   just answering the same way Vercel's DNS did.
5. **Cutover to CloudFront** (later, separate step): remove the `@` A and
   `www` A entries from `dns-records.json` and run `deploy:dns`, then deploy
   `PortfolioSite` with `-c domainName=hiteshmodi.in -c hostedZoneId=<id>`
   (creates the alias A/AAAA records + ACM cert against the same zone). A
   static `A` record and a CloudFront alias `A` record cannot coexist for the
   same name — the JSON entries must be removed first, or the deploy will
   conflict.
6. **Rollback:** re-add the removed Vercel `A` records to `dns-records.json`
   and run `deploy:dns`.

**Known gap:** no SPF or DMARC TXT records exist in the current DNS today —
this is inherited from the existing setup, not introduced by this migration.
Adding `"v=spf1 include:_spf.google.com ~all"` and a DMARC policy is a
worthwhile follow-up, but a deliberate decision (DMARC policy strictness
affects mail deliverability) rather than something to auto-add here.
