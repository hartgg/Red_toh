create table if not exists public.featured_careers (
  id uuid primary key default gen_random_uuid(),
  slot integer not null unique check (slot between 1 and 3),
  course_id uuid not null references public.courses(id) on delete cascade,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.featured_careers enable row level security;

create policy "Anyone can read featured careers"
on public.featured_careers
for select
using (true);

create policy "Admins can insert featured careers"
on public.featured_careers
for insert
with check (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

create policy "Admins can update featured careers"
on public.featured_careers
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

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_featured_careers_updated_at on public.featured_careers;

create trigger set_featured_careers_updated_at
before update on public.featured_careers
for each row
execute function public.set_updated_at();
