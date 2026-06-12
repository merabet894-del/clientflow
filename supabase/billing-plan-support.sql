-- Run this in Supabase SQL Editor to add billing-plan fields to existing ClientFlow workspaces.

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
