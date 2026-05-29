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

-- Workspace tables (if not already present)
-- projects, models, equations, runs — match src/lib/persistence/types.ts
