-- Entitlements + feedback tables with RLS

create table if not exists public.user_entitlements (
  "userId" uuid primary key references auth.users (id) on delete cascade,
  token text not null,
  tier text not null,
  "updatedAt" timestamptz not null default now()
);

alter table public.user_entitlements enable row level security;

drop policy if exists "Users read own entitlement" on public.user_entitlements;
create policy "Users read own entitlement"
  on public.user_entitlements for select
  using (auth.uid() = "userId");

create table if not exists public.user_feedback (
  id text primary key,
  email text not null,
  message text not null,
  "pageUrl" text,
  "userAgent" text,
  "createdAt" timestamptz not null default now()
);

alter table public.user_feedback enable row level security;
