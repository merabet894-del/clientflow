-- Run this in Supabase SQL Editor to allow public portal file metadata reads by portal token.
-- These policies give anonymous users minimal read access to file metadata for the client portal.
-- Existing authenticated user policies are preserved.

-- Allow anon select on files when linked to a project with portal_token not null
create policy "Anon can view files for portal projects"
  on files for select
  to anon
  using (
    exists (
      select 1 from projects
      where projects.id = files.project_id
        and projects.portal_token is not null
    )
  );
