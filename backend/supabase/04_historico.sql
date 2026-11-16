-- Dias em que o usuário treinou, do mais recente ao mais antigo, com o resumo de cada dia.
create or replace function public.historico_por_dia()
returns table (dia date, total_exercicios bigint, total_series bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  select r.dia,
         count(distinct r.exercicio_id) as total_exercicios,
         count(*) as total_series
  from public.registros_exercicio r
  where r.usuario_id = (select auth.uid())
  group by r.dia
  order by r.dia desc;
$$;

-- Séries registradas em um dia, com o nome do exercício, da sessão e do treino.
create or replace function public.historico_do_dia(p_dia date)
returns table (
  id            uuid,
  exercicio_id  uuid,
  exercicio     text,
  sessao        text,
  treino        text,
  numero_serie  smallint,
  carga         numeric,
  repeticoes    smallint
)
language sql
stable
security invoker
set search_path = ''
as $$
  select r.id, r.exercicio_id, e.nome, d.nome, t.nome, r.numero_serie, r.carga, r.repeticoes
  from public.registros_exercicio r
  join public.exercicios e on e.id = r.exercicio_id
  join public.divisoes_treino d on d.id = e.divisao_id
  join public.treinos t on t.id = d.treino_id
  where r.usuario_id = (select auth.uid())
    and r.dia = p_dia
  order by r.criado_em, r.numero_serie;
$$;

revoke execute on function public.historico_por_dia() from public, anon;
revoke execute on function public.historico_do_dia(date) from public, anon;
grant execute on function public.historico_por_dia() to authenticated;
grant execute on function public.historico_do_dia(date) to authenticated;
