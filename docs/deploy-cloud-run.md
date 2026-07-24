# Deploy BidPilot to Google Cloud Run

Cloud Run is BidPilot's intended Google Cloud product for the XPRIZE
"at least one Google Cloud product" requirement (alongside the Gemini API).

## Prerequisites

```bash
gcloud auth login
gcloud config set project YOUR_GCP_PROJECT_ID
gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com
```

## One-shot deploy

From the repo root:

```bash
./scripts/deploy-cloud-run.sh YOUR_GCP_PROJECT_ID us-east1
```

Or manually from `web/`:

```bash
export PROJECT_ID=YOUR_GCP_PROJECT_ID
export REGION=us-east1
export SERVICE=bidpilot

# Build and push
gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE \
  --substitutions=_NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL",_NEXT_PUBLIC_SUPABASE_ANON_KEY="$NEXT_PUBLIC_SUPABASE_ANON_KEY",_NEXT_PUBLIC_APP_URL="https://placeholder.run.app"

# Deploy (set secrets via Secret Manager or --set-env-vars for first bring-up)
gcloud run deploy $SERVICE \
  --image gcr.io/$PROJECT_ID/$SERVICE \
  --region $REGION \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars "NEXT_PUBLIC_SUPABASE_URL=...,NEXT_PUBLIC_SUPABASE_ANON_KEY=...,SUPABASE_SERVICE_ROLE_KEY=...,GEMINI_API_KEY=...,NEXT_PUBLIC_APP_URL=https://YOUR_SERVICE_URL"
```

After the first deploy, update `NEXT_PUBLIC_APP_URL` to the Cloud Run URL and
redeploy (or set it before the first build so Stripe redirects work).

## Required runtime env vars

| Variable | Notes |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon/publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | **Required** for pipeline writes |
| `GEMINI_API_KEY` | Production AI (omit only for MOCK AI MODE) |
| `STRIPE_SECRET_KEY` | Live payments (omit keeps MOCK PAYMENT MODE) |
| `STRIPE_WEBHOOK_SECRET` | After configuring Stripe webhook → `/api/stripe/webhook` |
| `NEXT_PUBLIC_APP_URL` | Exact public Cloud Run URL |
| `RESEND_API_KEY` | Optional |

## Stripe webhook

Point Stripe at `https://YOUR_CLOUD_RUN_URL/api/stripe/webhook` for
`checkout.session.completed` and `charge.refunded`.

## Judge access

After deploy, run the seed script (see `docs/judge-seed.md`) and keep the
service up through September 15, 2026.
