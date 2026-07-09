#!/usr/bin/env bash
# scripts/deploy-prod.sh — the one deploy command: npm run deploy:prod
#
# Idempotent and delegation-aware: safe to re-run any time. Chains the
# account guard, the local verify gate, the DNS stack, auto-resolved
# CloudFormation outputs (never hand-copied), delegation-aware domain
# enablement, a two-pass S3 sync + CloudFront invalidation, and a health
# check. The only thing this script cannot do is switch nameservers at the
# registrar (Hostinger) — that's outside AWS entirely.
#
# Usage:
#   npm run deploy:prod                          # full run (verify + deploy)
#   npm run deploy:prod -- --skip-verify         # skip the local verify gate
#   npm run deploy:prod -- --force-domain-removal
#       Allow deploying PortfolioSite WITHOUT the custom domain even when the
#       stack is CURRENTLY deployed WITH it. Without this flag, that
#       situation aborts loudly instead of silently deleting the live ACM
#       cert + apex alias records (see the domain-downgrade guard below).
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

APEX_DOMAIN="hiteshmodi.in"
AWS_REGION="us-east-1"

SKIP_VERIFY=0
FORCE_DOMAIN_REMOVAL=0
for arg in "$@"; do
  case "$arg" in
    --skip-verify) SKIP_VERIFY=1 ;;
    --force-domain-removal) FORCE_DOMAIN_REMOVAL=1 ;;
    *)
      echo "deploy-prod: unknown argument '$arg'" >&2
      exit 1
      ;;
  esac
done

banner() {
  echo ""
  echo "==> $1"
}

get_stack_output() {
  # $1 = stack name, $2 = output key
  aws cloudformation describe-stacks --region "$AWS_REGION" --stack-name "$1" \
    --query "Stacks[0].Outputs[?OutputKey=='$2'].OutputValue" --output text
}

normalize_ns_list() {
  # lower-case, strip trailing dot, drop blanks, sort — for a stable diff
  # between two nameserver lists regardless of order/case/trailing dots.
  tr ',' '\n' | tr 'A-Z' 'a-z' | sed 's/\.$//' | sed '/^$/d' | sort
}

stack_has_domain_mode() {
  # Detects whether the CURRENTLY deployed PortfolioSite stack already has
  # domain mode active, by checking for the Route53 alias records that only
  # exist when domainName/hostedZoneId were passed (see
  # infra/lib/portfolio-site-stack.ts: `new route53.ARecord(this,
  # 'ApexAlias', ...)` / `new route53.AaaaRecord(this, 'ApexAliasV6', ...)`).
  # CDK suffixes construct ids with an 8-char hash (confirmed via `cdk
  # synth`: logical ids are ApexAliasF68A3000 / ApexAliasV69046CB98), so the
  # match here is a prefix check, not an exact id.
  #
  # Exit codes: 0 = domain mode IS active, 1 = it is NOT (including "stack
  # doesn't exist yet", i.e. first-ever deploy — nothing to tear down).
  # Any OTHER lookup failure (permissions, throttling, ...) aborts the whole
  # script loudly rather than silently reading as "not active" — silently
  # guessing wrong here is exactly the failure mode this check exists to
  # prevent.
  local raw
  if ! raw="$(aws cloudformation list-stack-resources --region "$AWS_REGION" \
    --stack-name PortfolioSite \
    --query "StackResourceSummaries[].LogicalResourceId" --output text 2>&1)"; then
    if printf '%s' "$raw" | grep -qi 'does not exist'; then
      return 1
    fi
    echo "ERROR: could not check the currently deployed PortfolioSite stack" >&2
    echo "for custom-domain resources ('aws cloudformation" >&2
    echo "list-stack-resources' failed):" >&2
    echo "$raw" >&2
    echo "Refusing to guess — this check exists specifically to avoid" >&2
    echo "silently deleting a live ACM cert + domain alias records." >&2
    echo "Check AWS credentials/permissions and re-run." >&2
    exit 1
  fi
  printf '%s' "$raw" | tr '\t' '\n' | grep -q '^ApexAlias'
}

health_check() {
  # $1 = url, $2 = label. 3 attempts, 10s apart. Returns 0/1.
  local url="$1" label="$2" attempt body
  for attempt in 1 2 3; do
    if body="$(curl -fsSL --max-time 15 "$url" 2>/dev/null)" \
      && printf '%s' "$body" | grep -qF "A little magic for your business."; then
      echo "  OK — $label ($url) returned 200 with expected content."
      return 0
    fi
    echo "  attempt $attempt/3 for $label ($url) failed"
    if [ "$attempt" -lt 3 ]; then
      sleep 10
    fi
  done
  return 1
}

# --- a. account guard (aborts here if the wrong AWS account resolves) ----
banner "Resolving AWS account/region"
if ! . scripts/aws-env.sh; then
  exit 1
fi

# --- b. local verify gate -------------------------------------------------
if [ "$SKIP_VERIFY" -eq 1 ]; then
  banner "Skipping verify-pre-deploy.sh (--skip-verify passed)"
else
  banner "Running pre-deploy verification gate"
  ./scripts/verify-pre-deploy.sh
fi

banner "Building web static export (fresh web/out for this deploy)"
npm run build -w web

# --- c. DNS stack, every run, idempotent ---------------------------------
banner "Deploying PortfolioDns (idempotent every run)"
(cd infra && npx cdk deploy --app "npx tsx bin/dns.ts" --require-approval never)

# --- d. auto-resolve DNS outputs from CloudFormation (no hand-copied ids) -
banner "Resolving PortfolioDns outputs"
HOSTED_ZONE_ID="$(get_stack_output PortfolioDns HostedZoneId)"
NAME_SERVERS_RAW="$(get_stack_output PortfolioDns NameServers)"
ZONE_NS_SORTED="$(printf '%s' "$NAME_SERVERS_RAW" | normalize_ns_list)"
echo "  HostedZoneId : $HOSTED_ZONE_ID"
echo "  NameServers  : $NAME_SERVERS_RAW"

# --- e. delegation-aware domain decision ---------------------------------
banner "Checking DNS delegation for $APEX_DOMAIN (external resolver: 8.8.8.8)"
# Guarded explicitly (not a bare assignment): under `set -o pipefail` a dig
# failure would otherwise be swallowed by `normalize_ns_list`'s trailing
# `sort`, which still exits 0 on empty input. That would silently read as
# "not delegated" and, on a run where domain mode was already active, would
# redeploy PortfolioSite WITHOUT the domain context — tearing down the live
# ACM cert + Route53 alias records (they carry no RemovalPolicy.RETAIN).
# A network blip must abort loudly, never be mistaken for "not delegated".
if ! DIG_OUTPUT="$(dig @8.8.8.8 +time=5 +tries=2 +short NS "$APEX_DOMAIN" 2>&1)"; then
  echo "ERROR: could not query the external resolver (8.8.8.8) for NS records" >&2
  echo "of $APEX_DOMAIN. dig failed:" >&2
  echo "$DIG_OUTPUT" >&2
  echo "Refusing to guess delegation status from a failed check — this could" >&2
  echo "otherwise silently tear down a live custom-domain deploy. Check" >&2
  echo "network/DNS resolution and re-run." >&2
  exit 1
fi
PUBLIC_NS_SORTED="$(printf '%s' "$DIG_OUTPUT" | normalize_ns_list)"

DELEGATED=0
if [ -n "$PUBLIC_NS_SORTED" ] && [ "$PUBLIC_NS_SORTED" = "$ZONE_NS_SORTED" ]; then
  DELEGATED=1
fi

# Both the apex ("@") and "www" now structurally conflict with what
# PortfolioSiteStack creates: ApexAlias/ApexAliasV6 target the bare zone name,
# WwwAlias/WwwAliasV6 target "www.<domain>", and distribution.domainNames is
# [domainName, "www.<domain>"]. A static record of ANY type at either name
# (e.g. the old "www" CNAME) would conflict with the stack-owned alias
# records, so both are checked here.
HAS_STATIC_DOMAIN_RECORDS="$(node -e '
  const fs = require("fs");
  const recs = JSON.parse(fs.readFileSync("infra/dns-records.json", "utf8"));
  const bad = recs.some((r) => (r.type === "A" && r.name === "@") || r.name === "www");
  console.log(bad ? "yes" : "no");
')"

DOMAIN_MODE=0
if [ "$DELEGATED" -eq 0 ]; then
  DOMAIN_MODE=0
  echo "------------------------------------------------------------"
  echo "DNS delegation is NOT yet live for $APEX_DOMAIN."
  echo "Deploying PortfolioSite WITHOUT the custom domain for now"
  echo "(never hang waiting on a cert that can't validate pre-delegation)."
  echo ""
  echo "Switch $APEX_DOMAIN's nameservers at the registrar (Hostinger) to:"
  printf '%s\n' "$ZONE_NS_SORTED" | sed 's/^/    /'
  echo ""
  echo "Then re-run: npm run deploy:prod"
  echo "------------------------------------------------------------"
elif [ "$HAS_STATIC_DOMAIN_RECORDS" = "yes" ]; then
  DOMAIN_MODE=0
  echo "------------------------------------------------------------"
  echo "DNS is delegated, but infra/dns-records.json still has a static"
  echo "apex '@' A record or a 'www' entry. Those conflict with the"
  echo "CloudFront alias records the stack owns for the same names."
  echo ""
  echo "Deploying PortfolioSite WITHOUT the custom domain for now."
  echo "Remove the apex '@' A entry and any 'www' entries from"
  echo "infra/dns-records.json (a git-tracked edit — this script will not"
  echo "touch the file), then re-run: npm run deploy:prod"
  echo "------------------------------------------------------------"
else
  DOMAIN_MODE=1
  echo "DNS delegated and no conflicting static apex/www records — deploying"
  echo "PortfolioSite WITH domainName=$APEX_DOMAIN (ACM cert + aliases)."
fi

# --- e (cont). domain-downgrade guard -------------------------------------
# If this run computed DOMAIN_MODE=0 (e.g. a stale/failed dig answer read as
# "not delegated") but PortfolioSite is CURRENTLY deployed WITH domain mode,
# redeploying without -c domainName/-c hostedZoneId would delete the live
# ACM cert + ApexAlias/ApexAliasV6 Route53 records (see
# stack_has_domain_mode() above) — they carry no RemovalPolicy.RETAIN.
# Abort loudly instead of silently downgrading; --force-domain-removal is
# the explicit opt-out for a genuinely intended domain removal.
if [ "$DOMAIN_MODE" -eq 0 ]; then
  banner "Checking whether PortfolioSite is currently deployed WITH domain mode"
  if stack_has_domain_mode; then
    echo "  PortfolioSite IS currently deployed with domain mode active."
    if [ "$FORCE_DOMAIN_REMOVAL" -eq 1 ]; then
      echo "  --force-domain-removal passed — proceeding to deploy WITHOUT"
      echo "  the custom domain anyway (this WILL delete the live ACM cert"
      echo "  + apex alias records)."
    else
      echo "=============================================================" >&2
      echo "deploy-prod: REFUSING TO CONTINUE — this run would redeploy" >&2
      echo "PortfolioSite WITHOUT domain context, but the stack currently" >&2
      echo "deployed already has the custom domain active (found a Route53" >&2
      echo "alias resource whose logical id starts with 'ApexAlias')." >&2
      echo "" >&2
      echo "Those resources have no RemovalPolicy.RETAIN — proceeding would" >&2
      echo "DELETE the live ACM cert and the apex alias records for" >&2
      echo "$APEX_DOMAIN." >&2
      echo "" >&2
      echo "This delegation check says 'not delegated' (or a conflicting" >&2
      echo "static A record was found) — that is usually a stale/transient" >&2
      echo "answer, not an actual intent to remove the custom domain." >&2
      echo "" >&2
      echo "If you REALLY intend to remove the custom domain, re-run with:" >&2
      echo "    npm run deploy:prod -- --force-domain-removal" >&2
      echo "=============================================================" >&2
      exit 1
    fi
  else
    echo "  PortfolioSite is not currently deployed with domain mode active"
    echo "  (or does not exist yet) — nothing to protect, proceeding."
  fi
fi

# --- e (cont). deploy PortfolioSite ---------------------------------------
banner "Deploying PortfolioSite"
if [ "$DOMAIN_MODE" -eq 1 ]; then
  (cd infra && npx cdk deploy PortfolioSite --require-approval never \
    -c domainName="$APEX_DOMAIN" -c hostedZoneId="$HOSTED_ZONE_ID")
else
  (cd infra && npx cdk deploy PortfolioSite --require-approval never)
fi

banner "Resolving PortfolioSite outputs"
BUCKET_NAME="$(get_stack_output PortfolioSite BucketName)"
DISTRIBUTION_ID="$(get_stack_output PortfolioSite DistributionId)"
DISTRIBUTION_DOMAIN="$(get_stack_output PortfolioSite DistributionDomainName)"
echo "  BucketName             : $BUCKET_NAME"
echo "  DistributionId          : $DISTRIBUTION_ID"
echo "  DistributionDomainName  : $DISTRIBUTION_DOMAIN"

# --- f. two-pass content sync + invalidation ------------------------------
# --region is explicit here (not just relying on ambient AWS CLI config) to
# match the region pin used by get_stack_output — both stacks live in
# us-east-1 regardless of what `aws configure get region` resolves to.
banner "Syncing content to S3 (immutable assets first, then the rest)"
aws s3 sync web/out/_next/static "s3://$BUCKET_NAME/_next/static" \
  --region "$AWS_REGION" --cache-control "public,max-age=31536000,immutable"
aws s3 sync web/out "s3://$BUCKET_NAME" --delete --exclude "_next/static/*" \
  --region "$AWS_REGION" --cache-control "public,max-age=300"

banner "Invalidating CloudFront distribution $DISTRIBUTION_ID"
aws cloudfront create-invalidation --region "$AWS_REGION" \
  --distribution-id "$DISTRIBUTION_ID" --paths "/*" >/dev/null

# --- g. health check -------------------------------------------------------
banner "Health check"
CF_HEALTH="FAILED"
if health_check "https://$DISTRIBUTION_DOMAIN" "CloudFront domain"; then
  CF_HEALTH="OK"
fi

APEX_HEALTH="skipped (domain mode inactive)"
if [ "$DOMAIN_MODE" -eq 1 ]; then
  if health_check "https://$APEX_DOMAIN" "apex domain"; then
    APEX_HEALTH="OK"
  else
    APEX_HEALTH="WARN — not reachable yet (DNS propagation can take time); warn-only, does not fail the script"
  fi
fi

# --- h. final summary ------------------------------------------------------
banner "Summary"
echo "Deployed:"
echo "  - PortfolioDns  (HostedZoneId=$HOSTED_ZONE_ID)"
if [ "$DOMAIN_MODE" -eq 1 ]; then
  echo "  - PortfolioSite (domain mode ACTIVE: https://$APEX_DOMAIN -> https://$DISTRIBUTION_DOMAIN)"
else
  echo "  - PortfolioSite (CloudFront domain only: https://$DISTRIBUTION_DOMAIN)"
fi
echo ""
if [ "$DELEGATED" -eq 1 ]; then
  echo "Delegation status : DELEGATED (Route53 is authoritative for $APEX_DOMAIN)"
else
  echo "Delegation status : NOT delegated yet (still pointed at the old registrar/DNS host)"
fi
echo "CloudFront health check : $CF_HEALTH"
echo "Apex health check       : $APEX_HEALTH"
echo ""
echo "Remaining manual step(s):"
if [ "$DELEGATED" -eq 0 ]; then
  echo "  - Switch $APEX_DOMAIN's nameservers at Hostinger to the PortfolioDns nameservers above, then re-run npm run deploy:prod."
elif [ "$HAS_STATIC_DOMAIN_RECORDS" = "yes" ]; then
  echo "  - Remove the '@' A record and any 'www' entries from infra/dns-records.json, then re-run npm run deploy:prod."
else
  echo "  - None — domain mode is fully active."
fi

if [ "$CF_HEALTH" != "OK" ]; then
  echo "" >&2
  echo "deploy-prod: FAILING — CloudFront domain health check did not pass." >&2
  exit 1
fi
