# Pre-existing Materials Disclosure

Per the Build with Gemini XPRIZE official rules (new-project restriction), all
BidPilot-specific business logic, workflows, prompts, interface, data model,
and production implementation were newly created after May 19, 2026, within
this repository. The following generic materials are reused:

| Material | Type | Source | Notes |
|---|---|---|---|
| Next.js 15 app scaffold | Boilerplate | `create-next-app` | Standard generated starter (config files, fonts, ESLint setup) |
| Next.js, React, Tailwind CSS | Open-source frameworks | npm | See `web/package.json` |
| `@google/genai` | Open-source SDK | npm (Apache-2.0) | Gemini API client |
| `@supabase/supabase-js`, `@supabase/ssr` | Open-source SDKs | npm (MIT) | Database, auth, storage |
| `stripe` | Open-source SDK | npm (MIT) | Payments |
| `resend` | Open-source SDK | npm (MIT) | Transactional email |
| `zod` | Open-source library | npm (MIT) | Schema validation |
| Geist fonts | Open-source fonts | Vercel (OFL) | Loaded via `next/font` |

No pre-existing application, product code, prompt library, or customer data
was forked, renamed, or reused. The repository's git history documents the
creation timeline (see `docs/build-timeline.md`).
