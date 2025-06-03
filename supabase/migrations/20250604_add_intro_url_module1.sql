-- add column only if it doesn't exist
do $$ begin
    alter table public.modules add column if not exists intro_url text;
exception when duplicate_column then end $$;

-- update Module 1 (order = 1) of the forklift course
update public.modules
set intro_url = 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/game/intro.mp4'
where course_id = (
        select id from public.courses where slug = 'forklift'
      )
  and "order" = 1; 