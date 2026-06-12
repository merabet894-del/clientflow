-- Run this in Supabase SQL Editor to create the sales_leads table for waitlist/contact-sales capture.

create table if not exists sales_leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  name text,
  company text,
  plan_interest text not null default 'pro',
  team_size text,
  clients_count text,
  message text,
  source text default 'pricing',
  user_id uuid references auth.users(id) on delete set null,
  agency_id uuid references agencies(id) on delete set null,
  status text default 'new',
  created_at timestamp with time zone default now()
);

alter table sales_leads enable row level security;

create policy "Anyone can insert sales leads"
  on sales_leads for insert
  with check (true);

create policy "Users can view their own sales leads"
  on sales_leads for select
  using (user_id = auth.uid());

-- Plan interest tracking for agencies
alter table agencies add column if not exists plan_interest text;
