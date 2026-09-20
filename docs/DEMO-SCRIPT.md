# ClearPath — 2 minute 30 second demo plan

Recording target: about 2:30, with a hard final duration below 3:00. This script describes the intended working demonstration. Rehearse against the final implementation, correct any mismatched controls, and remove claims that cannot be shown. All campus information and repair events are fictional demonstration data. Record in Brave as requested by the project owner.

## Before recording

- Use a clean fictional campus state with two known routes between the chosen places. Confirm a report blocks the intended edge, verification reopens it, and every stated distance comes from the app.
- Choose a report that supports the real implemented repair and verification workflow. Do not pretend to perform a physical repair.
- Keep tokens, credentials, unrelated account information and private tabs out of the recording.
- Prepare the actual policy result and persistence evidence. Show AWS cloud resources only if this application was deployed and verified there.

## 0:00–0:20 — Why access changes

**On screen:** ClearPath overview; fictional-data label visible.

**Narration:** “A campus can have an accessible ramp and still be inaccessible today because that ramp is blocked. ClearPath connects the student's route with the campus repair desk. This is a fictional campus, so we can demonstrate the complete workflow without claiming these paths or incidents are real.”

## 0:20–0:45 — Route before the barrier

**On screen:** Select start and destination; calculate the step-free route. Point to the map and text directions.

**Narration:** “I choose my starting point and destination. ClearPath calculates a step-free route through the campus graph. The map and written directions describe the same journey. Now I report an obstruction on the ramp this route uses, with its location and a short description.”

## 0:45–1:10 — Route changes after the report

**On screen:** Submit the report; recalculate the same journey; inspect the alternate path and the incident.

**Narration:** “The report becomes an active barrier. Calculating the same journey now avoids that segment and shows the alternative. The incident remains visible, so the student can understand why their route changed. A missing route must be shown honestly; the application cannot promise a usable path where none is known.”

## 1:10–1:40 — Repair, then verify

**On screen:** Open the facilities view, locate the incident, record the implemented repair stage, and complete the authorized verification stage.

**Narration:** “At the repair desk, the team can see what needs attention. I record the simulated repair, then complete the verification step with the appropriate demonstration role. Repair and verification are distinct. The history explains who changed the record and when. This is a software workflow demonstration, not a claim that a real ramp was repaired.”

## 1:40–2:00 — Route after verified reopening

**On screen:** Return to the original start and destination; recalculate; show reopened segment. Refresh and show persisted state in the verified backend mode.

**Narration:** “After verification, the segment becomes available again. The same journey can use it, and refreshing preserves the updated record. The loop is complete: report, avoid the barrier, repair, verify, and restore the route.”

## 2:00–2:20 — Show real AWS use

**On screen:** Actual Cedar policy and allow/deny results, including a denied protected action. If available, show the real AWS deployment briefly.

**Narration:** “Cedar is the AWS open-source component behind the permission decisions. The browser explains available actions, and the Node backend independently enforces the policy before protected changes. Here is an unauthorized action being denied.”

**Only if verified:** “This deployed application runs on [actual AWS services].” Otherwise state the actual local runtime and storage; omit cloud claims.

## 2:20–2:30 — Scope and disclosure

**On screen:** Project and source links; concise scope statement.

**Narration:** “ClearPath demonstrates how route information and repair responsibility can stay connected. The next step is testing with disabled students and facilities staff on a verified campus. Built with assistance from Codex using GPT-6.”

## Release check

Check actual video length, audible narration, readable text and accurate captions. Upload to YouTube as public or unlisted and open the link in a signed-out browser. Add the final URL to [SUBMISSION.md](SUBMISSION.md). Do not submit an unfinished recording or replace actual application evidence with a narrated mockup.
