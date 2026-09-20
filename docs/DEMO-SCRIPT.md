# ClearPath — 2 minute 20 second recording script

Status: recording and required YouTube upload remain pending. The local connected API flow was verified in Brave: resolving CP-1040 changed the North Gate–Central Library route from 745 m to 120 m. The public Vercel browser demo returns HTTP 200, but its browser workflows still need verification before recording this script.

Audio preparation: 242 narrated words, stock macOS Samantha voice, 140-second timeline. Narration and sentence-timed captions are prepared in the parent workspace’s `work/demo/` directory. These audio assets are not a completed UI demonstration video.

## Recording mode

This script is written for the [public Vercel browser demo](https://clearpath-campus.vercel.app), which runs Cedar WASM with localStorage and has no deployed cloud API. Check that its controls work first, then capture the actual Brave interface. Show the full URL and fictional-data label. The local Node/SQLite backend is separate. AWS cloud deployment is prepared, not deployed.

If recording the local connected application instead, identify it as local and replace the browser/localStorage narration with the actual SQLite persistence behavior. Do not use narration for one mode over footage of the other. Do not present a reconstructed interface, static mockup or audio-only clip as a working application recording.

## Prepare the sample workspace

- Confirm a fresh seeded workspace, CP-1040 awaiting verification and a step-free North Gate–Central Library route of 745 m.
- Use only fictional report and repair notes. The actions simulate a repair workflow; no physical repair occurred.
- Close unrelated private tabs, and keep tokens and account information outside the capture.
- Allow time for actions. If the workflow exceeds the cue, trim idle footage or retime the narration honestly; keep the finished video strictly under three minutes.

## 0:00–0:15 — The problem and live overview

**On screen:** Show the live Vercel URL and Overview. Keep the DEMONSTRATION CAMPUS label visible. Do not suggest this is a real university's maintenance system.

**Narration:** “A campus can have an accessible entrance and still be inaccessible today. ClearPath connects barrier reports, repairs, and the route someone needs. Greenfield Campus and every incident here are fictional demonstration data.”

## 0:15–0:30 — Seeded detour

**On screen:** Open Find a clear path. Select North Gate and Central Library, step-free enabled. Calculate. Hold on 745 m, the route and written path. Start in a fresh seeded workspace.

**Narration:** “First, choose North Gate to Central Library with step-free routing. An entrance repair is awaiting verification, so its path stays blocked. The current sample route is seven hundred forty-five meters.”

## 0:30–0:48 — Independent verification

**On screen:** Switch role to Access champion. Open CP-1040: North entrance door needs adjustment. Enter: Demo check: the entrance now opens freely. Click Verify & reopen path.

**Narration:** “Switch to Access champion and open the entrance report. Add a verification note, then verify and reopen the path. Recording a repair alone does not restore access; the verification step does.”

## 0:48–1:01 — Shorter route after verification

**On screen:** Close the modal, return to Find a clear path with the same endpoints, calculate and hold on 120 m. Keep any existing route state in view only if it reflects the new result.

**Narration:** “Calculate the same journey again. The reopened direct path is one hundred twenty meters. These distances come from the fictional graph, not a real-world impact study.”

## 1:01–1:23 — Create a report

**On screen:** Switch Student. Report a barrier. Use sample title Library approach obstructed; location Central Library; connected North Gate-Central Library path; type Entrance; description Demo obstacle blocks independent access at the library entrance.; priority High. Submit. Use whichever connected-path label the form actually displays.

**Narration:** “Now switch to Student and create a sample barrier report. Choose its location, affected path, description, and priority. The new issue appears in the repair queue with its status.”

## 1:23–1:43 — Repair workflow

**On screen:** Switch Facilities, open the new report, Start repair. Enter: Demo obstacle removed and entrance checked. Send for verification. Hold on Awaiting verification, then switch Access champion. Do not label the role switch as real staff authentication.

**Narration:** “As Facilities, start the repair and record what was done. The issue moves to awaiting verification and remains a routing barrier. An Access champion can then verify the simulated fix.”

## 1:43–1:56 — History and persistence

**On screen:** Add verifier note: Demo check confirms the entrance is unobstructed. Verify & reopen path. Show Progress & activity, then refresh the same browser page and show persisted sample state.

**Narration:** “The activity history makes each transition visible. This live browser demo stores changes locally, so refreshing preserves this browser's sample workspace.”

## 1:56–2:12 — Real AWS open-source use

**On screen:** Open the app's About/How it works modal to show AWS, doing real work and actual Cedar decision. If recorded source/test evidence is available, show it briefly; otherwise leave the app visible and avoid implying the local backend powers this public URL. Do not display the AWS console as a deployed proof.

**Narration:** “This Build It project runs AWS Cedar locally as WebAssembly. The separate local Node and SQLite backend passed nine tests, including authorization denials. AWS cloud deployment is prepared, not deployed.”

## 2:12–2:20 — Disclosure and close

**On screen:** Hold on the ClearPath overview or About modal. End by 2:20. The voice is stock macOS Samantha, not the user's voice.

**Narration:** “Built with Codex using GPT-6. Stock synthetic narration. ClearPath: campus access, kept open.”

## Publication check

- Watch the final clip, confirm visible action results and accurate storage/deployment claims, and check its actual duration.
- Include readable captions; identify the narration as a stock synthetic voice rather than the entrant’s voice.
- Upload the finished recording to YouTube as public or unlisted. Open the link signed out.
- Record the final YouTube URL in [SUBMISSION.md](SUBMISSION.md), then submit the form and retain its success confirmation.

Public repository: [krishnatayal1410/clearpath-campus](https://github.com/krishnatayal1410/clearpath-campus). The project is a solo entry primarily implemented by OpenAI Codex using GPT-6; the recording must not imply unaided manual coding or unverified learning by the entrant.
