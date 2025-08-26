-- 03_alter_certificates_add_pdf_url.sql
alter table public.certificates
  add column if not exists pdf_url text;

comment on column public.certificates.pdf_url is 'Public URL or storage path for the generated certificate PDF.';
