# ClearPath — submission draft

Status: submission preparation in progress, 20 September 2026. The repository is public. The Vercel browser demo returns HTTP 200 but still needs browser workflow verification. The local connected Node/SQLite application was tested in Brave, and all nine automated tests pass. AWS cloud deployment, the required YouTube video and event submission remain pending. The public demo uses localStorage and real Cedar WebAssembly; it has no live cloud API. Entrant age, eligibility and Builder Center verification remain unverified.

## Form fields

| Field | Value or draft |
| --- | --- |
| Team leader WeMakeDevs username | `krishnatayal` |
| Leader GitHub profile | https://github.com/krishnatayal1410 |
| Leader LinkedIn profile — required | https://linkedin.com/in/krishnatayal1410 — recovered from the leader's existing portfolio. |
| Project title | **ClearPath — Campus Access, Kept Open** |
| Build It checkbox | **Select.** Working AWS open-source Cedar integration in the browser and local Node API; show it in the required video. |
| Ship It checkbox | **PENDING: select only after a working AWS deployment is verified.** A deployment on another provider alone does not establish Ship It eligibility. |
| Public project repository URL | **https://github.com/krishnatayal1410/clearpath-campus** — published public repository. |
| Deployed URL — optional form field | **https://clearpath-campus.vercel.app** — live browser demo hosted on Vercel; Cedar WASM and localStorage, without a live cloud API. |
| YouTube demo URL — required | **PENDING: upload a public or unlisted video strictly under three minutes; verify signed-out access.** |

## Problem statement

A campus may have an accessible entrance on its map, but that information stops helping when a ramp is blocked or a lift is out of service. Students need an alternate route immediately, while facilities staff need enough context to fix the barrier and communicate that access is restored.

ClearPath connects those two needs. A student reports a barrier on a campus path; the route planner avoids it; the repair desk tracks the issue; and a verified repair allows the route to reopen. In the local connected application tested in Brave, the North Gate–Central Library route changed from a 745 m detour to a 120 m direct path after verification of sample entrance repair CP-1040. These are simulated graph distances, not measured benefits for real students. The demonstration uses a fictional campus and simulated incidents. Its focus is one complete, understandable operational loop.

The problem is grounded in UGC's guidance on campus mapping, infrastructure maintenance and accessible grievance handling. Sources and the scope of this research are in [RESEARCH.md](RESEARCH.md).

## How AWS is used

ClearPath uses Cedar, an AWS-origin open-source authorization language, through its WebAssembly package in the browser and Node backend. Shared policies distinguish reporting, maintenance and verification actions. The local server independently enforces Cedar before protected writes and stores scoped demo workspaces in SQLite. Tests cover cross-workspace denial, forbidden student repairs and self-verification, alongside lifecycle and persistence behavior.

The public Vercel deployment runs the browser version with localStorage. Its role switch is a demonstration tool, not production identity verification or a browser security boundary. The separate local backend uses opaque scoped tokens and conditional revisions; it is not deployed at the public URL.

Cloud deployment remains pending. AWS Lambda and DynamoDB are the proposed cloud compute and data services; list them as services actually used only after deployment and runtime verification. The final video must demonstrate the working Cedar integration and, if applicable, the actual AWS deployment. Merely mentioning AWS is insufficient.

**Video evidence required:** demonstrate the working Cedar engine, an allowed action and a denied action. Identify the browser and local-server modes accurately. The current entry is Build It; leave Ship It unselected unless a real AWS deployment is completed and checked.

## Team leader contributions

This is a solo entry for Krishna Tayal. The entrant requested and authorized the project build, deployment and submission preparation, and specified use of Brave. The project was **primarily implemented by OpenAI Codex using GPT-6**, including research, code generation, interface design, tests and documentation. This disclosure does not claim that the entrant manually wrote or reviewed the generated code, conducted user interviews, or demonstrated particular learning outcomes. Dependencies and assets are credited in the repository.

## What could be improved about AWS

The Cedar integration required different loading paths for Node and the browser, plus Vite WebAssembly setup and asynchronous loading. The generated browser WASM asset is 4,318,628 bytes, approximately 4.3 MB before HTTP compression, which is a meaningful initial-load consideration for a small interface. A concise maintained example covering shared policies, Node enforcement, browser loading and bundler setup would make this integration easier. This feedback concerns the open-source Cedar implementation experience; no cloud performance or billing experience is claimed.

## What worked well about AWS

Cedar made the authorization rules inspectable and testable. The schema check catches policy mismatches, and default-deny behavior supports a workflow where creating a report does not grant permission to declare a repair verified. Tests exercise denials for cross-workspace access, student repairs and self-verification. The same policy definitions serve the browser demonstration and the separate local Node API. This allowed real AWS open-source functionality to be demonstrated without first provisioning cloud services.

## Event completion checklist

- [ ] Confirm university enrollment in India, age 18+, tour registration, event check-in and accurate team details.
- [ ] Verify Builder Center student status or an open SheerID case; the latter permits current-event submission and judging while verification is resolved.
- [x] Publish the project repository, dependency credits and AI-tool disclosure.
- [ ] Confirm event-period originality and accurate Git history against the entry rules.
- [ ] Demonstrate actual AWS open-source or cloud functionality.
- [ ] Finish the short writeup and YouTube video under three minutes; verify signed-out video access.
- [ ] Verify the public Vercel demo's browser workflows, separate from the completed local Brave test.
- [ ] Confirm the exact cutoff in the event form and submit once per team before it closes.
- [ ] Save the successful submission confirmation and submitted links.

The [tour rules](https://www.wemakedevs.org/aws/rules) were checked on 20 September 2026. The [First Commit page](https://www.wemakedevs.org/aws/first-commit) lists 17–20 September 2026; its static content did not expose the exact cutoff time. Ship It requires AWS deployment; Best UI considers either main track. The recorded demonstration, not a later live call, is the evidence judges see. An AWS Builder Center blog is an optional additional prize opportunity.
