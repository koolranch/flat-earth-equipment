-- Make account deletion cleanup preserve required business/audit records.
-- The account-delete edge function nulls these references before deleting auth.users.

begin;

-- Ask-employer requests can be paid/resolved and linked to orders/invites, so they
-- must survive user deletion after employee PII is cleared.
alter table public.purchase_requests
  alter column employee_user_id drop not null;

alter table public.purchase_requests
  drop constraint if exists purchase_requests_employee_user_id_fkey;

alter table public.purchase_requests
  add constraint purchase_requests_employee_user_id_fkey
  foreign key (employee_user_id) references auth.users(id) on delete set null;

-- Practical eval records may back certificate/audit evidence. Completed records are
-- anonymized instead of cascaded; incomplete request/attempt rows are deleted.
alter table public.practical_eval_requests
  alter column trainee_user_id drop not null;

alter table public.practical_attempts
  alter column trainee_user_id drop not null;

alter table public.practical_attempts
  drop constraint if exists practical_attempts_trainee_user_id_fkey;

alter table public.practical_attempts
  add constraint practical_attempts_trainee_user_id_fkey
  foreign key (trainee_user_id) references auth.users(id) on delete set null;

alter table public.practical_attempts
  drop constraint if exists practical_attempts_trainer_user_id_fkey;

alter table public.practical_attempts
  add constraint practical_attempts_trainer_user_id_fkey
  foreign key (trainer_user_id) references auth.users(id) on delete set null;

-- Preserve seat/order/org history when a trainer/admin deletes their account.
alter table public.seat_claims
  alter column user_id drop not null;

alter table public.seat_claims
  drop constraint if exists seat_claims_user_id_fkey;

alter table public.seat_claims
  add constraint seat_claims_user_id_fkey
  foreign key (user_id) references auth.users(id) on delete set null;

alter table public.seat_invites
  alter column created_by drop not null;

alter table public.seat_invites
  drop constraint if exists seat_invites_created_by_fkey;

alter table public.seat_invites
  add constraint seat_invites_created_by_fkey
  foreign key (created_by) references auth.users(id) on delete set null;

alter table public.orgs
  alter column created_by drop not null;

alter table public.orgs
  drop constraint if exists orgs_created_by_fkey;

alter table public.orgs
  add constraint orgs_created_by_fkey
  foreign key (created_by) references auth.users(id) on delete set null;

alter table public.invitations
  alter column invited_by drop not null;

alter table public.invitations
  drop constraint if exists invitations_invited_by_fkey;

alter table public.invitations
  add constraint invitations_invited_by_fkey
  foreign key (invited_by) references auth.users(id) on delete set null;

commit;
