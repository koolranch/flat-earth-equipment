-- Allow the inventory watch to log quote-stub publishes alongside pulls, relists, reprices.
alter table public.parts_ops_audit drop constraint if exists parts_ops_audit_action_check;
alter table public.parts_ops_audit
  add constraint parts_ops_audit_action_check check (action in ('pull', 'relist', 'reprice', 'publish'));

comment on table public.parts_ops_audit is
  'Before/after log of inventory-watch writes (pulls, relists, reprices, publishes). Written by service role only.';
