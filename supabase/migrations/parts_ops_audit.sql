-- Audit trail for catalog write operations performed by the inventory watch
-- (CLI and the /parts-watch dashboard). Service-role only: RLS is enabled with no
-- policies, so the anon/authenticated keys can neither read nor write it.

create table if not exists public.parts_ops_audit (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  source      text not null check (source in ('cli', 'dashboard')),
  action      text not null check (action in ('pull', 'relist')),
  sku         text not null,
  part_id     uuid not null,
  before      jsonb not null default '{}'::jsonb,
  after       jsonb not null default '{}'::jsonb,
  stripe      jsonb,
  note        text
);

create index if not exists parts_ops_audit_created_at_idx on public.parts_ops_audit (created_at desc);
create index if not exists parts_ops_audit_sku_idx on public.parts_ops_audit (sku);

alter table public.parts_ops_audit enable row level security;

comment on table public.parts_ops_audit is
  'Before/after log of inventory-watch writes (sold-out pulls, relists). Written by service role only.';
