-- Série realizada de um exercício: carga, repetições e o número da série no dia.
create table if not exists public.registros_exercicio (
  id            uuid primary key default gen_random_uuid(),
  exercicio_id  uuid not null references public.exercicios (id) on delete cascade,
  usuario_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  carga         numeric(6, 2) not null check (carga > 0 and carga <= 1000),
  repeticoes    smallint not null check (repeticoes between 1 and 999),
  numero_serie  smallint not null check (numero_serie > 0),
  -- Dia do treino no fuso do Brasil, para "hoje" não virar o dia no meio da noite (UTC).
  dia           date not null default (timezone('America/Sao_Paulo', now()))::date,
  criado_em     timestamptz not null default now(),
  unique (usuario_id, exercicio_id, dia, numero_serie)
);

create index if not exists registros_exercicio_dia_idx
  on public.registros_exercicio (exercicio_id, dia);

alter table public.registros_exercicio enable row level security;

-- O usuário só lê e grava os próprios registros, e apenas em exercícios de treinos que são seus.
create policy "registros_proprios" on public.registros_exercicio
  for all to authenticated
  using ((select auth.uid()) = usuario_id)
  with check (
    (select auth.uid()) = usuario_id
    and exists (
      select 1
      from public.exercicios e
      join public.divisoes_treino d on d.id = e.divisao_id
      join public.treinos t on t.id = d.treino_id
      where e.id = registros_exercicio.exercicio_id
        and t.usuario_id = (select auth.uid())
    )
  );

-- Registra a próxima série do dia para o exercício. O número da série é calculado aqui, no banco,
-- para não depender do app nem se repetir quando há dois registros quase ao mesmo tempo
-- (a restrição unique rejeita a duplicata).
create or replace function public.registrar_serie(
  p_exercicio_id uuid,
  p_carga numeric,
  p_repeticoes integer
)
returns public.registros_exercicio
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_dia      date := (timezone('America/Sao_Paulo', now()))::date;
  v_registro public.registros_exercicio;
begin
  insert into public.registros_exercicio (exercicio_id, carga, repeticoes, numero_serie, dia)
  values (
    p_exercicio_id,
    p_carga,
    p_repeticoes,
    (
      select coalesce(max(r.numero_serie), 0) + 1
      from public.registros_exercicio r
      where r.exercicio_id = p_exercicio_id
        and r.usuario_id = (select auth.uid())
        and r.dia = v_dia
    ),
    v_dia
  )
  returning * into v_registro;

  return v_registro;
end;
$$;

-- Séries registradas hoje nos exercícios de uma sessão (divisão do treino).
create or replace function public.registros_de_hoje(p_divisao_id uuid)
returns setof public.registros_exercicio
language sql
stable
security invoker
set search_path = ''
as $$
  select r.*
  from public.registros_exercicio r
  join public.exercicios e on e.id = r.exercicio_id
  where e.divisao_id = p_divisao_id
    and r.usuario_id = (select auth.uid())
    and r.dia = (timezone('America/Sao_Paulo', now()))::date
  order by r.exercicio_id, r.numero_serie;
$$;

revoke execute on function public.registrar_serie(uuid, numeric, integer) from public, anon;
revoke execute on function public.registros_de_hoje(uuid) from public, anon;
grant execute on function public.registrar_serie(uuid, numeric, integer) to authenticated;
grant execute on function public.registros_de_hoje(uuid) to authenticated;
