-- Migration: create public.purchase_requests
-- Stores "ask my employer to pay" requests from mobile-app employees.
-- All writes go through the service role. Employees may read their own rows via RLS.
-- Rollback: run 20260421000000_create_purchase_requests.rollback.sql

CREATE TABLE IF NOT EXISTS public.purchase_requests (
  id                    uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_user_id      uuid        NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  employee_email        text        NOT NULL,
  employer_name         text        NOT NULL,
  employer_email        text        NOT NULL,
  message               text,
  seats_requested       int         NOT NULL DEFAULT 1
                                    CHECK (seats_requested BETWEEN 1 AND 100),
  status                text        NOT NULL DEFAULT 'pending'
                                    CHECK (status IN ('pending', 'paid', 'declined', 'expired')),
  created_at            timestamptz NOT NULL DEFAULT now(),
  resolved_at           timestamptz,
  related_order_id      uuid        REFERENCES public.orders,
  related_seat_invite_id uuid       REFERENCES public.seat_invites
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_purchase_requests_employee
  ON public.purchase_requests (employee_user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_purchase_requests_employer
  ON public.purchase_requests (employer_email, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_purchase_requests_status
  ON public.purchase_requests (status);

-- RLS
ALTER TABLE public.purchase_requests ENABLE ROW LEVEL SECURITY;

-- Employees may read their own requests
CREATE POLICY purchase_requests_select_own ON public.purchase_requests
  FOR SELECT
  TO authenticated
  USING (employee_user_id = auth.uid());

-- No INSERT / UPDATE / DELETE policies for authed or anon roles.
-- All writes go through the service role via /api/training/exam/purchase-request.

COMMENT ON TABLE  public.purchase_requests                        IS '"Ask my employer to pay" requests from mobile-app employees.';
COMMENT ON COLUMN public.purchase_requests.status                 IS 'pending | paid | declined | expired';
COMMENT ON COLUMN public.purchase_requests.employer_email         IS 'Lowercased at write time.';
COMMENT ON COLUMN public.purchase_requests.related_order_id       IS 'Set by Stripe webhook (Prompt D) when employer completes checkout.';
COMMENT ON COLUMN public.purchase_requests.related_seat_invite_id IS 'Set when a seat invite is generated for the employee.';
