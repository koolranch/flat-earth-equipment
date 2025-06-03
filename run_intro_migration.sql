-- Check if intro_url column exists and add it if not
do $$ begin
    if not exists (
        select 1 from information_schema.columns 
        where table_name = 'modules' and column_name = 'intro_url'
    ) then
        alter table public.modules add column intro_url text;
    end if;
end $$;

-- Update Module 1 (order = 1) of the forklift course
update public.modules
set intro_url = 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/game/intro.mp4'
where course_id = (
        select id from public.courses where slug = 'forklift'
      )
  and "order" = 1; 