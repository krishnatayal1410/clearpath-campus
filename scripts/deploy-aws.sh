#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
stack_name="${CLEARPATH_STACK:-clearpath-demo}"
region="${AWS_REGION:-us-east-1}"
reserved_concurrency="${CLEARPATH_LAMBDA_CONCURRENCY:--1}"
if [[ ! "$stack_name" =~ ^[a-zA-Z][a-zA-Z0-9-]{0,39}$ ]]; then
  echo 'CLEARPATH_STACK must start with a letter and contain 1–40 letters, numbers, or hyphens.' >&2
  exit 1
fi
for tool in aws node npm zip curl; do
  command -v "$tool" >/dev/null || { echo "Required command missing: $tool" >&2; exit 1; }
done
cd "$repo_root"
export AWS_PAGER=''

# A real signed identity check happens before any deployment mutation.
aws sts get-caller-identity --region "$region" --query '{Account:Account,Arn:Arn}' --output json
echo "Deploying $stack_name in $region. AWS usage may incur charges; see docs/DEPLOYMENT.md."
npm ci --no-audit --no-fund
npm test
npm run build
bash scripts/package-lambda.sh

aws cloudformation validate-template --region "$region" --template-body file://infra/bootstrap.yaml >/dev/null
aws cloudformation validate-template --region "$region" --template-body file://infra/template.yaml >/dev/null
aws cloudformation deploy \
  --region "$region" \
  --stack-name "$stack_name-artifacts" \
  --template-file infra/bootstrap.yaml \
  --no-fail-on-empty-changeset \
  --tags Application=ClearPath DataClassification=SyntheticDemoOnly

artifact_bucket="$(aws cloudformation describe-stacks --region "$region" --stack-name "$stack_name-artifacts" --query 'Stacks[0].Outputs[?OutputKey==`ArtifactBucket`].OutputValue | [0]' --output text)"
artifact_hash="$(node --input-type=module -e "import {readFileSync} from 'node:fs'; import {createHash} from 'node:crypto'; console.log(createHash('sha256').update(readFileSync('work/clearpath-lambda.zip')).digest('hex'));")"
artifact_key="clearpath/$artifact_hash.zip"
aws s3 cp work/clearpath-lambda.zip "s3://$artifact_bucket/$artifact_key" --region "$region" --sse AES256 --only-show-errors

aws cloudformation deploy \
  --region "$region" \
  --stack-name "$stack_name" \
  --template-file infra/template.yaml \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides "ArtifactBucket=$artifact_bucket" "ArtifactKey=$artifact_key" "LambdaReservedConcurrency=$reserved_concurrency" \
  --no-fail-on-empty-changeset \
  --tags Application=ClearPath DataClassification=SyntheticDemoOnly

aws cloudformation describe-stacks --region "$region" --stack-name "$stack_name" --query 'Stacks[0].Outputs' --output json > work/deployment-outputs.json
get_output() {
  node --input-type=module - "$1" <<'NODE'
import { readFileSync } from 'node:fs';
const outputs = JSON.parse(readFileSync('work/deployment-outputs.json', 'utf8'));
const value = outputs.find(item => item.OutputKey === process.argv[2])?.OutputValue;
if (!value) throw new Error(`Missing stack output ${process.argv[2]}`);
console.log(value);
NODE
}
web_bucket="$(get_output WebBucketName)"
distribution_id="$(get_output DistributionId)"
site_url="$(get_output SiteUrl)"

# Hashed assets go first, shell last. Retaining the old assets avoids broken open tabs.
aws s3 sync dist/assets/ "s3://$web_bucket/assets/" --region "$region" --cache-control 'public,max-age=31536000,immutable' --only-show-errors
aws s3 sync dist/ "s3://$web_bucket/" --region "$region" --exclude 'assets/*' --exclude index.html --cache-control 'public,max-age=300' --only-show-errors
aws s3 cp dist/index.html "s3://$web_bucket/index.html" --region "$region" --content-type 'text/html; charset=utf-8' --cache-control 'no-cache,max-age=0,must-revalidate' --only-show-errors
aws cloudfront create-invalidation --distribution-id "$distribution_id" --paths /index.html / --output json > work/invalidation.json
aws cloudfront wait distribution-deployed --id "$distribution_id"
invalidation_id="$(node --input-type=module -e "import {readFileSync} from 'node:fs'; console.log(JSON.parse(readFileSync('work/invalidation.json','utf8')).Invalidation.Id);")"
aws cloudfront wait invalidation-completed --distribution-id "$distribution_id" --id "$invalidation_id"
bash scripts/smoke-live.sh "$site_url"
echo "Deployed and read-only smoke checked: $site_url"
echo 'Stack output receipt: work/deployment-outputs.json'
