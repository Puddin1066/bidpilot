#!/usr/bin/env bash
# Deploy BidPilot (web/) to Google Cloud Run.
# Usage: ./scripts/deploy-cloud-run.sh <GCP_PROJECT_ID> [REGION]
set -euo pipefail

PROJECT_ID="${1:?Usage: $0 <GCP_PROJECT_ID> [REGION]}"
REGION="${2:-us-east1}"
SERVICE="bidpilot"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WEB="$ROOT/web"

if [[ -f "$WEB/.env.local" ]]; then
  # shellcheck disable=SC1091
  set -a
  # Load only non-empty KEY=VALUE lines; never print values.
  source <(grep -E '^[A-Z0-9_]+=' "$WEB/.env.local" | sed 's/\r$//')
  set +a
fi

: "${NEXT_PUBLIC_SUPABASE_URL:?Set NEXT_PUBLIC_SUPABASE_URL in web/.env.local}"
: "${NEXT_PUBLIC_SUPABASE_ANON_KEY:?Set NEXT_PUBLIC_SUPABASE_ANON_KEY in web/.env.local}"
: "${SUPABASE_SERVICE_ROLE_KEY:?Set SUPABASE_SERVICE_ROLE_KEY in web/.env.local before deploy}"
: "${GEMINI_API_KEY:?Set GEMINI_API_KEY in web/.env.local before deploy}"

echo "==> Enabling APIs on $PROJECT_ID"
gcloud config set project "$PROJECT_ID"
gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com --project "$PROJECT_ID"

echo "==> Building container (Cloud Build)"
# Placeholder URL for the first build; updated after deploy.
PLACEHOLDER_URL="https://${SERVICE}-placeholder.run.app"
gcloud builds submit "$WEB" \
  --project "$PROJECT_ID" \
  --config=- <<EOF
steps:
  - name: gcr.io/cloud-builders/docker
    args:
      - build
      - --build-arg=NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - --build-arg=NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - --build-arg=NEXT_PUBLIC_APP_URL=${PLACEHOLDER_URL}
      - -t
      - gcr.io/${PROJECT_ID}/${SERVICE}
      - .
images:
  - gcr.io/${PROJECT_ID}/${SERVICE}
EOF

echo "==> Deploying to Cloud Run ($REGION)"
ENV_VARS="NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}"
ENV_VARS+=",NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}"
ENV_VARS+=",SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}"
ENV_VARS+=",GEMINI_API_KEY=${GEMINI_API_KEY}"
ENV_VARS+=",NEXT_PUBLIC_APP_URL=${PLACEHOLDER_URL}"
if [[ -n "${STRIPE_SECRET_KEY:-}" ]]; then
  ENV_VARS+=",STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}"
fi
if [[ -n "${STRIPE_WEBHOOK_SECRET:-}" ]]; then
  ENV_VARS+=",STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET}"
fi
if [[ -n "${RESEND_API_KEY:-}" ]]; then
  ENV_VARS+=",RESEND_API_KEY=${RESEND_API_KEY}"
fi

gcloud run deploy "$SERVICE" \
  --project "$PROJECT_ID" \
  --image "gcr.io/${PROJECT_ID}/${SERVICE}" \
  --region "$REGION" \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 3 \
  --set-env-vars "$ENV_VARS"

SERVICE_URL="$(gcloud run services describe "$SERVICE" --project "$PROJECT_ID" --region "$REGION" --format='value(status.url)')"
echo "==> Service URL: $SERVICE_URL"
echo "==> Updating NEXT_PUBLIC_APP_URL and redeploying env"
gcloud run services update "$SERVICE" \
  --project "$PROJECT_ID" \
  --region "$REGION" \
  --update-env-vars "NEXT_PUBLIC_APP_URL=${SERVICE_URL}"

echo ""
echo "Deployed: $SERVICE_URL"
echo "Next: seed the judge account (docs/judge-seed.md), then set Stripe webhook to ${SERVICE_URL}/api/stripe/webhook"
