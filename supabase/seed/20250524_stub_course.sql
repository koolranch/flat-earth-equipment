-- File: supabase/seed/20250524_stub_course.sql
insert into public.courses (slug, title, description, price_cents, stripe_price)
values (
  'forklift',
  'Online Forklift Operator Certification',
  'Complete OSHA-compliant forklift safety training with interactive demos and assessment.',
  5900,
  'price_fake_123'   -- overwritten later by the Stripe seed script
) on conflict (slug) do nothing; 