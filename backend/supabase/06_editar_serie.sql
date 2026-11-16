-- Corrige a carga e as repetições de uma série já registrada.
-- Só esses dois campos podem ser alterados: exercício, número da série e dia permanecem.
-- Roda com os direitos de quem chama (security invoker), então o RLS garante que a série é do usuário.
create or replace function public.editar_serie(
  p_id uuid,
  p_carga numeric,
  p_repeticoes integer
)
returns public.registros_exercicio
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_registro public.registros_exercicio;
begin
  update public.registros_exercicio
  set carga = p_carga,
      repeticoes = p_repeticoes
  where id = p_id
    and usuario_id = (select auth.uid())
  returning * into v_registro;

  if not found then
    raise exception 'serie_nao_encontrada' using errcode = 'P0002';
  end if;

  return v_registro;
end;
$$;

revoke execute on function public.editar_serie(uuid, numeric, integer) from public, anon;
grant execute on function public.editar_serie(uuid, numeric, integer) to authenticated;
