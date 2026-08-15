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

alter table public.course_enrollments enable row level security;
alter table public.lesson_progress enable row level security;

create policy "Students can read own enrollments"
on public.course_enrollments
for select
using (auth.uid() = user_id);

create policy "Students can enroll themselves"
on public.course_enrollments
for insert
with check (auth.uid() = user_id);

create policy "Students can read own lesson progress"
on public.lesson_progress
for select
using (auth.uid() = user_id);

create policy "Students can mark own lesson progress"
on public.lesson_progress
for insert
with check (auth.uid() = user_id);

create policy "Students can delete own lesson progress"
on public.lesson_progress
for delete
using (auth.uid() = user_id);

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
