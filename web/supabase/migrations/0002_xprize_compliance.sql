-- XPRIZE official-rules compliance layer (spec section 12A)
-- These tables are admin-only. Judges see aggregated views, never raw records.

create table public.competition_entrants (
  id uuid primary key default gen_random_uuid(),
  entrant_type text not null, -- INDIVIDUAL | TEAM | ORGANIZATION
  representative_name text not null,
  organization_legal_name text,
  employee_count integer,
  corporate_id text,
  authorization_confirmed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger competition_entrants_updated_at before update on public.competition_entrants
  for each row execute function public.set_updated_at();

create table public.revenue_transactions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations (id),
  job_id uuid references public.jobs (id),
  stripe_payment_id text,
  amount_cents integer not null,
  currency text not null default 'USD',
  revenue_type text not null default 'ARMS_LENGTH',
  -- ARMS_LENGTH | RELATED_PARTY | PRE_EXISTING_CUSTOMER
  customer_relationship_note text,
  recognized_month date not null,
  refunded_amount_cents integer not null default 0,
  evidence_storage_path text,
  created_at timestamptz not null default now(),
  constraint revenue_type_check check (revenue_type in ('ARMS_LENGTH', 'RELATED_PARTY', 'PRE_EXISTING_CUSTOMER'))
);
create index revenue_month_idx on public.revenue_transactions (recognized_month);
create index revenue_type_idx on public.revenue_transactions (revenue_type);

create table public.expense_transactions (
  id uuid primary key default gen_random_uuid(),
  expense_date date not null,
  expense_category text not null,
  -- AI_API | CLOUD_HOSTING | CONTRACTOR | MARKETING | CUSTOMER_ACQUISITION |
  -- PAYMENT_PROCESSING | SOFTWARE | OTHER
  vendor text,
  description text not null,
  amount_cents integer not null,
  evidence_storage_path text,
  related_job_id uuid references public.jobs (id),
  created_at timestamptz not null default now()
);
create index expense_date_idx on public.expense_transactions (expense_date);
create index expense_category_idx on public.expense_transactions (expense_category);

create table public.user_evidence (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations (id),
  job_id uuid references public.jobs (id),
  user_classification text, -- SMALL_BUSINESS | NONPROFIT | INDIVIDUAL | OTHER
  is_real_user boolean not null default true,
  is_paying_customer boolean not null default false,
  feedback_text text,
  testimonial_text text,
  sharing_permission boolean not null default false,
  verification_contact_name text,
  verification_contact_email text,
  verification_contact_phone text,
  created_at timestamptz not null default now()
);

create table public.submission_artifacts (
  id uuid primary key default gen_random_uuid(),
  artifact_type text not null,
  -- REPOSITORY | VIDEO | TEXT_DESCRIPTION | FINANCIAL_EXPORT |
  -- USER_EVIDENCE_EXPORT | TESTING_INSTRUCTIONS | CORPORATE_ID |
  -- THIRD_PARTY_INVENTORY | PREEXISTING_MATERIALS
  status text not null default 'NOT_STARTED', -- NOT_STARTED | IN_PROGRESS | READY | VERIFIED
  url text,
  storage_path text,
  last_verified_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger submission_artifacts_updated_at before update on public.submission_artifacts
  for each row execute function public.set_updated_at();

create table public.judge_accounts (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  access_role text not null default 'JUDGE',
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- RLS: admin-only, except aggregated public metrics exposed through views
-- ---------------------------------------------------------------------------
alter table public.competition_entrants enable row level security;
alter table public.revenue_transactions enable row level security;
alter table public.expense_transactions enable row level security;
alter table public.user_evidence enable row level security;
alter table public.submission_artifacts enable row level security;
alter table public.judge_accounts enable row level security;

create policy entrants_admin on public.competition_entrants for all
  using (public.is_admin()) with check (public.is_admin());
create policy revenue_admin on public.revenue_transactions for all
  using (public.is_admin()) with check (public.is_admin());
create policy expenses_admin on public.expense_transactions for all
  using (public.is_admin()) with check (public.is_admin());
create policy user_evidence_admin on public.user_evidence for all
  using (public.is_admin()) with check (public.is_admin());
create policy artifacts_admin on public.submission_artifacts for all
  using (public.is_admin()) with check (public.is_admin());
create policy judges_admin on public.judge_accounts for all
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Aggregated judge-facing metrics (no customer-confidential data).
-- security definer functions so anonymous visitors can read aggregates only.
-- ---------------------------------------------------------------------------
create or replace function public.xprize_public_metrics()
returns jsonb language sql security definer set search_path = public stable as $$
  select jsonb_build_object(
    'revenue_by_month', (
      select coalesce(jsonb_object_agg(m.month_label, m.totals), '{}'::jsonb)
      from (
        select to_char(recognized_month, 'YYYY-MM') as month_label,
               jsonb_build_object(
                 'arms_length_cents', sum(amount_cents - refunded_amount_cents) filter (where revenue_type = 'ARMS_LENGTH'),
                 'related_party_cents', sum(amount_cents - refunded_amount_cents) filter (where revenue_type <> 'ARMS_LENGTH')
               ) as totals
        from revenue_transactions
        group by 1
      ) m
    ),
    'total_expenses_cents', (select coalesce(sum(amount_cents), 0) from expense_transactions),
    'marketing_spend_cents', (
      select coalesce(sum(amount_cents), 0) from expense_transactions
      where expense_category in ('MARKETING', 'CUSTOMER_ACQUISITION')
    ),
    'paying_organizations', (
      select count(distinct organization_id) from revenue_transactions where amount_cents > 0
    ),
    'jobs_completed', (select count(*) from jobs where status in ('DELIVERED', 'COMPLETED')),
    'agent_decisions', (select count(*) from agent_runs where status = 'SUCCESS'),
    'gemini_production_calls', (select count(*) from agent_runs where is_mocked = false),
    'requirements_extracted', (select count(*) from requirements),
    'unsupported_claims_caught', (
      select count(*) from claim_evidence_links where verification_status = 'UNSUPPORTED'
    ),
    'human_review_minutes_total', (select coalesce(sum(minutes_spent), 0) from human_reviews),
    'small_businesses_served', (select count(*) from organizations where is_demo = false),
    'contract_value_pursued_cents', (select coalesce(sum(contract_value_cents), 0) from outcomes)
  );
$$;

grant execute on function public.xprize_public_metrics() to anon, authenticated;
