-- Create function to get enrollments due for renewal in ~90 days
create or replace function get_renewals_due()
returns table (enrollment_id uuid, email text, expires_at timestamptz)
language sql stable as $$
  select e.id, u.email, e.expires_at
  from public.enrollments e
  join auth.users u on u.id = e.user_id
  where e.passed
    and e.expires_at between now() + interval '89 days'
                         and now() + interval '91 days';
$$; 