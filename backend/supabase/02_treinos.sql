-- Programa de treino de um usuário. Pode ser escolhido da lista pronta ou montado pelo próprio usuário.
create table if not exists public.treinos (
  id          uuid primary key default gen_random_uuid(),
  usuario_id  uuid not null default auth.uid() references auth.users (id) on delete cascade,
  nome        text not null check (char_length(btrim(nome)) between 1 and 100),
  tipo        text not null check (tipo in ('predefinido', 'personalizado')),
  criado_em   timestamptz not null default now()
);

-- Divisão (sessão) de um treino, como "Treino A - Peito/Tríceps".
create table if not exists public.divisoes_treino (
  id          uuid primary key default gen_random_uuid(),
  treino_id   uuid not null references public.treinos (id) on delete cascade,
  nome        text not null check (char_length(btrim(nome)) between 1 and 100),
  ordem       smallint not null check (ordem > 0)
);

create table if not exists public.exercicios (
  id          uuid primary key default gen_random_uuid(),
  divisao_id  uuid not null references public.divisoes_treino (id) on delete cascade,
  nome        text not null check (char_length(btrim(nome)) between 1 and 150),
  ordem       smallint not null check (ordem > 0)
);

create index if not exists treinos_usuario_idx on public.treinos (usuario_id);
create index if not exists divisoes_treino_treino_idx on public.divisoes_treino (treino_id);
create index if not exists exercicios_divisao_idx on public.exercicios (divisao_id);

alter table public.treinos enable row level security;
alter table public.divisoes_treino enable row level security;
alter table public.exercicios enable row level security;

-- Cada usuário acessa somente os próprios treinos; divisões e exercícios herdam a posse do treino.
create policy "treinos_proprios" on public.treinos
  for all to authenticated
  using ((select auth.uid()) = usuario_id)
  with check ((select auth.uid()) = usuario_id);

create policy "divisoes_do_proprio_treino" on public.divisoes_treino
  for all to authenticated
  using (exists (
    select 1 from public.treinos t
    where t.id = treino_id and t.usuario_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.treinos t
    where t.id = treino_id and t.usuario_id = (select auth.uid())
  ));

create policy "exercicios_do_proprio_treino" on public.exercicios
  for all to authenticated
  using (exists (
    select 1
    from public.divisoes_treino d
    join public.treinos t on t.id = d.treino_id
    where d.id = divisao_id and t.usuario_id = (select auth.uid())
  ))
  with check (exists (
    select 1
    from public.divisoes_treino d
    join public.treinos t on t.id = d.treino_id
    where d.id = divisao_id and t.usuario_id = (select auth.uid())
  ));

-- Cria o treino com suas divisões e exercícios em uma única transação: ou grava tudo, ou nada.
-- p_divisoes: [{"nome": "Treino A", "exercicios": ["Supino Reto", ...]}, ...]
-- Roda com os direitos de quem chama (security invoker), então o RLS continua valendo.
create or replace function public.criar_treino(
  p_nome text,
  p_tipo text,
  p_divisoes jsonb default '[]'::jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  c_max_divisoes   constant int := 14;
  c_max_exercicios constant int := 30;
  v_treino_id      uuid;
  v_divisao        jsonb;
  v_divisao_id     uuid;
  v_exercicios     jsonb;
  v_nome_exercicio text;
  v_ordem_divisao  int := 0;
  v_ordem_exercicio int;
begin
  if jsonb_typeof(p_divisoes) is distinct from 'array'
     or jsonb_array_length(p_divisoes) > c_max_divisoes then
    raise exception 'divisoes_invalidas' using errcode = '22023';
  end if;

  insert into public.treinos (nome, tipo)
  values (btrim(p_nome), p_tipo)
  returning id into v_treino_id;

  for v_divisao in select value from jsonb_array_elements(p_divisoes) loop
    v_ordem_divisao := v_ordem_divisao + 1;
    v_exercicios := coalesce(v_divisao -> 'exercicios', '[]'::jsonb);

    if jsonb_typeof(v_exercicios) is distinct from 'array'
       or jsonb_array_length(v_exercicios) > c_max_exercicios then
      raise exception 'exercicios_invalidos' using errcode = '22023';
    end if;

    insert into public.divisoes_treino (treino_id, nome, ordem)
    values (v_treino_id, btrim(v_divisao ->> 'nome'), v_ordem_divisao)
    returning id into v_divisao_id;

    v_ordem_exercicio := 0;
    for v_nome_exercicio in select jsonb_array_elements_text(v_exercicios) loop
      v_ordem_exercicio := v_ordem_exercicio + 1;
      insert into public.exercicios (divisao_id, nome, ordem)
      values (v_divisao_id, btrim(v_nome_exercicio), v_ordem_exercicio);
    end loop;
  end loop;

  return v_treino_id;
end;
$$;

revoke execute on function public.criar_treino(text, text, jsonb) from public, anon;
grant execute on function public.criar_treino(text, text, jsonb) to authenticated;
