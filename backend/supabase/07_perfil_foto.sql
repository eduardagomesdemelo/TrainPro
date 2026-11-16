-- Caminho da foto de perfil no Storage, no formato "<id do usuário>/avatar.jpg".
alter table public.perfis add column if not exists foto_path text;

-- Garante que o perfil só aponte para arquivos da própria pasta.
alter table public.perfis drop constraint if exists perfis_foto_do_dono;
alter table public.perfis
  add constraint perfis_foto_do_dono
  check (foto_path is null or foto_path like id::text || '/%');

-- Bucket privado para as fotos: até 2 MB, somente imagens.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatares', 'avatares', false, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- Cada usuário acessa apenas arquivos dentro da pasta com o próprio id.
create policy "avatares_select_proprio" on storage.objects
  for select to authenticated
  using (bucket_id = 'avatares' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "avatares_insert_proprio" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatares' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "avatares_update_proprio" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatares' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'avatares' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "avatares_delete_proprio" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatares' and (storage.foldername(name))[1] = (select auth.uid())::text);
