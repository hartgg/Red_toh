-- Run in Supabase SQL Editor. Protects published courses and lessons.
create or replace function public.is_admin()
returns boolean language sql security definer set search_path = public stable as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;
create or replace function public.is_farmer()
returns boolean language sql security definer set search_path = public stable as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'farmer');
$$;
revoke all on function public.is_admin() from public;
revoke all on function public.is_farmer() from public;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_farmer() to authenticated;

alter table public.courses enable row level security;
alter table public.lessons enable row level security;
drop policy if exists "Anyone can read published courses" on public.courses;
create policy "Anyone can read published courses" on public.courses for select using (status = 'published');
drop policy if exists "Farmers can read own courses" on public.courses;
create policy "Farmers can read own courses" on public.courses for select using (user_id = auth.uid() and public.is_farmer());
drop policy if exists "Admins can manage all courses" on public.courses;
create policy "Admins can manage all courses" on public.courses for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Farmers can create own courses" on public.courses;
create policy "Farmers can create own courses" on public.courses for insert with check (user_id = auth.uid() and public.is_farmer());
drop policy if exists "Farmers can update own courses" on public.courses;
create policy "Farmers can update own courses" on public.courses for update using (user_id = auth.uid() and public.is_farmer()) with check (user_id = auth.uid() and public.is_farmer());
drop policy if exists "Farmers can delete own courses" on public.courses;
create policy "Farmers can delete own courses" on public.courses for delete using (user_id = auth.uid() and public.is_farmer());

drop policy if exists "Anyone can read lessons from published courses" on public.lessons;
create policy "Anyone can read lessons from published courses" on public.lessons for select using (exists (select 1 from public.courses where courses.id = lessons.course_id and courses.status = 'published'));
drop policy if exists "Farmers can manage lessons for own courses" on public.lessons;
create policy "Farmers can manage lessons for own courses" on public.lessons for all using (public.is_farmer() and exists (select 1 from public.courses where courses.id = lessons.course_id and courses.user_id = auth.uid())) with check (public.is_farmer() and exists (select 1 from public.courses where courses.id = lessons.course_id and courses.user_id = auth.uid()));
drop policy if exists "Admins can manage all lessons" on public.lessons;
create policy "Admins can manage all lessons" on public.lessons for all using (public.is_admin()) with check (public.is_admin());
