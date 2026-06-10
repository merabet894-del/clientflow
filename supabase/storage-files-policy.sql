-- Run this in Supabase SQL Editor after creating the clientflow-files storage bucket.
-- Create the bucket via Supabase Dashboard: Storage → Create bucket → name: clientflow-files

-- Allow authenticated users to view objects in the clientflow-files bucket
create policy "Authenticated users can view files"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'clientflow-files');

-- Allow authenticated users to upload objects to the clientflow-files bucket
create policy "Authenticated users can upload files"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'clientflow-files');

-- Allow authenticated users to update objects in the clientflow-files bucket
create policy "Authenticated users can update files"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'clientflow-files');

-- Allow authenticated users to delete objects in the clientflow-files bucket
create policy "Authenticated users can delete files"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'clientflow-files');
