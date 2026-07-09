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
`-- --skip-verify` to skip it on a re-run), deploys the zone-only
`PortfolioDns` stack (idempotent every run), **syncs DNS records from
`infra/dns-records.json` straight to Route53** (`npm run sync:dns -- --apply`
under the hood — see "DNS maintenance" below), auto-resolves every
id/hostname it needs from CloudFormation outputs (nothing hand-copied),
checks live DNS delegation against an external resolver and enables the
custom domain automatically once it's safe to do so, syncs `web/out` to S3 in
two passes, invalidates CloudFront, and health-checks the result.
`npm run verify` runs just the local gate on its own.

**The script is idempotent and delegation-aware — safe to re-run any time.**
Domain mode (the ACM cert + `hiteshmodi.in` + `www.hiteshmodi.in` alias
records) activates on its own once nameserver delegation is live; until then
it deploys `PortfolioSite` on its CloudFront domain only and tells you
exactly what's still needed. Both the apex and `www` are stack-owned in
domain mode — the ACM cert carries `www.hiteshmodi.in` as a SAN and the
distribution aliases both names — so `infra/dns-records.json` must never
carry an apex (`@`) A record or any `www` entry. That rule is enforced in
code: `loadDnsRecords` rejects both shapes at load time with a descriptive
error, and the DNS record sync never touches the stack-owned alias records
anyway (they are in its protected classes — see below).

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

DNS for `hiteshmodi.in` is split between two owners:

- **The zone itself** — the `PortfolioDns` CDK stack (`bin/dns.ts` /
  `PublicDnsStack`) owns *only* the `PublicHostedZone` plus its
  `HostedZoneId`/`NameServers` outputs. `npm run deploy:dns` deploys it
  (idempotent; only ever needed to create the zone or change zone-level
  config).
- **Every individual record** — `infra/scripts/sync-dns.ts`, which reads
  `infra/dns-records.json` and applies it **directly against the Route53
  API**. Records never pass through CloudFormation: CFN-managed record sets
  caused two production incidents (a logical-id renumbering collision that
  failed a stack update, then a `deleteExisting` cleanup that deleted the
  live MX records), so record management was moved out of CloudFormation
  entirely.

**`infra/dns-records.json` is the single source of truth for every synced
record; the AWS Console is never touched.** `npm run sync:dns` is the only
sanctioned way to change DNS records.

### Change flow

1. Edit `infra/dns-records.json` (add/change/remove a record). Malformed
   entries (bad `type`, non-positive `ttlSeconds`, empty `values`, a `name`
   with a trailing dot or the apex domain baked in, an apex `@` A record, or
   any `www` entry — those two names are stack-owned CloudFront aliases) fail
   loudly at `loadDnsRecords` — if `sync:dns` errors immediately with
   `Invalid DNS records file: …`, the JSON file is the bug, not AWS.
2. ```bash
   cd infra
   npm run sync:dns        # dry run — prints the UPSERT/DELETE/SKIP plan
   ```
   Confirm only the intended record changes. (`npm run diff:dns` is an alias
   for the same dry run.)
3. ```bash
   npm run sync:dns -- --apply
   ```
   Applies the whole plan as **one batched** Route53
   `change-resource-record-sets` call and prints the ChangeInfo status.
   `npm run deploy:prod` also runs this apply automatically on every deploy.
4. Verify against an **external** resolver, not your machine's (a local
   resolver can cache a stale answer):
   ```bash
   dig @8.8.8.8 hiteshmodi.in A
   ```

### How the sync decides what to touch

`computePlan` (unit-tested in `test/sync-dns.test.ts`) diffs desired
(`dns-records.json`) against live (Route53):

- **UPSERT** — a desired record missing from live, or present with a
  different TTL or different values (value comparison is order-insensitive;
  TXT quoting and the `*` ↔ `\052` wildcard escape are normalized).
- **DELETE** — a live record of a managed type (A/CNAME/TXT/MX) that is not
  in `dns-records.json` and not protected. Deletes always use the live
  record's exact TTL/values, as the Route53 API requires.
- **PROTECTED (never touched, even if a JSON entry matches):**
  - `NS` and `SOA` records
  - any record with an `AliasTarget` (the CloudFront apex/`www` A+AAAA
    aliases owned by the `PortfolioSite` stack)
  - the apex A/AAAA at `hiteshmodi.in.` (belt-and-suspenders, alias or not)
  - any CNAME pointing into `.acm-validations.aws` (ACM cert validation)
  - any record type outside A/CNAME/TXT/MX

A `www` record **without** an `AliasTarget` (e.g. the legacy plain CNAME) is
deliberately *not* protected — it gets deleted once it's absent from the
JSON, which is exactly how the legacy `www` CNAME is retired.

If the plan is empty the script prints that DNS is in sync and exits 0. The
zone id is auto-resolved from the `PortfolioDns` stack's `HostedZoneId`
output; pass `--zone-id <id>` to override.

### Mail records

SPF (`"v=spf1 include:_spf.google.com ~all"`) and DMARC
(`"v=DMARC1; p=none; rua=mailto:mail@hiteshmodi.in"`) TXT records are seeded
in `dns-records.json`, alongside the Google Workspace MX set. DMARC starts at
`p=none` deliberately — a monitoring-first policy, since
`quarantine`/`reject` affect mail deliverability and should only follow once
DMARC reports show clean alignment.
