# Build Timeline

Major features linked to dated commits. This file is updated as features land;
`git log` is the authoritative record.

| Date | Feature | Evidence |
|---|---|---|
| 2026-07-16 | Repository created; Next.js scaffold; Supabase schema (core + XPRIZE compliance migrations); Gemini agent layer with structured outputs and immutable `agent_runs` audit logging | Initial commits |
| 2026-07-17 | Marketing site (landing, pricing, sample, how-it-works, trust, XPRIZE transparency); auth and onboarding; company profile wizard and evidence library; checkout (Stripe + labeled mock mode); deterministic pipeline orchestrator (parse → eligibility → bid decision → compliance matrix → strategy/drafting → verification → compliance review → delivery); job workspace with audit log; admin XPRIZE readiness dashboard with evidence exports | This commit |

Planned:
- Stripe live keys and first arms-length transactions
- Gemini production key rollout (retiring MOCK AI MODE in production)
- DOCX/PDF deliverable exports
- Judge account seeding and synthetic demo organization
- SAM.gov opportunity discovery and monitoring subscription (Phase 4)
