-- Run this file in Supabase SQL Editor before enabling student enrollment.
-- If public.profiles.role has a CHECK constraint or enum, make sure it allows:
-- admin, farmer, student

create table if not exists public.course_enrollments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (course_id, user_id)
);

create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique (lesson_id, user_id)
);

create or replace function public.is_student()
returns boolean language sql security definer set search_path = public stable as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'student');
$$;
revoke all on function public.is_student() from public;
grant execute on function public.is_student() to authenticated;

create or replace function public.validate_lesson_progress_course()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.lessons where id = new.lesson_id and course_id = new.course_id) then
    raise exception 'lesson_id must belong to course_id';
  end if;
  return new;
end;
$$;
revoke all on function public.validate_lesson_progress_course() from public;
drop trigger if exists validate_lesson_progress_course on public.lesson_progress;
create trigger validate_lesson_progress_course before insert or update on public.lesson_progress for each row execute function public.validate_lesson_progress_course();

alter table public.course_enrollments enable row level security;
alter table public.lesson_progress enable row level security;

drop policy if exists "Students can read own enrollments" on public.course_enrollments;
create policy "Students can read own enrollments"
on public.course_enrollments
for select
using (auth.uid() = user_id and public.is_student());

drop policy if exists "Students can enroll themselves" on public.course_enrollments;
create policy "Students can enroll themselves"
on public.course_enrollments
for insert
with check (auth.uid() = user_id and public.is_student() and exists (select 1 from public.courses where courses.id = course_enrollments.course_id and courses.status = 'published'));

drop policy if exists "Students can read own lesson progress" on public.lesson_progress;
create policy "Students can read own lesson progress"
on public.lesson_progress
for select
using (auth.uid() = user_id and public.is_student());

drop policy if exists "Students can mark own lesson progress" on public.lesson_progress;
create policy "Students can mark own lesson progress"
on public.lesson_progress
for insert
with check (auth.uid() = user_id and public.is_student() and exists (select 1 from public.course_enrollments where course_enrollments.course_id = lesson_progress.course_id and course_enrollments.user_id = auth.uid()));

drop policy if exists "Students can delete own lesson progress" on public.lesson_progress;
create policy "Students can delete own lesson progress"
on public.lesson_progress
for delete
using (auth.uid() = user_id and public.is_student());

create policy "Admins can read all enrollments"
on public.course_enrollments
for select
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

create policy "Admins can read all lesson progress"
on public.lesson_progress
for select
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

create policy "Farmers can read enrollments for own courses"
on public.course_enrollments
for select
using (
  exists (
    select 1
    from public.courses
    where courses.id = course_enrollments.course_id
      and courses.user_id = auth.uid()
  )
);

create policy "Farmers can read lesson progress for own courses"
on public.lesson_progress
for select
using (
  exists (
    select 1
    from public.courses
    where courses.id = lesson_progress.course_id
      and courses.user_id = auth.uid()
  )
);
