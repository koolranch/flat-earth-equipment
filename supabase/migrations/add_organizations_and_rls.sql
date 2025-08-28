-- Enable needed extensions
create extension if not exists pgcrypto; -- for gen_random_uuid()

-- 1) ORGS
create table if not exists public.orgs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

-- 2) ORG MEMBERS
create table if not exists public.org_members (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','trainer','learner')) default 'learner',
  created_at timestamptz not null default now(),
  unique(org_id, user_id)
);
create index if not exists org_members_org_idx on public.org_members(org_id);
create index if not exists org_members_user_idx on public.org_members(user_id);

-- 3) SEATS (optional accounting)
create table if not exists public.org_seats (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  total_seats int not null check (total_seats >= 0),
  allocated_seats int not null default 0 check (allocated_seats >= 0),
  created_at timestamptz not null default now(),
  unique(org_id, course_id)
);

-- 4) INVITATIONS
create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  email text not null check (position('@' in email) > 1),
  role text not null check (role in ('owner','trainer','learner')) default 'learner',
  token text not null unique,
  invited_by uuid not null references auth.users(id) on delete restrict,
  expires_at timestamptz not null default (now() + interval '14 days'),
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists invitations_org_idx on public.invitations(org_id);
create index if not exists invitations_email_idx on public.invitations(email);

-- 5) ENROLLMENTS: link to ORG + learner_email for roster convenience
alter table public.enrollments add column if not exists org_id uuid references public.orgs(id) on delete set null;
alter table public.enrollments add column if not exists learner_email text;
create index if not exists enrollments_org_idx on public.enrollments(org_id);

-- 6) AUDIT EVENTS
create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.orgs(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null, -- e.g., 'invite.create','seat.assign','eval.save','export.csv'
  target text,         -- e.g., enrollment_id, user_id, email
  meta jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists audit_events_org_idx on public.audit_events(org_id);

-- SECURITY: RLS
alter table public.orgs enable row level security;
alter table public.org_members enable row level security;
alter table public.org_seats enable row level security;
alter table public.invitations enable row level security;
alter table public.enrollments enable row level security;
alter table public.audit_events enable row level security;

-- Helper: is member with role
create or replace function public.is_org_role(p_org uuid, roles text[])
returns boolean language sql stable as $$
  select exists (
    select 1 from public.org_members m
    where m.org_id = p_org and m.user_id = auth.uid() and m.role = any(roles)
  );
$$;

-- ORGS policies
create policy if not exists orgs_select on public.orgs
for select to authenticated using ( exists (
  select 1 from public.org_members m where m.org_id = orgs.id and m.user_id = auth.uid()
));
create policy if not exists orgs_insert on public.orgs
for insert to authenticated with check (created_by = auth.uid());
create policy if not exists orgs_update on public.orgs
for update to authenticated using ( public.is_org_role(id, array['owner']) ) with check ( true );

-- ORG MEMBERS policies
create policy if not exists org_members_select on public.org_members
for select to authenticated using ( public.is_org_role(org_id, array['owner','trainer','learner']) );
create policy if not exists org_members_insert on public.org_members
for insert to authenticated with check ( public.is_org_role(org_id, array['owner']) );
create policy if not exists org_members_update on public.org_members
for update to authenticated using ( public.is_org_role(org_id, array['owner']) ) with check ( true );
create policy if not exists org_members_delete on public.org_members
for delete to authenticated using ( public.is_org_role(org_id, array['owner']) );

-- ORG SEATS policies (owners/trainers view & edit)
create policy if not exists org_seats_select on public.org_seats
for select to authenticated using ( public.is_org_role(org_id, array['owner','trainer']) );
create policy if not exists org_seats_upsert on public.org_seats
for all to authenticated using ( public.is_org_role(org_id, array['owner']) ) with check ( public.is_org_role(org_id, array['owner']) );

-- INVITATIONS policies
create policy if not exists invitations_select on public.invitations
for select to authenticated using ( public.is_org_role(org_id, array['owner','trainer']) );
create policy if not exists invitations_insert on public.invitations
for insert to authenticated with check ( public.is_org_role(org_id, array['owner','trainer']) );
create policy if not exists invitations_update on public.invitations
for update to authenticated using ( public.is_org_role(org_id, array['owner','trainer']) ) with check ( true );

-- ENROLLMENTS: allow trainers/owners of same org to read/write org enrollments; learners can read own rows
create policy if not exists enrollments_select_org on public.enrollments
for select to authenticated using (
  (org_id is not null and public.is_org_role(org_id, array['owner','trainer']))
  or (user_id = auth.uid())
);
create policy if not exists enrollments_update_org on public.enrollments
for update to authenticated using (
  org_id is not null and public.is_org_role(org_id, array['owner','trainer'])
) with check ( true );

-- AUDIT EVENTS: readable to org members, insert by trainers/owners
create policy if not exists audit_events_select on public.audit_events
for select to authenticated using ( public.is_org_role(org_id, array['owner','trainer','learner']) );
create policy if not exists audit_events_insert on public.audit_events
for insert to authenticated with check ( public.is_org_role(org_id, array['owner','trainer']) );

-- Invitation acceptance helper (SECURITY DEFINER so the invited user can join)
create or replace function public.accept_invitation(p_token text)
returns boolean as $$
declare v_inv record; begin
  select * into v_inv from public.invitations where token = p_token and accepted_at is null and expires_at > now();
  if not found then return false; end if;
  insert into public.org_members (org_id, user_id, role) values (v_inv.org_id, auth.uid(), v_inv.role)
    on conflict (org_id, user_id) do update set role = excluded.role;
  update public.invitations set accepted_at = now() where id = v_inv.id;
  insert into public.audit_events(org_id, actor_user_id, action, target, meta)
    values (v_inv.org_id, auth.uid(), 'invite.accept', v_inv.email, jsonb_build_object('token', '***'));
  return true;
end;$$ language plpgsql security definer;

comment on function public.accept_invitation(text) is 'Accept an org invitation for the current authenticated user';
