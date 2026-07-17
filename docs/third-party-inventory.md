# Third-Party Service and License Inventory

Every integrated SDK, API, dataset, and service, with terms and data rights.
Reviewed: 2026-07-17.

| Service | Purpose | License / Terms | Data rights | Redistribution | Customer authorization needed |
|---|---|---|---|---|---|
| Google Gemini API | Core AI workflow (parsing, eligibility, bid decision, compliance, drafting, verification) | https://ai.google.dev/gemini-api/terms | Paid-tier API data not used to train models | N/A | No — disclosed in Trust page |
| Supabase (PostgreSQL, Auth, Storage) | Database, authentication, private file storage | https://supabase.com/terms | Customer retains ownership of data | N/A | No |
| Stripe | Payments (Checkout, webhooks) | https://stripe.com/legal/ssa | Payment records retained per Stripe policy | N/A | No |
| Resend | Transactional email | https://resend.com/legal/terms-of-service | Email metadata only | N/A | No |
| Vercel | Web hosting | https://vercel.com/legal/terms | N/A | N/A | No |
| Next.js / React / Tailwind CSS | Web framework and styling | MIT | N/A | Yes (MIT) | No |
| zod | Validation | MIT | N/A | Yes (MIT) | No |
| Geist fonts | Typography | SIL OFL 1.1 | N/A | Yes (OFL) | No |
| SAM.gov (planned, Phase 4) | Federal opportunity discovery | https://open.gsa.gov/api/get-opportunities-public-api/ — official public API only | Public data | Per API terms | No |

Notes:
- No procurement portal is scraped. Opportunity discovery (Phase 4) will use
  only documented, authorized APIs such as the SAM.gov public API.
- Customer-uploaded solicitations and company documents are stored privately
  and processed only to deliver the purchased package.
