-- Allow members to clear job-scoped pipeline artifacts so re-runs (e.g. the
-- one included revision) replace rather than duplicate rows.

create policy requirements_member_delete on public.requirements for delete
  using (public.is_job_member(job_id));

create policy draft_sections_member_delete on public.draft_sections for delete
  using (public.is_job_member(job_id));

create policy claim_links_member_delete on public.claim_evidence_links for delete
  using (exists (
    select 1 from public.draft_sections ds
    where ds.id = draft_section_id and public.is_job_member(ds.job_id)
  ));
