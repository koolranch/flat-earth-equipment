-- Private review tray for vendor product heroes. Raw bytes never land on
-- parts.image_url. Approve copies a cleaned file to the public part-heroes bucket.

create table if not exists public.part_image_reviews (
  id              bigint generated always as identity primary key,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  sku             text not null unique,
  part_id         uuid not null,
  slug            text not null,
  status          text not null check (status in ('pending_raw', 'cleaned', 'approved', 'rejected')),
  raw_path        text,
  cleaned_path    text,
  public_url      text,
  filename        text,
  identity_ok     boolean not null default false,
  mag_price       numeric,
  proposed_sell   numeric,
  qty_on_hand     integer,
  note            text
);

create index if not exists part_image_reviews_status_idx on public.part_image_reviews (status);
create index if not exists part_image_reviews_updated_at_idx on public.part_image_reviews (updated_at desc);

alter table public.part_image_reviews enable row level security;

comment on table public.part_image_reviews is
  'Vendor-hero review tray. Service role only. Approve is what sets parts.image_url.';

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'part-hero-pending',
    'part-hero-pending',
    false,
    10485760,
    array['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'part-heroes',
    'part-heroes',
    true,
    10485760,
    array['image/jpeg', 'image/png', 'image/webp']
  )
on conflict (id) do nothing;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Public read part-heroes'
  ) then
    create policy "Public read part-heroes"
      on storage.objects for select
      to public
      using (bucket_id = 'part-heroes');
  end if;
end $$;
