# Credits and licences

ClearPath's original application code, interface composition, SVG campus illustration, sample graph and fictional reports were created for this project with assistance from **Codex using GPT-6**. AI assistance covered research, implementation, design iteration, tests and documentation. The original project uses the [MIT License](../LICENSE), copyright Krishna Tayal, 2026. This licence does not replace the licences of dependencies, fonts or other upstream material.

## Direct dependencies

Versions and licence identifiers below were read from the installed packages on 20 September 2026, rather than inferred from version ranges. `package-lock.json` records the reproducible dependency resolution.

| Package | Installed version | Licence | Upstream |
| --- | --- | --- | --- |
| `@cedar-policy/cedar-wasm` | 4.13.0 | Apache-2.0 | [Cedar contributors](https://github.com/cedar-policy/cedar) |
| `@aws-sdk/client-dynamodb` | 3.1136.0 | Apache-2.0 | [AWS SDK for JavaScript v3](https://github.com/aws/aws-sdk-js-v3) |
| `@aws-sdk/lib-dynamodb` | 3.1136.0 | Apache-2.0 | [AWS SDK for JavaScript v3](https://github.com/aws/aws-sdk-js-v3) |
| `express` | 5.2.1 | MIT | [Express](https://github.com/expressjs/express) |
| `lucide-react` | 0.468.0 | ISC; inherited Feather portions MIT | [Lucide](https://github.com/lucide-icons/lucide) |
| `react` | 19.3.0 | MIT | [React](https://github.com/facebook/react) |
| `react-dom` | 19.3.0 | MIT | [React](https://github.com/facebook/react) |
| `zod` | 4.6.5 | MIT | [Zod](https://github.com/colinhacks/zod) |
| `@types/react` | 19.3.0 | MIT | [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped) |
| `@types/react-dom` | 19.3.0 | MIT | [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped) |
| `@vitejs/plugin-react` | 4.7.0 | MIT | [Vite React plugin](https://github.com/vitejs/vite-plugin-react) |
| `typescript` | 5.9.3 | Apache-2.0 | [TypeScript](https://github.com/microsoft/TypeScript) |
| `vite` | 6.4.3 | MIT | [Vite](https://github.com/vitejs/vite) |
| `vite-plugin-wasm` | 3.6.0 | MIT | [Vite WASM plugin](https://github.com/Menci/vite-plugin-wasm) |

The Cedar WebAssembly package is the actual policy engine. It is not a locally invented replacement bearing the Cedar name. AWS SDK packages support the prepared DynamoDB adapter; their presence does not imply a verified AWS deployment.

## Icons

Interface icons are from Lucide. The installed Lucide licence attributes Feather portions to **Cole Bemis, 2013–2022 (MIT)** and the remaining Lucide work to **Lucide Contributors, 2022 (ISC)**. The following notice is retained from that package:

```text
ISC License

Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
```

## Typography and illustration

- **DM Sans:** copyright 2014 The DM Sans Project Authors; [SIL Open Font License 1.1](https://github.com/google/fonts/blob/main/ofl/dmsans/OFL.txt).
- **Manrope:** copyright 2018 The Manrope Project Authors; [SIL Open Font License 1.1](https://github.com/google/fonts/blob/main/ofl/manrope/OFL.txt).

The stylesheet requests these fonts through Google Fonts. The checked-in source does not contain copies of their font binaries. Their original font licences continue to apply when fonts are downloaded or redistributed.

The campus illustration, banner paths and favicon are project-created SVG artwork. The map is schematic, with fictional coordinates and distances. No photographs, map tiles or real campus survey data are used in the checked-in interface.

## Transitive dependencies

The checked lockfile contains 220 dependency entries, including platform-specific optional packages: 176 MIT, 30 Apache-2.0, 10 ISC, two BSD-3-Clause, one 0BSD and one CC-BY-4.0. These are package-metadata counts, not a claim that every entry is included in the browser bundle.

The less common entries are:

| Package | Version | Licence | Attribution source |
| --- | --- | --- | --- |
| `caniuse-lite` | 1.0.30001810 | CC-BY-4.0 | [Can I Use data and caniuse-lite contributors](https://github.com/browserslist/caniuse-lite) |
| `qs` | 6.16.0 | BSD-3-Clause | [qs contributors](https://github.com/ljharb/qs) |
| `source-map-js` | 1.2.1 | BSD-3-Clause | [source-map-js contributors](https://github.com/7rulnik/source-map-js) |
| `tslib` | 2.8.1 | 0BSD | [Microsoft and tslib contributors](https://github.com/microsoft/tslib) |

Consult each resolved package's licence and notice files when redistributing dependencies or compiled bundles, and preserve applicable upstream notices. The full dependency tree is recorded in `package-lock.json`; this concise inventory identifies direct tools and noteworthy transitive data licences.

## Research and event

The problem statement draws on the [UGC Accessibility Guidelines and Standards for Higher Education Institutions and Universities](https://www.ugc.gov.in/pdfnews/8572354_Final-Accessibility-Guidelines.pdf). [RESEARCH.md](RESEARCH.md) supplies exact sections and primary links to WHO, AccessNow, Wheelmap and Sugamya Bharat. Those products inform the comparison; ClearPath does not claim affiliation, endorsement, exclusive novelty, or verified outcomes from their work.

Event requirements were checked against the [First Commit event page](https://www.wemakedevs.org/aws/first-commit) and [Bharat Builds Tour rules](https://www.wemakedevs.org/aws/rules). AWS, Cedar, WeMakeDevs and product names retain their respective owners' rights. Mentioning them describes the tools, sources and intended event entry, not sponsorship or approval of ClearPath.
