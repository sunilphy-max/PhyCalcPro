-- Optional PhyCalcPro Phase 5 tables (run in Supabase SQL editor)

create table if not exists public.user_entitlements (
  userId uuid primary key references auth.users (id) on delete cascade,
  token text not null,
  tier text not null,
  updatedAt timestamptz not null default now()
);

alter table public.user_entitlements enable row level security;

create policy "Users read own entitlement"
  on public.user_entitlements for select
  using (auth.uid() = userId);

-- User feedback (Support page form) — service role inserts; view in Table Editor
create table if not exists public.user_feedback (
  id text primary key,
  email text not null,
  message text not null,
  pageUrl text,
  userAgent text,
  createdAt timestamptz not null default now()
);

alter table public.user_feedback enable row level security;

-- No public policies: only service role (API route) can insert/read

-- Workspace tables (if not already present)
-- projects, models, equations, runs — match src/lib/persistence/types.ts
