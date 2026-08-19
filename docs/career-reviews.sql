create table if not exists public.career_reviews (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  youtube_url text not null,
  income_text text not null,
  career_type text not null check (career_type in ('primary', 'secondary')),
  course_id uuid not null references public.courses(id) on delete cascade,
  status text not null default 'published' check (status in ('published', 'draft')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.career_reviews enable row level security;

create index if not exists career_reviews_career_type_idx
on public.career_reviews (career_type);

create index if not exists career_reviews_status_idx
on public.career_reviews (status);

create index if not exists career_reviews_course_id_idx
on public.career_reviews (course_id);

create policy "Anyone can read published career reviews"
on public.career_reviews
for select
using (status = 'published');

create policy "Admins can read all career reviews"
on public.career_reviews
for select
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

create policy "Admins can insert career reviews"
on public.career_reviews
for insert
with check (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

create policy "Admins can update career reviews"
on public.career_reviews
for update
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

create policy "Admins can delete career reviews"
on public.career_reviews
for delete
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_career_reviews_updated_at
on public.career_reviews;

create trigger set_career_reviews_updated_at
before update on public.career_reviews
for each row
execute function public.set_updated_at();
