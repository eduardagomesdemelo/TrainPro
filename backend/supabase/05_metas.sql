-- Meta ou objetivo pessoal do usuário (ex.: "Supino com 60 kg").
create table if not exists public.metas (
  id          uuid primary key default gen_random_uuid(),
  usuario_id  uuid not null default auth.uid() references auth.users (id) on delete cascade,
  titulo      text not null check (char_length(btrim(titulo)) between 1 and 100),
  descricao   text check (descricao is null or char_length(descricao) <= 500),
  concluida   boolean not null default false,
  criado_em   timestamptz not null default now()
);

create index if not exists metas_usuario_idx on public.metas (usuario_id, criado_em desc);

alter table public.metas enable row level security;

-- Cada usuário lê e grava apenas as próprias metas.
create policy "metas_proprias" on public.metas
  for all to authenticated
  using ((select auth.uid()) = usuario_id)
  with check ((select auth.uid()) = usuario_id);
