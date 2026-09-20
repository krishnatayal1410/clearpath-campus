#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
package_dir="$repo_root/work/lambda-package"
archive_path="$repo_root/work/clearpath-lambda.zip"
command -v zip >/dev/null || { echo 'The zip command is required.' >&2; exit 1; }
cd "$repo_root"
test -f server/lambda.mjs || { echo 'Missing server/lambda.mjs.' >&2; exit 1; }
test -f package-lock.json || { echo 'A committed npm lockfile is required.' >&2; exit 1; }

# Only this generated directory is replaced; project sources are never removed.
node --input-type=module - "$package_dir" "$archive_path" <<'NODE'
import { rmSync, mkdirSync, cpSync } from 'node:fs';
const [destination, archive] = process.argv.slice(2);
rmSync(destination, { recursive: true, force: true });
rmSync(archive, { force: true });
mkdirSync(`${destination}/src`, { recursive: true });
for (const path of ['package.json', 'package-lock.json', 'server']) cpSync(path, `${destination}/${path}`, { recursive: true });
for (const path of ['src/domain.mjs', 'src/policy.mjs']) cpSync(path, `${destination}/${path}`);
NODE

# Keep the package's actual WASM files; a JS-only bundle would break Cedar at runtime.
npm ci --prefix "$package_dir" --omit=dev --ignore-scripts --no-audit --no-fund
cd "$package_dir"
node --input-type=module -e "const adapter = await import('./server/lambda.mjs'); if (typeof adapter.handler !== 'function') throw new Error('Lambda handler export is missing'); console.log('Lambda adapter and Cedar dependency import passed.');"
zip -q -r "$archive_path" package.json package-lock.json server src node_modules
node --input-type=module - "$archive_path" <<'NODE'
import { statSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const file = process.argv[2];
const size = statSync(file).size;
console.log(JSON.stringify({ artifact: file, bytes: size, sha256: createHash('sha256').update(readFileSync(file)).digest('hex') }, null, 2));
NODE
