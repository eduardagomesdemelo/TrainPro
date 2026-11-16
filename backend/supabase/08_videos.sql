-- CSU008: catálogo de vídeos de demonstração dos exercícios.
-- Os arquivos ficam hospedados externamente; aqui só ficam os endereços.
create table if not exists public.videos_exercicio (
  id            uuid primary key default gen_random_uuid(),
  categoria     text not null check (char_length(categoria) between 1 and 60),
  nome          text not null check (char_length(nome) between 1 and 120),
  video_url     text not null unique check (video_url like 'https://%'),
  miniatura_url text not null check (miniatura_url like 'https://%'),
  criado_em     timestamptz not null default now()
);

create index if not exists videos_exercicio_categoria_idx on public.videos_exercicio (categoria, nome);

-- Conteúdo público para usuários autenticados: somente leitura, sem escrita pelo app.
alter table public.videos_exercicio enable row level security;

drop policy if exists "videos_leitura_autenticados" on public.videos_exercicio;
create policy "videos_leitura_autenticados" on public.videos_exercicio
  for select to authenticated using (true);

-- Lista as categorias com a quantidade de vídeos de cada uma.
create or replace function public.categorias_de_videos()
returns table (categoria text, quantidade bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  select v.categoria, count(*) as quantidade
  from public.videos_exercicio v
  group by v.categoria
  order by v.categoria;
$$;
