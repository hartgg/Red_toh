create table if not exists public.homepage_goal_cards (
  id uuid primary key default gen_random_uuid(),
  goal text not null unique check (
    goal in ('primary', 'secondary', 'income')
  ),
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.homepage_goal_cards enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

drop policy if exists "Anyone can read homepage goal cards"
on public.homepage_goal_cards;
create policy "Anyone can read homepage goal cards"
on public.homepage_goal_cards
for select
using (true);

drop policy if exists "Admins can insert homepage goal cards"
on public.homepage_goal_cards;
create policy "Admins can insert homepage goal cards"
on public.homepage_goal_cards
for insert
with check (public.is_admin());

drop policy if exists "Admins can update homepage goal cards"
on public.homepage_goal_cards;
create policy "Admins can update homepage goal cards"
on public.homepage_goal_cards
for update
using (public.is_admin())
with check (public.is_admin());

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_homepage_goal_cards_updated_at
on public.homepage_goal_cards;

create trigger set_homepage_goal_cards_updated_at
before update on public.homepage_goal_cards
for each row
execute function public.set_updated_at();
