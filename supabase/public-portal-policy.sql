-- Run this in Supabase SQL Editor to allow public portal reads by portal token.
-- These policies give anonymous users minimal read access for the client portal.
-- Existing authenticated user policies are preserved.

-- Allow anon/public select on projects when portal_token is not null
create policy "Anon can view projects with portal_token"
  on projects for select
  to anon
  using (portal_token is not null);

-- Allow anon/public select on clients linked to a project with portal_token
create policy "Anon can view clients linked to portal projects"
  on clients for select
  to anon
  using (
    exists (
      select 1 from projects
      where projects.client_id = clients.id
        and projects.portal_token is not null
    )
  );
