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
#   npm run deploy:prod                 # full run (verify + deploy)
#   npm run deploy:prod -- --skip-verify # skip the local verify gate
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

APEX_DOMAIN="hiteshmodi.in"
AWS_REGION="us-east-1"

SKIP_VERIFY=0
for arg in "$@"; do
  case "$arg" in
    --skip-verify) SKIP_VERIFY=1 ;;
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

# Only the apex ("@") structurally conflicts with what PortfolioSiteStack
# creates: ApexAlias/ApexAliasV6 target the bare zone name only, and
# distribution.domainNames is just [domainName] (the apex) — there is no
# "www" alias anywhere in the stack. A static "www" A record does not
# conflict with anything CDK manages here, so it is intentionally excluded
# from this check (removing it would orphan www.hiteshmodi.in for no
# corresponding replacement).
HAS_STATIC_APEX_A="$(node -e '
  const fs = require("fs");
  const recs = JSON.parse(fs.readFileSync("infra/dns-records.json", "utf8"));
  const bad = recs.some((r) => r.type === "A" && r.name === "@");
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
elif [ "$HAS_STATIC_APEX_A" = "yes" ]; then
  DOMAIN_MODE=0
  echo "------------------------------------------------------------"
  echo "DNS is delegated, but infra/dns-records.json still has a static"
  echo "apex '@' A record. A static A record and the CloudFront alias"
  echo "A record cannot coexist for the same name."
  echo ""
  echo "Deploying PortfolioSite WITHOUT the custom domain for now."
  echo "Remove the '@' A entry from infra/dns-records.json"
  echo "(a git-tracked edit — this script will not touch the file),"
  echo "then re-run: npm run deploy:prod"
  echo "------------------------------------------------------------"
else
  DOMAIN_MODE=1
  echo "DNS delegated and no conflicting static A records — deploying"
  echo "PortfolioSite WITH domainName=$APEX_DOMAIN (ACM cert + aliases)."
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
elif [ "$HAS_STATIC_APEX_A" = "yes" ]; then
  echo "  - Remove the '@' A record from infra/dns-records.json, then re-run npm run deploy:prod."
else
  echo "  - None — domain mode is fully active."
fi

if [ "$CF_HEALTH" != "OK" ]; then
  echo "" >&2
  echo "deploy-prod: FAILING — CloudFront domain health check did not pass." >&2
  exit 1
fi
