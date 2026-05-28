-- PhyCalcPro workspace persistence schema
-- Apply in Supabase SQL editor or migration tool.

create table if not exists projects (
  id text primary key,
  userId text not null,
  name text not null,
  description text,
  tags text[] not null default '{}',
  createdAt timestamptz not null default now(),
  updatedAt timestamptz not null default now()
);

create table if not exists models (
  id text primary key,
  userId text not null,
  projectId text not null references projects(id) on delete cascade,
  title text not null,
  moduleId text not null,
  payload jsonb not null default '{}'::jsonb,
  createdAt timestamptz not null default now(),
  updatedAt timestamptz not null default now()
);

create table if not exists equations (
  id text primary key,
  userId text not null,
  projectId text not null references projects(id) on delete cascade,
  modelId text references models(id) on delete set null,
  title text not null,
  expression text not null,
  outputDimension text not null,
  variableSpecs jsonb not null default '[]'::jsonb,
  createdAt timestamptz not null default now(),
  updatedAt timestamptz not null default now()
);

create table if not exists runs (
  id text primary key,
  userId text not null,
  projectId text not null references projects(id) on delete cascade,
  modelId text references models(id) on delete set null,
  equationId text references equations(id) on delete set null,
  status text not null check (status in ('queued', 'running', 'succeeded', 'failed')),
  input jsonb not null default '{}'::jsonb,
  output jsonb,
  error text,
  createdAt timestamptz not null default now(),
  updatedAt timestamptz not null default now()
);

create index if not exists idx_projects_userId on projects(userId);
create index if not exists idx_models_userId on models(userId);
create index if not exists idx_equations_userId on equations(userId);
create index if not exists idx_runs_userId on runs(userId);
