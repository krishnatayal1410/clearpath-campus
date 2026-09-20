# ClearPath API and authorization

ClearPath is a working demonstration with an illustrative campus map and synthetic reports. Every new demo session gets an isolated workspace. It does not submit maintenance requests to a real institution. Production enrollment, staff identity verification, real route surveys and moderation are outside this demo.

## Run locally

Use Node.js 22.13 or newer. Run `npm run server` for the API on `127.0.0.1:8787`, and `npm run dev` for the Vite UI. The Vite proxy forwards `/api` to the local server. After `npm run build`, the API can also serve the compiled UI itself. The SQLite file is `.data/clearpath.sqlite`; set `DATABASE_PATH` to change it. Bind another host only deliberately using `HOST`.

## Requests

All bodies are JSON. Authenticated requests carry `Authorization: Bearer <token>`. Tokens are opaque 256-bit values; only SHA-256 hashes are stored. Tokens are scoped to one workspace and role, expire after 24 hours, and rotate on role changes. A demo role switch is explicitly not production identity verification.

| Method | Path | Body | Result |
| --- | --- | --- | --- |
| GET | `/api/health` | — | Storage connectivity and actual Cedar engine version |
| POST | `/api/session` | `{ "role": "student" }` | New isolated workspace, token, principal, state, expiration |
| GET | `/api/state` | — | Current state, principal and workspace revision |
| POST | `/api/role` | `{ "role": "facilities" }` | Same workspace, new role token, principal and state |
| POST | `/api/actions` | `{ "type": "start", "id": "CP-1042", "version": 1 }` | Updated state, revision and Cedar authorization evidence |

Roles are `student`, `facilities` and `verifier`. Actions are `create`, `support`, `assign`, `start`, `repair`, `verify` and `reopen`. Assignment accepts `payload.assignee`; repair requires `payload.note` between 12 and 2,000 characters. Reopening accepts an explanatory note. Creating requires title, description, location, connected edge ID, category and priority. The UI uses the shared `PLACES` and `EDGES` constants for valid selections.

Supply the selected report's `version` on every mutation. A stale version returns HTTP 409. The server also checks workspace revisions atomically so concurrent writes never silently overwrite one another. An expired or missing session returns 401, forbidden actions return 403, missing reports return 404, and invalid inputs return 400. Bodies above 48 KB are rejected.

## Authorization and lifecycle

The server runs the official `@cedar-policy/cedar-wasm` engine, validates its schema and policies at startup, and evaluates Cedar on every protected read and mutation. It derives principals from stored sessions rather than accepting a client role. Unknown actions, missing policies and evaluation errors fail closed. The browser imports the same request builder and policies for its local sandbox; the browser decision is not trusted by the API.

- Students create and support reports; the original reporter can reopen a failed repair.
- Facilities staff assign reports, start work and submit a repair note.
- A verifier independently confirms completion. The principal who repaired a barrier cannot verify that same repair.
- Every policy requires matching workspace membership.

The report lifecycle is `Reported → In progress → Awaiting verification → Resolved`. A submitted repair stays blocked on the map until verification. Reopening returns the report to `Reported`. Dijkstra's algorithm skips unresolved blocked edges and, in step-free mode, edges containing steps. Lighting reports remain visible without automatically claiming a physical route is impassable. The map is illustrative and its distances are simulated, so it must not be presented as surveyed navigation guidance.

## Storage and deployment

Local mode uses Node's built-in SQLite and conditional revision updates. The Lambda entry point is `server/lambda.handler`. Set `TABLE_NAME` to a DynamoDB table with `PK` and `SK` string keys, and enable TTL on `expiresAt`. Workspace state uses `PK=WORKSPACE#<id>, SK=STATE`; hashed sessions use `PK=SESSION#<hash>, SK=SESSION`. Required IAM data actions are `dynamodb:GetItem`, `dynamodb:PutItem` and `dynamodb:DeleteItem` on that table only.

The Lambda package includes all `server/` files, `src/domain.mjs`, `src/policy.mjs`, `package.json`, and production dependencies. The Cedar Node package loads its WASM binary from disk, so preserve `node_modules/@cedar-policy/cedar-wasm/nodejs/cedar_wasm_bg.wasm`. Use the Node.js 22 runtime. Never run SQLite as persistent Lambda storage.

Serve frontend and `/api/*` under the same CloudFront origin, or set `ALLOWED_ORIGIN` to the exact frontend origin when cross-origin requests are required. API responses are not cacheable. Each workspace is capped at 250 reports and 300 KB serialized state; the activity feed retains its 500 newest entries. DynamoDB TTL removes expired demo records eventually; the service immediately rejects expired sessions regardless of cleanup timing. API Gateway throttling and Lambda concurrency limits should be set in deployment infrastructure.

## Validation

Run `npm test` for real Cedar policy validation, denial cases, lifecycle/route behavior, input validation, session isolation, role-token rotation, independent verification and optimistic concurrency. These tests do not verify a live AWS deployment; that requires live health and workflow checks after publishing.
