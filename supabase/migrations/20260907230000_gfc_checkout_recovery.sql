-- Abandoned-checkout recovery for the $49 operator certification bought on
-- getforkliftcertified.com/certification. One row per expired Stripe Checkout
-- Session that triggered a recovery email; stores the Resend id of the
-- scheduled day-later follow-up so a purchase (via the recovery link or a fresh
-- session) can cancel it. FEE-hosted (/safety) purchases never write here.
-- Service-role access only: RLS enabled with no policies.

create table if not exists public.gfc_checkout_recovery (
  id uuid primary key default gen_random_uuid(),
  checkout_session_id text not null unique,
  email text not null,
  first_email_id text,
  followup_email_id text,
  followup_scheduled_for timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.gfc_checkout_recovery enable row level security;

create index if not exists gfc_checkout_recovery_email_idx
  on public.gfc_checkout_recovery (lower(email), created_at desc);

comment on table public.gfc_checkout_recovery is
  'Abandoned-checkout recovery emails for GFC $49 operator sessions; used for per-email dedupe and cancelling the scheduled follow-up on purchase.';
