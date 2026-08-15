-- Run this in Supabase SQL Editor for the production farmer approval flow.
-- If public.profiles.role has a CHECK constraint or enum, make sure it allows:
-- admin, farmer, farmer_pending, student

-- Recommended RLS policies. Adjust names if your project already has equivalent policies.

alter table public.profiles enable row level security;
alter table public.farmers enable row level security;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role text;
  safe_role text;
begin
  requested_role := new.raw_user_meta_data ->> 'role';
  safe_role := case
    when requested_role in ('student', 'farmer_pending') then requested_role
    else 'student'
  end;

  insert into public.profiles (
    id,
    email,
    full_name,
    role
  )
  values (
    new.id,
    new.email,
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    safe_role
  )
  on conflict (id) do nothing;

  if safe_role = 'farmer_pending' then
    insert into public.farmers (
      user_id,
      full_name,
      phone,
      province,
      farm_area,
      agriculture_type
    )
    values (
      new.id,
      nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
      nullif(trim(new.raw_user_meta_data ->> 'phone'), ''),
      nullif(trim(new.raw_user_meta_data ->> 'province'), ''),
      nullif(trim(new.raw_user_meta_data ->> 'farm_area'), ''),
      nullif(trim(new.raw_user_meta_data ->> 'agriculture_type'), '')
    )
    on conflict (user_id) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles
for select
using (auth.uid() = id);

drop policy if exists "Users can create own profile" on public.profiles;
create policy "Users can create own profile"
on public.profiles
for insert
with check (
  auth.uid() = id
  and role in ('student', 'farmer_pending')
);

drop policy if exists "Admins can read all profiles" on public.profiles;
create policy "Admins can read all profiles"
on public.profiles
for select
using (
  exists (
    select 1
    from public.profiles admin_profile
    where admin_profile.id = auth.uid()
      and admin_profile.role = 'admin'
  )
);

drop policy if exists "Admins can update user roles" on public.profiles;
create policy "Admins can update user roles"
on public.profiles
for update
using (
  exists (
    select 1
    from public.profiles admin_profile
    where admin_profile.id = auth.uid()
      and admin_profile.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.profiles admin_profile
    where admin_profile.id = auth.uid()
      and admin_profile.role = 'admin'
  )
);

create or replace function public.update_own_profile_name(
  p_full_name text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set full_name = nullif(trim(p_full_name), '')
  where id = auth.uid();
end;
$$;

revoke all on function public.update_own_profile_name(text) from public;
grant execute on function public.update_own_profile_name(text) to authenticated;

drop policy if exists "Users can read own farmer profile" on public.farmers;
create policy "Users can read own farmer profile"
on public.farmers
for select
using (auth.uid() = user_id);

drop policy if exists "Users can create own farmer profile" on public.farmers;
create policy "Users can create own farmer profile"
on public.farmers
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own farmer profile" on public.farmers;
create policy "Users can update own farmer profile"
on public.farmers
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Admins can read farmer profiles" on public.farmers;
create policy "Admins can read farmer profiles"
on public.farmers
for select
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);
