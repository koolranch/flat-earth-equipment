-- One-time "invite one operator" nudge for GFC employer trials that still
-- have an empty roster 2–10 days after signup. Service-role only.
-- FEE /safety and GFC $49 operator purchases never write here.

create table if not exists public.gfc_trial_invite_nudges (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete cascade,
  email text not null,
  resend_id text,
  sent_at timestamptz not null default now()
);

alter table public.gfc_trial_invite_nudges enable row level security;

create index if not exists gfc_trial_invite_nudges_sent_idx
  on public.gfc_trial_invite_nudges (sent_at desc);

comment on table public.gfc_trial_invite_nudges is
  'Dedupes the GFC employer-trial invite nudge; one row per order after a successful send.';
