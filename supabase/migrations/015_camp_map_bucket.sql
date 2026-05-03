-- Camp map storage bucket (public read, authenticated write)
insert into storage.buckets (id, name, public)
values ('camp-map', 'camp-map', true)
on conflict (id) do nothing;

create policy "Public read camp-map"
  on storage.objects for select
  using (bucket_id = 'camp-map');

create policy "Auth insert camp-map"
  on storage.objects for insert
  with check (bucket_id = 'camp-map' and auth.role() = 'authenticated');

create policy "Auth update camp-map"
  on storage.objects for update
  using (bucket_id = 'camp-map' and auth.role() = 'authenticated');

create policy "Auth delete camp-map"
  on storage.objects for delete
  using (bucket_id = 'camp-map' and auth.role() = 'authenticated');
