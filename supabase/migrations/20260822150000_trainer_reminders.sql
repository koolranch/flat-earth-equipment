-- Reminder emails sent by trainers to their operators from the trainer
-- dashboard. Used for rate limiting (one reminder per enrollment per day)
-- and auditing. Service-role access only: RLS enabled with no policies.

create table if not exists public.trainer_reminders (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.enrollments(id) on delete cascade,
  sent_by uuid not null references auth.users(id) on delete cascade,
  reminder_type text not null,
  sent_at timestamptz not null default now()
);

alter table public.trainer_reminders enable row level security;

create index if not exists trainer_reminders_enrollment_sent_idx
  on public.trainer_reminders (enrollment_id, sent_at desc);

comment on table public.trainer_reminders is
  'Training reminder emails sent by trainers from the dashboard; used for per-day rate limiting.';
