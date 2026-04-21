-- Rollback for 20260421000000_create_purchase_requests.sql
-- Drops the purchase_requests table and all associated policies + indexes.

DROP POLICY IF EXISTS purchase_requests_select_own ON public.purchase_requests;
DROP INDEX  IF EXISTS idx_purchase_requests_status;
DROP INDEX  IF EXISTS idx_purchase_requests_employer;
DROP INDEX  IF EXISTS idx_purchase_requests_employee;
DROP TABLE  IF EXISTS public.purchase_requests;
