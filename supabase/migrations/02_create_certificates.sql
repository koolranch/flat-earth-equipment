-- 02_create_certificates.sql
create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null,
  course_id uuid not null,
  issue_date date not null default current_date,
  score int not null,
  verifier_code text not null unique,
  module_ids jsonb,
  created_at timestamptz not null default now()
);

-- Optional FKs: uncomment and adjust if your schema has these tables
-- alter table public.certificates add constraint fk_cert_learner foreign key (learner_id) references public.users(id) on delete cascade;
-- alter table public.certificates add constraint fk_cert_course  foreign key (course_id)  references public.courses(id) on delete cascade;

create index if not exists idx_cert_learner on public.certificates(learner_id);
create index if not exists idx_cert_course on public.certificates(course_id);
create unique index if not exists idx_cert_verifier_code on public.certificates(verifier_code);

alter table public.certificates enable row level security;

drop policy if exists learner_can_read_own_cert on public.certificates;
create policy learner_can_read_own_cert
on public.certificates
for select
to authenticated
using ( learner_id = auth.uid() );

-- service role full access for server API routes
drop policy if exists service_full_access on public.certificates;
create policy service_full_access
on public.certificates
for all
to service_role
using (true)
with check (true);
