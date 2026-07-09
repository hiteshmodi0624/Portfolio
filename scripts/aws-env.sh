# scripts/aws-env.sh — SOURCE this file, do not execute it:
#
#   . scripts/aws-env.sh
#
# Resolves and exports CDK_DEFAULT_ACCOUNT / CDK_DEFAULT_REGION so no cdk:*
# command ever needs a hand-exported value. Honors a pre-set AWS_PROFILE
# (never overrides it). Hard-guards against deploying into the wrong AWS
# account — this repo already suffered one wrong-account deploy attempt, so
# the guard is not optional.
#
# POSIX sh: safe to source from bash or zsh.

# --- must be sourced, not executed -------------------------------------
if (return 0 2>/dev/null); then
  _AWS_ENV_SOURCED=1
else
  _AWS_ENV_SOURCED=0
fi

if [ "$_AWS_ENV_SOURCED" -eq 0 ]; then
  echo "aws-env.sh must be sourced, not executed. Run: . scripts/aws-env.sh" >&2
  exit 1
fi
unset _AWS_ENV_SOURCED

EXPECTED_ACCOUNT="901920055181"

if [ -n "${AWS_PROFILE:-}" ]; then
  echo "aws-env: honoring pre-set AWS_PROFILE=$AWS_PROFILE"
fi

RESOLVED_ACCOUNT="$(aws sts get-caller-identity --query Account --output text 2>/dev/null)"
if [ -z "$RESOLVED_ACCOUNT" ] || [ "$RESOLVED_ACCOUNT" = "None" ]; then
  echo "=============================================================" >&2
  echo "aws-env: ERROR — could not resolve an AWS account." >&2
  echo "  'aws sts get-caller-identity' failed. Check your credentials" >&2
  echo "  (aws configure / AWS_PROFILE) and try again." >&2
  echo "=============================================================" >&2
  return 1
fi

ALLOWED_ACCOUNT="${PORTFOLIO_ALLOW_ACCOUNT:-$EXPECTED_ACCOUNT}"
if [ "$RESOLVED_ACCOUNT" != "$ALLOWED_ACCOUNT" ]; then
  echo "=============================================================" >&2
  echo "aws-env: REFUSING TO CONTINUE — WRONG AWS ACCOUNT" >&2
  echo "  expected account : $ALLOWED_ACCOUNT" >&2
  echo "  resolved account : $RESOLVED_ACCOUNT" >&2
  echo "" >&2
  echo "  This repo previously suffered a wrong-account deploy attempt." >&2
  echo "  If deploying into $RESOLVED_ACCOUNT is genuinely intended," >&2
  echo "  override the guard explicitly:" >&2
  echo "" >&2
  echo "    PORTFOLIO_ALLOW_ACCOUNT=$RESOLVED_ACCOUNT . scripts/aws-env.sh" >&2
  echo "=============================================================" >&2
  return 1
fi

RESOLVED_REGION="$(aws configure get region 2>/dev/null)"
if [ -z "$RESOLVED_REGION" ]; then
  RESOLVED_REGION="us-east-1"
fi

export CDK_DEFAULT_ACCOUNT="$RESOLVED_ACCOUNT"
export CDK_DEFAULT_REGION="$RESOLVED_REGION"

echo "aws-env: account=$CDK_DEFAULT_ACCOUNT region=$CDK_DEFAULT_REGION (stacks pin us-east-1 regardless)"
