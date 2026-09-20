#!/usr/bin/env bash
set -euo pipefail
site_url="${1:?Usage: bash scripts/smoke-live.sh https://your-site.example}"
site_url="${site_url%/}"
if [[ "$site_url" != https://* && "$site_url" != http://127.0.0.1:* && "$site_url" != http://localhost:* ]]; then
  echo 'Use an HTTPS deployment URL or local development server.' >&2
  exit 1
fi
health_body="$(curl --fail --silent --show-error --retry 3 --retry-delay 2 "$site_url/api/health")"
node --input-type=module - "$health_body" <<'NODE'
const health = JSON.parse(process.argv[2]);
if (health.ok !== true && health.status !== 'ok') throw new Error(`Unexpected API health response: ${JSON.stringify(health)}`);
console.log('API health:', JSON.stringify(health));
NODE
curl --fail --silent --show-error --retry 3 "$site_url/" | node --input-type=module -e "let s=''; for await (const c of process.stdin) s+=c; if (!s.includes('<div id=\"root\"') || !s.includes('/assets/')) throw new Error('Built frontend app shell not found'); console.log('Built frontend app shell reachable.');"
echo 'Read-only live smoke passed. Follow the full role/workspace journey in docs/DEPLOYMENT.md.'
