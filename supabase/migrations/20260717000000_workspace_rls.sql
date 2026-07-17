-- Workspace tables with quoted camelCase columns + RLS
-- Default project ids are per-user: default:<userId>

create table if not exists public.projects (
  id text not null,
  "userId" text not null,
  name text not null,
  description text,
  tags text[] not null default '{}',
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  primary key (id)
);

create table if not exists public.models (
  id text primary key,
  "userId" text not null,
  "projectId" text not null,
  title text not null,
  "moduleId" text not null,
  payload jsonb not null default '{}'::jsonb,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists public.equations (
  id text primary key,
  "userId" text not null,
  "projectId" text not null,
  "modelId" text,
  title text not null,
  expression text not null,
  "outputDimension" text not null,
  "variableSpecs" jsonb not null default '[]'::jsonb,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists public.runs (
  id text primary key,
  "userId" text not null,
  "projectId" text not null,
  "modelId" text,
  "equationId" text,
  status text not null check (status in ('queued', 'running', 'succeeded', 'failed')),
  input jsonb not null default '{}'::jsonb,
  output jsonb,
  error text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create index if not exists idx_projects_userId on public.projects ("userId");
create index if not exists idx_models_userId on public.models ("userId");
create index if not exists idx_equations_userId on public.equations ("userId");
create index if not exists idx_runs_userId on public.runs ("userId");

alter table public.projects enable row level security;
alter table public.models enable row level security;
alter table public.equations enable row level security;
alter table public.runs enable row level security;

drop policy if exists "Users select own projects" on public.projects;
drop policy if exists "Users insert own projects" on public.projects;
drop policy if exists "Users update own projects" on public.projects;
drop policy if exists "Users delete own projects" on public.projects;
create policy "Users select own projects" on public.projects for select using (auth.uid()::text = "userId");
create policy "Users insert own projects" on public.projects for insert with check (auth.uid()::text = "userId");
create policy "Users update own projects" on public.projects for update using (auth.uid()::text = "userId");
create policy "Users delete own projects" on public.projects for delete using (auth.uid()::text = "userId");

drop policy if exists "Users select own models" on public.models;
drop policy if exists "Users insert own models" on public.models;
drop policy if exists "Users update own models" on public.models;
drop policy if exists "Users delete own models" on public.models;
create policy "Users select own models" on public.models for select using (auth.uid()::text = "userId");
create policy "Users insert own models" on public.models for insert with check (auth.uid()::text = "userId");
create policy "Users update own models" on public.models for update using (auth.uid()::text = "userId");
create policy "Users delete own models" on public.models for delete using (auth.uid()::text = "userId");

drop policy if exists "Users select own equations" on public.equations;
drop policy if exists "Users insert own equations" on public.equations;
drop policy if exists "Users update own equations" on public.equations;
drop policy if exists "Users delete own equations" on public.equations;
create policy "Users select own equations" on public.equations for select using (auth.uid()::text = "userId");
create policy "Users insert own equations" on public.equations for insert with check (auth.uid()::text = "userId");
create policy "Users update own equations" on public.equations for update using (auth.uid()::text = "userId");
create policy "Users delete own equations" on public.equations for delete using (auth.uid()::text = "userId");

drop policy if exists "Users select own runs" on public.runs;
drop policy if exists "Users insert own runs" on public.runs;
drop policy if exists "Users update own runs" on public.runs;
drop policy if exists "Users delete own runs" on public.runs;
create policy "Users select own runs" on public.runs for select using (auth.uid()::text = "userId");
create policy "Users insert own runs" on public.runs for insert with check (auth.uid()::text = "userId");
create policy "Users update own runs" on public.runs for update using (auth.uid()::text = "userId");
create policy "Users delete own runs" on public.runs for delete using (auth.uid()::text = "userId");
