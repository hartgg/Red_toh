-- Run after content-rls.sql. Protects the public article-images bucket.
do $$ begin
  if not exists (select 1 from storage.buckets where id = 'article-images') then
    raise exception 'Storage bucket article-images does not exist';
  end if;
end; $$;

update storage.buckets set public = true, file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']::text[]
where id = 'article-images';

-- Remove any older broad policy for this bucket in Supabase Dashboard first.
-- RLS policies are permissive: a broad legacy policy overrides narrow policies below.
drop policy if exists "Public can view article images" on storage.objects;
create policy "Public can view article images" on storage.objects for select to public using (bucket_id = 'article-images');
drop policy if exists "Admins can upload article images" on storage.objects;
create policy "Admins can upload article images" on storage.objects for insert to authenticated with check (bucket_id = 'article-images' and public.is_admin());
drop policy if exists "Admins can update article images" on storage.objects;
create policy "Admins can update article images" on storage.objects for update to authenticated using (bucket_id = 'article-images' and public.is_admin()) with check (bucket_id = 'article-images' and public.is_admin());
drop policy if exists "Farmers can upload own course images" on storage.objects;
create policy "Farmers can upload own course images" on storage.objects for insert to authenticated with check (bucket_id = 'article-images' and public.is_farmer() and (storage.foldername(name))[1] = 'articles' and (storage.foldername(name))[2] = auth.uid()::text);
