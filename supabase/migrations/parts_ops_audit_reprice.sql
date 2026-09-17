-- Allow the inventory watch to log sticker realignments alongside pulls and relists.
alter table public.parts_ops_audit drop constraint if exists parts_ops_audit_action_check;
alter table public.parts_ops_audit
  add constraint parts_ops_audit_action_check check (action in ('pull', 'relist', 'reprice'));

comment on table public.parts_ops_audit is
  'Before/after log of inventory-watch writes (sold-out pulls, relists, reprices). Written by service role only.';
