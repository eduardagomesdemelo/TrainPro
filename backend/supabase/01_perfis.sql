-- Dados do app vinculados a cada conta do Supabase Auth (auth.users).
create table if not exists public.perfis (
  id         uuid primary key references auth.users (id) on delete cascade,
  nome       text not null check (char_length(nome) between 2 and 100),
  criado_em  timestamptz not null default now()
);

comment on table public.perfis is 'Dados públicos do usuário; 1 linha por conta em auth.users.';

-- RLS: cada usuário lê e edita apenas o próprio perfil.
-- Não há policy de insert/delete: o perfil nasce pelo gatilho abaixo e some junto com a conta.
alter table public.perfis enable row level security;

create policy "perfis_select_proprio" on public.perfis
  for select to authenticated
  using ((select auth.uid()) = id);

create policy "perfis_update_proprio" on public.perfis
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Cria o perfil a partir do nome enviado no cadastro (raw_user_meta_data).
-- Usa um nome padrão se vier inválido, para o cadastro nunca falhar por causa disso.
create or replace function public.criar_perfil_novo_usuario()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  nome_informado text := btrim(coalesce(new.raw_user_meta_data ->> 'nome', ''));
begin
  if char_length(nome_informado) < 2 then
    nome_informado := 'Usuário';
  end if;

  insert into public.perfis (id, nome)
  values (new.id, left(nome_informado, 100));
  return new;
end;
$$;

drop trigger if exists ao_criar_usuario on auth.users;
create trigger ao_criar_usuario
  after insert on auth.users
  for each row execute function public.criar_perfil_novo_usuario();
