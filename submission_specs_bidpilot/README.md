# BidPilot — XPRIZE Submission Package Workspace

Working folder for completing the **Build with Gemini XPRIZE Hackathon** submission
on Devpost. **Deadline: August 17, 2026.**

Everything here is derived from the Devpost reminder email (Jul 17, 2026), the
official rules as captured in `../BidPilot_XPRIZE_Rules_Aligned_Spec.md`
(§0.6–§0.12), and the actual state of the codebase.

## Contents

| File | Purpose |
|---|---|
| `01_submission_checklist.md` | Master checklist: every required artifact, current status, and owner action |
| `02_written_narrative.md` | Draft of the 500–1000 word written narrative (placeholders marked) |
| `03_video_script.md` | 3-minute demo video script and shot list |
| `04_form_answers.md` | Drafted answers to the Devpost form questions |
| `05_evidence_pack.md` | How to assemble revenue, expense, product, and customer evidence |
| `06_timeline.md` | Week-by-week execution plan from now to Aug 17 |

## Ground rules (from the official rules)

- Only **arms-length third-party revenue** counts as primary revenue. Related-party
  revenue (friends, family, pre-existing relationships) must be disclosed separately.
- No single customer may represent more than **40% of revenue**.
- **Mock-mode activity is never evidence.** Mocked agent runs are labeled
  `is_mocked=true` / status `MOCKED` and mock checkouts record no revenue.
- The video must be **under 3 minutes**, public (YouTube/Vimeo), no unlicensed
  music or third-party trademarks, and must show the app **live in production**.
- If the repo stays private, share it with `testing@devpost.com` and
  `judging@hacker.fund` before submitting.
- Judges get free access through **September 15, 2026**; the app must stay up.
- Be able to answer verification requests within **two business days**
  (exports at `/admin/xprize-readiness`).

## How to use this folder

1. Track progress in `01_submission_checklist.md` — it is the single source of truth.
2. Replace every `[PLACEHOLDER: ...]` in the narrative and form answers as real
   numbers land (revenue, users, deployment URL, video URL).
3. Start the Devpost submission form **now** to see the questions verbatim; you
   can edit until the deadline.
