# ClearPath — submission draft

Status: submission preparation in progress, 20 September 2026. The browser demo is deployed on Vercel and its route-verification flow has been checked in Brave. The local Node/SQLite backend is tested, with eight tests passing. An AWS cloud deployment, YouTube upload and event submission remain pending. The deployed browser demo uses localStorage and real Cedar WebAssembly; it has no live cloud API.

## Form fields

| Field | Value or draft |
| --- | --- |
| Team leader WeMakeDevs username | `krishnatayal` |
| Leader GitHub profile | https://github.com/krishnatayal1410 |
| Leader LinkedIn profile — required | https://linkedin.com/in/krishnatayal1410 — recovered from the leader's existing portfolio. |
| Project title | **ClearPath — Campus Access, Kept Open** |
| Build It checkbox | **Select.** Working AWS open-source Cedar integration in the browser and local Node API; show it in the required video. |
| Ship It checkbox | **PENDING: select only after a working AWS deployment is verified.** A deployment on another provider alone does not establish Ship It eligibility. |
| Public project repository URL | **PENDING: create/publish and verify public access.** The leader's profile above is not a project repository. |
| Deployed URL — optional form field | **https://clearpath-campus.vercel.app** — live browser demo hosted on Vercel; Cedar WASM and localStorage, without a live cloud API. |
| YouTube demo URL — required | **PENDING: upload a public or unlisted video strictly under three minutes; verify signed-out access.** |

## Problem statement

A campus may have an accessible entrance on its map, but that information stops helping when a ramp is blocked or a lift is out of service. Students need an alternate route immediately, while facilities staff need enough context to fix the barrier and communicate that access is restored.

ClearPath connects those two needs. A student reports a barrier on a campus path; the route planner avoids it; the repair desk tracks the issue; and a verified repair allows the route to reopen. The demonstrated North Gate–Central Library route changes from a 745 m detour to a 120 m direct path after verification of the sample entrance repair. These are simulated graph distances, not measured benefits for real students. The demonstration uses a fictional campus and simulated incidents. Its focus is one complete, understandable operational loop.

The problem is grounded in UGC's guidance on campus mapping, infrastructure maintenance and accessible grievance handling. Sources and the scope of this research are in [RESEARCH.md](RESEARCH.md).

## How AWS is used

ClearPath uses Cedar, an AWS-origin open-source authorization language, through its WebAssembly package in the browser and Node backend. Shared policies distinguish reporting, maintenance and verification actions. The local server independently enforces Cedar before protected writes and stores scoped demo workspaces in SQLite. Tests cover cross-workspace denial, forbidden student repairs and self-verification, alongside lifecycle and persistence behavior.

The public Vercel deployment runs the browser version with localStorage. Its role switch is a demonstration tool, not production identity verification or a browser security boundary. The separate local backend uses opaque scoped tokens and conditional revisions; it is not deployed at the public URL.

Cloud deployment remains pending. AWS Lambda and DynamoDB are the proposed cloud compute and data services; list them as services actually used only after deployment and runtime verification. The final video must demonstrate the working Cedar integration and, if applicable, the actual AWS deployment. Merely mentioning AWS is insufficient.

**Video evidence required:** demonstrate the working Cedar engine, an allowed action and a denied action. Identify the browser and local-server modes accurately. The current entry is Build It; leave Ship It unselected unless a real AWS deployment is completed and checked.

## Team leader contributions

The leader commissioned and directed the project concept, implementation, interface, testing and submission preparation using AI assistance. The draft is being developed with **Codex using GPT-6** for research, code, design iteration, verification assistance and documentation. This is a disclosure of the coding tool used, not a claim that a new model was trained or that ClearPath contains a proprietary model.

**PENDING: leader review.** Record only actions the leader actually performed and the actual division of work. Do not describe generated code as unaided manual work, invent interviews, or claim learning outcomes the leader has not demonstrated. Credit third-party libraries, templates and assets in the repository.

## What could be improved about AWS

Draft product feedback, to retain only if confirmed during implementation: a single maintained Cedar example covering a modern browser build, a Node API, the same policies, test fixtures and deployment would make the route from a local prototype to a hosted application easier to understand. Documentation should make the distinction between browser permissions hints and authoritative server enforcement especially clear.

Do not present an unobserved outage, billing issue, performance problem or support experience as something this team encountered. Add concrete encountered friction after verification, if any.

## What worked well about AWS

The local Cedar option makes authorization a visible part of the product without requiring a cloud account merely to develop the policy logic. The intended benefit is a readable permission model for a sensitive workflow: reporting a barrier is different from declaring that access has been restored.

**PENDING: verify and personalize.** Add one tested example from this build. Do not describe Lambda, DynamoDB, credits or cloud performance as a positive personal experience before they are actually used.

## Event completion checklist

- [ ] Confirm university enrollment in India, age 18+, tour registration, event check-in and accurate team details.
- [ ] Verify Builder Center student status or an open SheerID case; the latter permits current-event submission and judging while verification is resolved.
- [ ] Preserve genuinely new event-period work and accurate Git history. Credit dependencies and disclose AI tools.
- [ ] Demonstrate actual AWS open-source or cloud functionality.
- [ ] Publish the repository, YouTube video under three minutes and short writeup; verify public/signed-out access.
- [ ] Confirm the exact cutoff in the event form and submit once per team before it closes.
- [ ] Save the successful submission confirmation and submitted links.

The [tour rules](https://www.wemakedevs.org/aws/rules) were checked on 20 September 2026. The [First Commit page](https://www.wemakedevs.org/aws/first-commit) lists 17–20 September 2026; its static content did not expose the exact cutoff time. Ship It requires AWS deployment; Best UI considers either main track. The recorded demonstration, not a later live call, is the evidence judges see. An AWS Builder Center blog is an optional additional prize opportunity.
