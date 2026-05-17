create extension if not exists "pgcrypto";

do $$ begin
  create type public.user_role as enum ('JOB_SEEKER', 'COMPANY');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.work_mode as enum ('Remote', 'Hybrid', 'On-site');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.job_type as enum ('Full-time', 'Part-time', 'Internship', 'Contract');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.application_status as enum ('APPLIED', 'VIEWED', 'INTERVIEW', 'REJECTED', 'OFFER');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.analysis_label as enum ('Strong Match', 'Close Match', 'Not Ready Yet');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.cuppy_state as enum ('idle', 'happy', 'judgy', 'thinking', 'celebrate');
exception
  when duplicate_object then null;
end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null,
  email text not null,
  full_name text,
  avatar_url text,
  target_role text,
  profile_data jsonb not null default '{}'::jsonb,
  onboarded boolean not null default false,
  xp integer not null default 0 check (xp >= 0),
  streak integer not null default 0 check (streak >= 0),
  level text not null default 'NEWCOMER',
  ats_score integer not null default 0 check (ats_score between 0 and 100),
  skill_match integer not null default 0 check (skill_match between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists role public.user_role;
alter table public.profiles alter column role set default 'JOB_SEEKER';
update public.profiles set role = 'JOB_SEEKER' where role is null;
alter table public.profiles alter column role set not null;
alter table public.profiles add column if not exists email text;
update public.profiles as profiles
set email = coalesce(profiles.email, auth_users.email, '')
from auth.users as auth_users
where profiles.id = auth_users.id
  and profiles.email is null;
update public.profiles set email = '' where email is null;
alter table public.profiles alter column email set not null;
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists target_role text;
alter table public.profiles add column if not exists profile_data jsonb not null default '{}'::jsonb;
alter table public.profiles add column if not exists onboarded boolean not null default false;
alter table public.profiles add column if not exists xp integer not null default 0;
alter table public.profiles add column if not exists streak integer not null default 0;
alter table public.profiles add column if not exists level text not null default 'NEWCOMER';
alter table public.profiles add column if not exists ats_score integer not null default 0;
alter table public.profiles add column if not exists skill_match integer not null default 0;
alter table public.profiles add column if not exists created_at timestamptz not null default now();
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  logo_url text,
  industry text not null default '',
  size text not null default '',
  description text not null default '',
  website text not null default '',
  credibility_score integer not null default 0 check (credibility_score >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.companies add column if not exists owner_id uuid references auth.users(id) on delete cascade;
alter table public.companies add column if not exists name text;
alter table public.companies add column if not exists logo_url text;
alter table public.companies add column if not exists industry text not null default '';
alter table public.companies add column if not exists size text not null default '';
alter table public.companies add column if not exists description text not null default '';
alter table public.companies add column if not exists website text not null default '';
alter table public.companies add column if not exists credibility_score integer not null default 0;
alter table public.companies add column if not exists created_at timestamptz not null default now();
alter table public.companies add column if not exists updated_at timestamptz not null default now();

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  title text not null,
  location text not null,
  work_mode public.work_mode not null,
  type public.job_type not null,
  salary_min integer not null default 0 check (salary_min >= 0),
  salary_max integer not null default 0 check (salary_max >= salary_min),
  currency text not null default 'RM',
  description text not null,
  required_skills text[] not null default '{}',
  nice_to_have_skills text[] not null default '{}',
  is_active boolean not null default true,
  posted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.jobs add column if not exists company_id uuid references public.companies(id) on delete cascade;
alter table public.jobs add column if not exists title text;
alter table public.jobs add column if not exists location text;
alter table public.jobs add column if not exists work_mode public.work_mode;
alter table public.jobs add column if not exists type public.job_type;
alter table public.jobs add column if not exists salary_min integer not null default 0;
alter table public.jobs add column if not exists salary_max integer not null default 0;
alter table public.jobs add column if not exists currency text not null default 'RM';
alter table public.jobs add column if not exists description text;
alter table public.jobs add column if not exists required_skills text[] not null default '{}';
alter table public.jobs add column if not exists nice_to_have_skills text[] not null default '{}';
alter table public.jobs add column if not exists is_active boolean not null default true;
alter table public.jobs add column if not exists posted_at timestamptz not null default now();
alter table public.jobs add column if not exists created_at timestamptz not null default now();
alter table public.jobs add column if not exists updated_at timestamptz not null default now();

create table if not exists public.generated_resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid references public.jobs(id) on delete set null,
  title text not null,
  resume_json jsonb not null,
  model text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.generated_resumes add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.generated_resumes add column if not exists job_id uuid references public.jobs(id) on delete set null;
alter table public.generated_resumes add column if not exists title text;
alter table public.generated_resumes add column if not exists resume_json jsonb;
alter table public.generated_resumes add column if not exists model text;
alter table public.generated_resumes add column if not exists created_at timestamptz not null default now();
alter table public.generated_resumes add column if not exists updated_at timestamptz not null default now();

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  tailored_resume_id uuid references public.generated_resumes(id) on delete set null,
  status public.application_status not null default 'APPLIED',
  cover_note text,
  applied_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, job_id)
);

alter table public.applications add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.applications add column if not exists job_id uuid references public.jobs(id) on delete cascade;
alter table public.applications add column if not exists tailored_resume_id uuid references public.generated_resumes(id) on delete set null;
alter table public.applications add column if not exists status public.application_status not null default 'APPLIED';
alter table public.applications add column if not exists cover_note text;
alter table public.applications add column if not exists applied_at timestamptz not null default now();
alter table public.applications add column if not exists updated_at timestamptz not null default now();
alter table public.applications drop column if exists job_title;
alter table public.applications drop column if exists company;
alter table public.applications drop column if exists jd_url;
alter table public.applications drop column if exists followup_7_sent;
alter table public.applications drop column if exists followup_14_sent;

create table if not exists public.analysis_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid references public.jobs(id) on delete set null,
  match_score integer not null check (match_score between 0 and 100),
  label public.analysis_label not null,
  cuppy_state public.cuppy_state not null,
  result jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.analysis_results add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.analysis_results add column if not exists job_id uuid references public.jobs(id) on delete set null;
alter table public.analysis_results add column if not exists match_score integer;
alter table public.analysis_results add column if not exists label public.analysis_label;
alter table public.analysis_results add column if not exists cuppy_state public.cuppy_state;
alter table public.analysis_results add column if not exists result jsonb;
alter table public.analysis_results add column if not exists created_at timestamptz not null default now();

create table if not exists public.github_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  github_username text not null,
  data jsonb not null,
  fetched_at timestamptz not null default now()
);

alter table public.github_snapshots add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.github_snapshots add column if not exists github_username text;
alter table public.github_snapshots add column if not exists data jsonb;
alter table public.github_snapshots add column if not exists fetched_at timestamptz not null default now();

create index if not exists profiles_role_idx on public.profiles(role);
create index if not exists companies_owner_id_idx on public.companies(owner_id);
create index if not exists jobs_company_id_idx on public.jobs(company_id);
create index if not exists jobs_active_posted_at_idx on public.jobs(is_active, posted_at desc);
create index if not exists jobs_required_skills_gin_idx on public.jobs using gin(required_skills);
create index if not exists applications_user_id_idx on public.applications(user_id);
create index if not exists applications_job_id_idx on public.applications(job_id);
create index if not exists applications_status_idx on public.applications(status);
create index if not exists analysis_results_user_id_idx on public.analysis_results(user_id);
create index if not exists generated_resumes_user_id_idx on public.generated_resumes(user_id);
create index if not exists github_snapshots_user_id_idx on public.github_snapshots(user_id);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_companies_updated_at on public.companies;
create trigger set_companies_updated_at
before update on public.companies
for each row execute function public.set_updated_at();

drop trigger if exists set_jobs_updated_at on public.jobs;
create trigger set_jobs_updated_at
before update on public.jobs
for each row execute function public.set_updated_at();

drop trigger if exists set_generated_resumes_updated_at on public.generated_resumes;
create trigger set_generated_resumes_updated_at
before update on public.generated_resumes
for each row execute function public.set_updated_at();

drop trigger if exists set_applications_updated_at on public.applications;
create trigger set_applications_updated_at
before update on public.applications
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.jobs enable row level security;
alter table public.generated_resumes enable row level security;
alter table public.applications enable row level security;
alter table public.analysis_results enable row level security;
alter table public.github_snapshots enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles for select
to authenticated
using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "companies_select_public" on public.companies;
create policy "companies_select_public"
on public.companies for select
to authenticated
using (true);

drop policy if exists "companies_owner_write" on public.companies;
create policy "companies_owner_write"
on public.companies for all
to authenticated
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "jobs_select_active" on public.jobs;
create policy "jobs_select_active"
on public.jobs for select
to authenticated
using (
  is_active = true
  or exists (
    select 1 from public.companies
    where companies.id = jobs.company_id
      and companies.owner_id = auth.uid()
  )
);

drop policy if exists "jobs_company_owner_write" on public.jobs;
create policy "jobs_company_owner_write"
on public.jobs for all
to authenticated
using (
  exists (
    select 1 from public.companies
    where companies.id = jobs.company_id
      and companies.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.companies
    where companies.id = jobs.company_id
      and companies.owner_id = auth.uid()
  )
);

drop policy if exists "generated_resumes_select_own" on public.generated_resumes;
create policy "generated_resumes_select_own"
on public.generated_resumes for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "generated_resumes_write_own" on public.generated_resumes;
create policy "generated_resumes_write_own"
on public.generated_resumes for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "applications_job_seeker_select_own" on public.applications;
create policy "applications_job_seeker_select_own"
on public.applications for select
to authenticated
using (
  auth.uid() = user_id
  or exists (
    select 1
    from public.jobs
    join public.companies on companies.id = jobs.company_id
    where jobs.id = applications.job_id
      and companies.owner_id = auth.uid()
  )
);

drop policy if exists "applications_job_seeker_insert_own" on public.applications;
create policy "applications_job_seeker_insert_own"
on public.applications for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "applications_update_owner_or_company" on public.applications;
create policy "applications_update_owner_or_company"
on public.applications for update
to authenticated
using (
  auth.uid() = user_id
  or exists (
    select 1
    from public.jobs
    join public.companies on companies.id = jobs.company_id
    where jobs.id = applications.job_id
      and companies.owner_id = auth.uid()
  )
)
with check (
  auth.uid() = user_id
  or exists (
    select 1
    from public.jobs
    join public.companies on companies.id = jobs.company_id
    where jobs.id = applications.job_id
      and companies.owner_id = auth.uid()
  )
);

drop policy if exists "analysis_results_select_own" on public.analysis_results;
create policy "analysis_results_select_own"
on public.analysis_results for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "analysis_results_insert_own" on public.analysis_results;
create policy "analysis_results_insert_own"
on public.analysis_results for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "github_snapshots_select_own" on public.github_snapshots;
create policy "github_snapshots_select_own"
on public.github_snapshots for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "github_snapshots_write_own" on public.github_snapshots;
create policy "github_snapshots_write_own"
on public.github_snapshots for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create or replace function public.health_check()
returns jsonb
language sql
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'service', 'supabase',
    'status', 'ok',
    'checkedAt', now()
  );
$$;

grant usage on schema public to anon, authenticated, service_role;
grant all privileges on all tables in schema public to service_role;
grant all privileges on all routines in schema public to service_role;
grant all privileges on all sequences in schema public to service_role;

grant select on public.companies to authenticated;
grant select on public.jobs to authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update on public.applications to authenticated;
grant select, insert on public.analysis_results to authenticated;
grant select, insert, update on public.generated_resumes to authenticated;
grant select, insert, update on public.github_snapshots to authenticated;

alter default privileges in schema public
grant all privileges on tables to service_role;

alter default privileges in schema public
grant all privileges on routines to service_role;

alter default privileges in schema public
grant all privileges on sequences to service_role;
