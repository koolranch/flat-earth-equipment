-- 01_create_employer_evaluations.sql
create table if not exists public.employer_evaluations (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.enrollments(id) on delete cascade,
  evaluator_name text not null,
  evaluator_title text,
  site_location text,
  evaluation_date date not null,
  practical_pass boolean not null,
  evaluator_signature text,
  notes text,
  verified_by_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_employer_evals_enrollment on public.employer_evaluations(enrollment_id);

alter table public.employer_evaluations enable row level security;

drop policy if exists learner_read_own_eval on public.employer_evaluations;
create policy learner_read_own_eval
on public.employer_evaluations
for select
to authenticated
using (
  exists (
    select 1
    from public.enrollments e
    where e.id = employer_evaluations.enrollment_id
      and e.user_id = auth.uid()
  )
);

-- service_role full access for server-side API routes
drop policy if exists service_insert_update_eval on public.employer_evaluations;
create policy service_insert_update_eval
on public.employer_evaluations
for all
to service_role
using (true)
with check (true);
