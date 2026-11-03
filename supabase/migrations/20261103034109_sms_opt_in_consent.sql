-- SMS opt-in stored with quote, contact, and account-signup submissions.
-- Service role writes these rows. No public policies: anon and authenticated cannot read them.

alter table public.quote_requests
  add column if not exists sms_consent boolean not null default false,
  add column if not exists sms_consent_at timestamptz;

create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  zipcode text,
  reason text,
  message text,
  sms_consent boolean not null default false,
  sms_consent_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.contact_submissions enable row level security;
revoke all on table public.contact_submissions from anon, authenticated;

create table if not exists public.sms_consents (
  id uuid primary key default gen_random_uuid(),
  source text not null check (source in ('quote', 'contact', 'signup')),
  name text,
  email text,
  phone text,
  sms_consent boolean not null,
  sms_consent_at timestamptz,
  user_id uuid,
  created_at timestamptz not null default now()
);

alter table public.sms_consents enable row level security;
revoke all on table public.sms_consents from anon, authenticated;
