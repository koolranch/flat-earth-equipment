-- Rollback for 20260420000000_create_push_tokens.sql
-- Drops the push_tokens table and all associated policies + indexes.

DROP POLICY IF EXISTS push_tokens_delete_own ON public.push_tokens;
DROP POLICY IF EXISTS push_tokens_select_own ON public.push_tokens;
DROP INDEX  IF EXISTS idx_push_tokens_user_id;
DROP TABLE  IF EXISTS public.push_tokens;
