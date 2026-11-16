-- O Storage precisa de permissão de leitura para conseguir apagar arquivos.
drop policy if exists "admin lê imagens" on storage.objects;
create policy "admin lê imagens" on storage.objects for select to authenticated
  using (bucket_id = 'product-images' and public.is_admin());
