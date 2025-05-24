-- Allow learners to read modules of courses they're enrolled in
create policy "module_read_enrolled" on public.modules
for select using (
  exists (
    select 1 from public.enrollments e
    where e.user_id = auth.uid() 
    and e.course_id = modules.course_id
  )
); 