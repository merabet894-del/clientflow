-- Run this in Supabase SQL Editor to allow public portal feedback and approval actions.
-- These policies give anonymous users minimal write access for the client portal.
-- Existing authenticated user policies are preserved.

-- Allow anon insert on comments when the project has a portal_token
create policy "Anon can insert comments on portal projects"
  on comments for insert
  to anon
  with check (
    exists (
      select 1 from projects
      where projects.id = project_id
        and projects.portal_token is not null
    )
  );

-- Allow anon insert on approvals when the project has a portal_token
create policy "Anon can insert approvals on portal projects"
  on approvals for insert
  to anon
  with check (
    exists (
      select 1 from projects
      where projects.id = project_id
        and projects.portal_token is not null
    )
  );

-- Allow anon to update project status when the project has a portal_token
create policy "Anon can update portal project status"
  on projects for update
  to anon
  using (portal_token is not null)
  with check (portal_token is not null);
