alter table public.parts_ops_audit drop constraint if exists parts_ops_audit_action_check;
alter table public.parts_ops_audit
  add constraint parts_ops_audit_action_check
  check (action in ('pull', 'relist', 'reprice', 'publish', 'hero_approve', 'hero_reject'));
