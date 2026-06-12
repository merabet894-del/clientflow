-- Run this file in Supabase SQL Editor before using real database features.

-- Agencies
create table if not exists agencies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  website text,
  contact_email text,
  plan text default 'starter' check (plan in ('starter', 'pro', 'agency')),
  subscription_status text default 'trialing' check (subscription_status in ('trialing', 'active', 'past_due', 'canceled', 'incomplete')),
  trial_ends_at timestamp with time zone default (now() + interval '14 days'),
  current_period_end timestamp with time zone,
  stripe_customer_id text,
  stripe_subscription_id text,
  max_clients integer default 10,
  max_projects integer default 10,
  max_team_members integer default 1,
  max_storage_mb integer default 500,
  created_at timestamp with time zone default now()
);

alter table agencies add column if not exists plan text default 'starter';
alter table agencies add column if not exists subscription_status text default 'trialing';
alter table agencies add column if not exists trial_ends_at timestamp with time zone default (now() + interval '14 days');
alter table agencies add column if not exists current_period_end timestamp with time zone;
alter table agencies add column if not exists stripe_customer_id text;
alter table agencies add column if not exists stripe_subscription_id text;
alter table agencies add column if not exists max_clients integer default 10;
alter table agencies add column if not exists max_projects integer default 10;
alter table agencies add column if not exists max_team_members integer default 1;
alter table agencies add column if not exists max_storage_mb integer default 500;

update agencies
set
  plan = coalesce(plan, 'starter'),
  subscription_status = coalesce(subscription_status, 'trialing'),
  trial_ends_at = coalesce(trial_ends_at, now() + interval '14 days'),
  max_clients = coalesce(max_clients, 10),
  max_projects = coalesce(max_projects, 10),
  max_team_members = coalesce(max_team_members, 1),
  max_storage_mb = coalesce(max_storage_mb, 500);

alter table agencies enable row level security;

create policy "Users can view their own agency"
  on agencies for select
  using (owner_id = auth.uid());

create policy "Users can create their own agency"
  on agencies for insert
  with check (owner_id = auth.uid());

create policy "Users can update their own agency"
  on agencies for update
  using (owner_id = auth.uid());

create policy "Users can delete their own agency"
  on agencies for delete
  using (owner_id = auth.uid());

-- Clients
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid references agencies(id) on delete cascade not null,
  name text not null,
  email text,
  company text,
  status text default 'active',
  created_at timestamp with time zone default now()
);

alter table clients enable row level security;

create policy "Users can view clients in their agency"
  on clients for select
  using (agency_id in (select id from agencies where owner_id = auth.uid()));

create policy "Users can insert clients in their agency"
  on clients for insert
  with check (agency_id in (select id from agencies where owner_id = auth.uid()));

create policy "Users can update clients in their agency"
  on clients for update
  using (agency_id in (select id from agencies where owner_id = auth.uid()));

create policy "Users can delete clients in their agency"
  on clients for delete
  using (agency_id in (select id from agencies where owner_id = auth.uid()));

-- Projects
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid references agencies(id) on delete cascade not null,
  client_id uuid references clients(id) on delete cascade,
  name text not null,
  description text,
  status text default 'active',
  progress integer default 0,
  portal_token text unique default encode(gen_random_bytes(24), 'hex'),
  portal_shared_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table projects enable row level security;

create policy "Users can view projects in their agency"
  on projects for select
  using (agency_id in (select id from agencies where owner_id = auth.uid()));

create policy "Users can insert projects in their agency"
  on projects for insert
  with check (agency_id in (select id from agencies where owner_id = auth.uid()));

alter table projects add column if not exists portal_shared_at timestamp with time zone;

create policy "Users can update projects in their agency"
  on projects for update
  using (agency_id in (select id from agencies where owner_id = auth.uid()));

create policy "Users can delete projects in their agency"
  on projects for delete
  using (agency_id in (select id from agencies where owner_id = auth.uid()));

-- Project items
create table if not exists project_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade not null,
  title text not null,
  description text,
  status text default 'todo',
  due_date date,
  created_at timestamp with time zone default now()
);

alter table project_items enable row level security;

create policy "Users can view project items in their agency"
  on project_items for select
  using (project_id in (
    select p.id from projects p
    join agencies a on a.id = p.agency_id
    where a.owner_id = auth.uid()
  ));

create policy "Users can insert project items in their agency"
  on project_items for insert
  with check (project_id in (
    select p.id from projects p
    join agencies a on a.id = p.agency_id
    where a.owner_id = auth.uid()
  ));

create policy "Users can update project items in their agency"
  on project_items for update
  using (project_id in (
    select p.id from projects p
    join agencies a on a.id = p.agency_id
    where a.owner_id = auth.uid()
  ));

create policy "Users can delete project items in their agency"
  on project_items for delete
  using (project_id in (
    select p.id from projects p
    join agencies a on a.id = p.agency_id
    where a.owner_id = auth.uid()
  ));

-- Comments
create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade not null,
  author_type text not null,
  author_name text,
  body text not null,
  created_at timestamp with time zone default now()
);

alter table comments enable row level security;

create policy "Users can view comments in their agency"
  on comments for select
  using (project_id in (
    select p.id from projects p
    join agencies a on a.id = p.agency_id
    where a.owner_id = auth.uid()
  ));

create policy "Users can insert comments in their agency"
  on comments for insert
  with check (project_id in (
    select p.id from projects p
    join agencies a on a.id = p.agency_id
    where a.owner_id = auth.uid()
  ));

create policy "Users can update comments in their agency"
  on comments for update
  using (project_id in (
    select p.id from projects p
    join agencies a on a.id = p.agency_id
    where a.owner_id = auth.uid()
  ));

create policy "Users can delete comments in their agency"
  on comments for delete
  using (project_id in (
    select p.id from projects p
    join agencies a on a.id = p.agency_id
    where a.owner_id = auth.uid()
  ));

-- Approvals
create table if not exists approvals (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade not null,
  title text not null,
  status text default 'pending',
  feedback text,
  approved_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

alter table approvals enable row level security;

create policy "Users can view approvals in their agency"
  on approvals for select
  using (project_id in (
    select p.id from projects p
    join agencies a on a.id = p.agency_id
    where a.owner_id = auth.uid()
  ));

create policy "Users can insert approvals in their agency"
  on approvals for insert
  with check (project_id in (
    select p.id from projects p
    join agencies a on a.id = p.agency_id
    where a.owner_id = auth.uid()
  ));

create policy "Users can update approvals in their agency"
  on approvals for update
  using (project_id in (
    select p.id from projects p
    join agencies a on a.id = p.agency_id
    where a.owner_id = auth.uid()
  ));

create policy "Users can delete approvals in their agency"
  on approvals for delete
  using (project_id in (
    select p.id from projects p
    join agencies a on a.id = p.agency_id
    where a.owner_id = auth.uid()
  ));

-- Files
create table if not exists files (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid references agencies(id) on delete cascade not null,
  project_id uuid references projects(id) on delete cascade,
  client_id uuid references clients(id) on delete set null,
  name text not null,
  type text,
  size text,
  url text,
  created_at timestamp with time zone default now()
);

alter table files enable row level security;

create policy "Users can view files in their agency"
  on files for select
  using (agency_id in (select id from agencies where owner_id = auth.uid()));

create policy "Users can insert files in their agency"
  on files for insert
  with check (agency_id in (select id from agencies where owner_id = auth.uid()));

create policy "Users can update files in their agency"
  on files for update
  using (agency_id in (select id from agencies where owner_id = auth.uid()));

create policy "Users can delete files in their agency"
  on files for delete
  using (agency_id in (select id from agencies where owner_id = auth.uid()));

-- Notifications
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid references agencies(id) on delete cascade not null,
  project_id uuid references projects(id) on delete cascade,
  client_id uuid references clients(id) on delete set null,
  type text not null check (type in ('feedback', 'approval', 'changes_requested', 'portal_view', 'file_view')),
  title text not null,
  message text not null,
  target_href text not null,
  is_read boolean not null default false,
  created_at timestamp with time zone default now()
);

alter table notifications enable row level security;

create policy "Users can view notifications in their agency"
  on notifications for select
  using (agency_id in (select id from agencies where owner_id = auth.uid()));

create policy "Users can update notifications in their agency"
  on notifications for update
  using (agency_id in (select id from agencies where owner_id = auth.uid()))
  with check (agency_id in (select id from agencies where owner_id = auth.uid()));
