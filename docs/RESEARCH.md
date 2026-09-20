# ClearPath: research and product scope

Research checked on 20 September 2026. This document describes the evidence and intended MVP; it is not a record of completed deployment, user interviews, or real campus repairs. All campus locations, route geometry, people, incidents and repair events in the demonstration are fictional.

## The problem

A campus can install a ramp and still become inaccessible when that ramp is blocked or a lift stops working. Students need current route information; the campus facilities team needs a specific report, responsibility for its resolution, and a way to communicate that access has been restored.

The University Grants Commission's [Accessibility Guidelines and Standards for Higher Education Institutions and Universities](https://www.ugc.gov.in/pdfnews/8572354_Final-Accessibility-Guidelines.pdf) directly support this focus:

| Location in the 2022 guidance | Relevant scope |
| --- | --- |
| Section 4.4, printed page 50 (PDF page 63) | Campus mapping and technology to locate buildings and services. |
| Section 4.6, printed page 51 (PDF page 64) | Upkeep and maintenance of mobility infrastructure and devices. |
| Section 5, printed page 56 (PDF page 69) | Accessible infrastructure can become temporarily inaccessible when maintenance is inadequate. |
| Section 8.4, printed pages 93–94 (PDF pages 106–107) | Accessible grievance handling and maintaining records. |

These are design inputs. ClearPath does not certify that a campus meets accessibility standards or replace a professional access audit. The quoted publication dates identify the document reviewed; this project does not claim to provide a complete interpretation of current legal duties.

For broad context, [WHO's disability overview](https://www.who.int/health-topics/disability) estimates that 1.3 billion people experience significant disability and explains how inaccessible environments restrict participation. This global statistic is not a count of ClearPath users, a campus market estimate, or evidence of product impact.

## Existing work and a focused contribution

| Product and primary source | Documented emphasis | Proposed ClearPath focus |
| --- | --- | --- |
| [AccessNow](https://accessnow.com/programs/) | Crowdsourced place accessibility information; expert assessments and community input. | A campus repair workflow whose current incidents affect routes. |
| [Wheelmap](https://news.wheelmap.org/en/about-wheelmap/) | Finding and rating wheelchair-accessible places through a traffic-light scheme and open data. | Temporary conditions on individual path segments, including last-update information. |
| [Sugamya Bharat](https://cdnbbsr.s3waas.gov.in/s3e58aea67b01fa747687f038dfde066f6/uploads/2023/11/20231122821848645.pdf) | Accessibility complaints forwarded to appropriate public authorities for action. | A small campus operation with an owner, repair progress and a visible route change. |

This comparison is an inference from these product descriptions, not an exhaustive feature audit. Maps, accessibility reviews and barrier complaints are established ideas. ClearPath's contribution is the complete report → repair → verified reopening → recalculated route interaction in one campus-sized demonstration.

## Intended MVP and honest limits

1. Choose two places on a fictional campus and calculate a step-free route.
2. Report a blocked ramp or unavailable lift against a route segment.
3. Display the report in the facilities queue and avoid the affected segment in subsequent route calculations.
4. Record repair progress and verification as separate events. Reopen a segment only after the application's required verification step.
5. Recalculate the route and preserve an understandable history of what changed.

The implementation must make reported, repaired and verified states distinguishable. If no step-free route exists, it must say so. A report must remain visible after a refresh when running with the persistent backend. Metrics must be calculated from the demonstration's records and labelled accordingly. This is route planning on a small known graph, not GPS navigation, an emergency service, a live campus feed, or a guarantee of physical accessibility.

## Proposed AWS-related architecture

The planned local architecture is a browser interface plus a Node backend, SQLite persistence and shared Cedar policies evaluated using Cedar WebAssembly. The browser can explain available actions; the server must independently enforce authorization for every protected write. Browser-only checks are not a security boundary.

[Cedar's official implementation](https://github.com/cedar-policy/cedar) provides authorization and schema validation, including a WebAssembly interface for JavaScript and TypeScript. Its [WebAssembly package documentation](https://www.npmjs.com/package/%40cedar-policy/cedar-wasm?activeTab=readme) describes distinct browser and Node loading paths. These are the technical basis for the planned integration, not evidence that this repository's integration has passed testing.

An optional cloud architecture uses AWS Lambda and DynamoDB, subject to an available AWS account and deployment verification. AWS documents [a web architecture with a static frontend, HTTPS API, Lambda and DynamoDB](https://docs.aws.amazon.com/wellarchitected/latest/serverless-applications-lens/web-application.html). ClearPath must not claim those services are running until its actual deployment has been checked.

## Evidence to collect before submission

- A successful report-to-repair-to-verification flow and route calculations before, during and after the barrier.
- A denied unauthorized repair or verification action, demonstrating real Cedar enforcement.
- Persistence across a browser refresh and backend restart in the chosen persistence mode.
- Keyboard operation, visible focus, readable contrast, responsive layout and a text alternative to the map.
- Actual deployment URL and provider, if deployed; a public repository; a signed-out-accessible YouTube video under three minutes.
- A precise account of what was built and tested, its limitations, third-party licences and AI assistance.

See [the submission draft](SUBMISSION.md) for event requirements and account/link placeholders, and [the recording script](DEMO-SCRIPT.md) for the proposed demonstration.
