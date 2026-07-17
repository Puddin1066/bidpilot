-- Pipeline write policies: the orchestrator runs in server actions under the
-- authenticated customer's session (RLS-scoped). Members may write pipeline
-- records only for jobs inside their own organization. agent_runs immutability
-- (no update/delete) is still enforced by the block_mutation trigger.

create or replace function public.is_job_member(p_job_id uuid)
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from public.jobs j
    join public.organization_members m on m.organization_id = j.organization_id
    where j.id = p_job_id and m.user_id = auth.uid()
  );
$$;

create policy jobs_member_insert on public.jobs for insert
  with check (public.is_org_member(organization_id));
create policy jobs_member_update on public.jobs for update
  using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

create policy requirements_member_insert on public.requirements for insert
  with check (public.is_job_member(job_id));
create policy requirements_member_update on public.requirements for update
  using (public.is_job_member(job_id))
  with check (public.is_job_member(job_id));

create policy bid_decisions_member_insert on public.bid_decisions for insert
  with check (public.is_job_member(job_id));
create policy bid_decisions_member_update on public.bid_decisions for update
  using (public.is_job_member(job_id))
  with check (public.is_job_member(job_id));

create policy draft_sections_member_insert on public.draft_sections for insert
  with check (public.is_job_member(job_id));

create policy claim_links_member_insert on public.claim_evidence_links for insert
  with check (exists (
    select 1 from public.draft_sections ds
    where ds.id = draft_section_id and public.is_job_member(ds.job_id)
  ));

create policy agent_runs_member_insert on public.agent_runs for insert
  with check (job_id is not null and public.is_job_member(job_id));

create policy human_reviews_member_insert on public.human_reviews for insert
  with check (public.is_job_member(job_id));

create policy deliverables_member_insert on public.deliverables for insert
  with check (public.is_job_member(job_id));

-- ---------------------------------------------------------------------------
-- Private storage bucket for solicitation and company documents.
-- Object paths are {organization_id}/{job_id or 'profile'}/{filename}.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

create policy documents_org_select on storage.objects for select to authenticated
  using (
    bucket_id = 'documents'
    and public.is_org_member(((storage.foldername(name))[1])::uuid)
  );

create policy documents_org_insert on storage.objects for insert to authenticated
  with check (
    bucket_id = 'documents'
    and public.is_org_member(((storage.foldername(name))[1])::uuid)
  );
