-- Owners must be able to read their organization immediately after INSERT
-- (before their organization_members row exists), otherwise INSERT ... RETURNING
-- fails the SELECT policy check.
create policy orgs_owner_select on public.organizations for select
  using (owner_user_id = auth.uid());
