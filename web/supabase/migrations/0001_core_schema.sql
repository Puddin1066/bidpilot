-- BidPilot core schema (spec section 8)
-- All monetary values are integer cents. All customer data is RLS-protected.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- helper: updated_at trigger
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- users (mirrors auth.users)
-- ---------------------------------------------------------------------------
create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text unique not null,
  full_name text,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- organizations and membership
-- ---------------------------------------------------------------------------
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references public.users (id),
  legal_name text not null,
  website text,
  industry text,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.organization_members (
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  role text not null default 'member', -- owner | member | judge
  primary key (organization_id, user_id)
);

-- membership helper used by every RLS policy
create or replace function public.is_org_member(org_id uuid)
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from public.organization_members
    where organization_id = org_id and user_id = auth.uid()
  );
$$;

create or replace function public.is_admin()
returns boolean language sql stable as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

-- ---------------------------------------------------------------------------
-- company profiles
-- ---------------------------------------------------------------------------
create table public.company_profiles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  version integer not null default 1,
  profile_json jsonb not null default '{}'::jsonb,
  status text not null default 'DRAFT', -- DRAFT | PENDING_APPROVAL | APPROVED
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger company_profiles_updated_at before update on public.company_profiles
  for each row execute function public.set_updated_at();
create index company_profiles_org_idx on public.company_profiles (organization_id);

-- ---------------------------------------------------------------------------
-- documents and evidence
-- ---------------------------------------------------------------------------
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  job_id uuid,
  document_type text not null, -- SOLICITATION | AMENDMENT | CAPABILITY | RESUME | PAST_PROPOSAL | OTHER
  filename text not null,
  storage_path text not null,
  mime_type text not null,
  sha256 text,
  processing_status text not null default 'UPLOADED', -- UPLOADED | PARSING | PARSED | FAILED
  created_at timestamptz not null default now()
);
create index documents_org_idx on public.documents (organization_id);
create index documents_job_idx on public.documents (job_id);

create table public.evidence_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  document_id uuid references public.documents (id) on delete set null,
  evidence_type text not null, -- PAST_PERFORMANCE | CERTIFICATION | PERSONNEL | CAPABILITY | INSURANCE | OTHER
  content text not null,
  source_page integer,
  metadata jsonb not null default '{}'::jsonb,
  confidence numeric,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);
create index evidence_items_org_idx on public.evidence_items (organization_id);
create index evidence_items_approved_idx on public.evidence_items (organization_id, approved);

-- ---------------------------------------------------------------------------
-- solicitations and jobs
-- ---------------------------------------------------------------------------
create table public.solicitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  title text,
  buyer text,
  solicitation_number text,
  deadline timestamptz,
  source_url text,
  structured_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index solicitations_org_idx on public.solicitations (organization_id);

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  solicitation_id uuid references public.solicitations (id),
  product_type text not null, -- OPPORTUNITY_MATCH | BID_NO_BID | READINESS_PACKAGE | COMPLETE_DRAFT | MONITORING
  status text not null default 'PAID',
  price_paid_cents integer not null default 0,
  stripe_payment_id text,
  started_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger jobs_updated_at before update on public.jobs
  for each row execute function public.set_updated_at();
create index jobs_org_idx on public.jobs (organization_id);
create index jobs_status_idx on public.jobs (status);

alter table public.documents
  add constraint documents_job_fk foreign key (job_id) references public.jobs (id) on delete set null;

-- ---------------------------------------------------------------------------
-- requirements / compliance matrix
-- ---------------------------------------------------------------------------
create table public.requirements (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs (id) on delete cascade,
  requirement_code text not null,
  requirement_text text not null,
  source_document_id uuid references public.documents (id),
  source_page integer,
  source_section text,
  mandatory boolean not null default false,
  evaluation_weight numeric,
  planned_response_section text,
  evidence_status text not null default 'MISSING', -- AVAILABLE | MISSING | UNVERIFIED | CUSTOMER_CONFIRMED
  risk_level text not null default 'MEDIUM', -- LOW | MEDIUM | HIGH
  created_at timestamptz not null default now()
);
create index requirements_job_idx on public.requirements (job_id);

-- ---------------------------------------------------------------------------
-- decisions, drafts, verification
-- ---------------------------------------------------------------------------
create table public.bid_decisions (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs (id) on delete cascade,
  decision text not null, -- PURSUE | PURSUE_WITH_CONDITIONS | PURSUE_WITH_PARTNER | MONITOR | DECLINE
  score numeric,
  confidence numeric,
  factor_scores jsonb not null default '{}'::jsonb,
  rationale text,
  human_override text,
  created_at timestamptz not null default now()
);
create index bid_decisions_job_idx on public.bid_decisions (job_id);

create table public.draft_sections (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs (id) on delete cascade,
  section_name text not null,
  content_markdown text not null,
  version integer not null default 1,
  status text not null default 'DRAFT', -- DRAFT | VERIFIED | FLAGGED | FINAL
  created_at timestamptz not null default now()
);
create index draft_sections_job_idx on public.draft_sections (job_id);

create table public.claim_evidence_links (
  id uuid primary key default gen_random_uuid(),
  draft_section_id uuid not null references public.draft_sections (id) on delete cascade,
  claim_text text not null,
  evidence_item_id uuid references public.evidence_items (id),
  verification_status text not null, -- VERIFIED | UNSUPPORTED | CONTRADICTORY | AMBIGUOUS
  confidence numeric,
  created_at timestamptz not null default now()
);
create index claim_links_section_idx on public.claim_evidence_links (draft_section_id);

-- ---------------------------------------------------------------------------
-- agent runs (immutable audit records), human reviews
-- ---------------------------------------------------------------------------
create table public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references public.jobs (id) on delete set null,
  agent_name text not null,
  model_name text not null,
  prompt_version text not null,
  input_hash text,
  output_json jsonb not null default '{}'::jsonb,
  confidence numeric,
  token_input integer not null default 0,
  token_output integer not null default 0,
  estimated_cost_cents integer not null default 0,
  duration_ms integer not null default 0,
  status text not null default 'SUCCESS', -- SUCCESS | FAILED | RETRIED | MOCKED
  is_mocked boolean not null default false,
  gemini_response_id text,
  created_at timestamptz not null default now()
);
create index agent_runs_job_idx on public.agent_runs (job_id);
create index agent_runs_created_idx on public.agent_runs (created_at);

-- immutability: block updates and deletes even for table owner sessions using a trigger
create or replace function public.block_mutation()
returns trigger language plpgsql as $$
begin
  raise exception 'agent_runs records are immutable audit records';
end;
$$;
create trigger agent_runs_immutable before update or delete on public.agent_runs
  for each row execute function public.block_mutation();

create table public.human_reviews (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs (id) on delete cascade,
  review_type text not null, -- EXCEPTION | QUALITY | PRICING | CERTIFICATION | FINAL
  reviewer_user_id uuid references public.users (id),
  decision text not null, -- APPROVED | REJECTED | ESCALATED
  notes text,
  minutes_spent integer not null default 0,
  created_at timestamptz not null default now()
);
create index human_reviews_job_idx on public.human_reviews (job_id);

-- ---------------------------------------------------------------------------
-- deliverables and outcomes
-- ---------------------------------------------------------------------------
create table public.deliverables (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs (id) on delete cascade,
  deliverable_type text not null, -- BID_DECISION_PDF | COMPLIANCE_XLSX | DRAFT_DOCX | CHECKLIST_PDF | RISK_MEMO | AUDIT_JSON | ZIP
  storage_path text not null,
  version integer not null default 1,
  created_at timestamptz not null default now()
);
create index deliverables_job_idx on public.deliverables (job_id);

create table public.outcomes (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs (id) on delete cascade,
  submitted boolean,
  shortlisted boolean,
  won boolean,
  contract_value_cents bigint,
  customer_hours_saved numeric,
  feedback text,
  recorded_at timestamptz not null default now()
);
create index outcomes_job_idx on public.outcomes (job_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.users enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.company_profiles enable row level security;
alter table public.documents enable row level security;
alter table public.evidence_items enable row level security;
alter table public.solicitations enable row level security;
alter table public.jobs enable row level security;
alter table public.requirements enable row level security;
alter table public.bid_decisions enable row level security;
alter table public.draft_sections enable row level security;
alter table public.claim_evidence_links enable row level security;
alter table public.agent_runs enable row level security;
alter table public.human_reviews enable row level security;
alter table public.deliverables enable row level security;
alter table public.outcomes enable row level security;

-- users: self access
create policy users_self_select on public.users for select using (id = auth.uid());
create policy users_self_update on public.users for update using (id = auth.uid());

-- organizations
create policy orgs_member_select on public.organizations for select
  using (public.is_org_member(id) or public.is_admin());
create policy orgs_owner_insert on public.organizations for insert
  with check (owner_user_id = auth.uid());
create policy orgs_owner_update on public.organizations for update
  using (owner_user_id = auth.uid());

-- organization_members
create policy org_members_select on public.organization_members for select
  using (user_id = auth.uid() or public.is_org_member(organization_id));
create policy org_members_insert on public.organization_members for insert
  with check (
    user_id = auth.uid() and exists (
      select 1 from public.organizations o
      where o.id = organization_id and o.owner_user_id = auth.uid()
    )
  );

-- org-scoped tables: members read; members write intake data; worker (service role) bypasses RLS
create policy company_profiles_rw on public.company_profiles for all
  using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

create policy documents_rw on public.documents for all
  using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

create policy evidence_rw on public.evidence_items for all
  using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

create policy solicitations_rw on public.solicitations for all
  using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

create policy jobs_select on public.jobs for select
  using (public.is_org_member(organization_id) or public.is_admin());

-- job-child tables: read-only for members, written by service role only
create policy requirements_select on public.requirements for select
  using (exists (select 1 from public.jobs j where j.id = job_id and public.is_org_member(j.organization_id)));
create policy bid_decisions_select on public.bid_decisions for select
  using (exists (select 1 from public.jobs j where j.id = job_id and public.is_org_member(j.organization_id)));
create policy draft_sections_select on public.draft_sections for select
  using (exists (select 1 from public.jobs j where j.id = job_id and public.is_org_member(j.organization_id)));
create policy claim_links_select on public.claim_evidence_links for select
  using (exists (
    select 1 from public.draft_sections ds
    join public.jobs j on j.id = ds.job_id
    where ds.id = draft_section_id and public.is_org_member(j.organization_id)
  ));
create policy agent_runs_select on public.agent_runs for select
  using (
    public.is_admin() or exists (
      select 1 from public.jobs j where j.id = job_id and public.is_org_member(j.organization_id)
    )
  );
create policy human_reviews_select on public.human_reviews for select
  using (public.is_admin() or exists (
    select 1 from public.jobs j where j.id = job_id and public.is_org_member(j.organization_id)
  ));
create policy deliverables_select on public.deliverables for select
  using (exists (select 1 from public.jobs j where j.id = job_id and public.is_org_member(j.organization_id)));
create policy outcomes_select on public.outcomes for select
  using (exists (select 1 from public.jobs j where j.id = job_id and public.is_org_member(j.organization_id)));
create policy outcomes_insert on public.outcomes for insert
  with check (exists (select 1 from public.jobs j where j.id = job_id and public.is_org_member(j.organization_id)));
