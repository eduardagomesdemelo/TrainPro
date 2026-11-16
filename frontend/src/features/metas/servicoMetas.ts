import { supabase } from '../../lib/supabase';
import { Resultado, falha } from '../../lib/resultado';

export const TITULO_META_MAX = 100;
export const DESCRICAO_META_MAX = 500;

export type Meta = {
  id: string;
  titulo: string;
  descricao: string | null;
  concluida: boolean;
  criadoEm: string; // data e hora em formato ISO
};

type LinhaMeta = {
  id: string;
  titulo: string;
  descricao: string | null;
  concluida: boolean;
  criado_em: string;
};

function paraMeta(linha: LinhaMeta): Meta {
  return {
    id: linha.id,
    titulo: linha.titulo,
    descricao: linha.descricao,
    concluida: linha.concluida,
    criadoEm: linha.criado_em,
  };
}

export function validarTituloMeta(titulo: string): string | null {
  const limpo = titulo.trim();
  if (!limpo) return 'Informe o título da meta.';
  if (limpo.length > TITULO_META_MAX) {
    return `O título deve ter no máximo ${TITULO_META_MAX} caracteres.`;
  }
  return null;
}

export function validarDescricaoMeta(descricao: string): string | null {
  if (descricao.length > DESCRICAO_META_MAX) {
    return `A descrição deve ter no máximo ${DESCRICAO_META_MAX} caracteres.`;
  }
  return null;
}

// O dono da meta é definido no banco (usuário autenticado); o app não envia o usuário.
export async function cadastrarMeta(dados: {
  titulo: string;
  descricao: string;
}): Promise<Resultado<Meta>> {
  const descricao = dados.descricao.trim();

  const { data, error } = await supabase
    .from('metas')
    .insert({ titulo: dados.titulo.trim(), descricao: descricao || null })
    .select('id, titulo, descricao, concluida, criado_em')
    .single();

  if (error) return falha(error, 'Não foi possível cadastrar a meta. Tente novamente.');
  return { ok: true, dados: paraMeta(data) };
}

export async function listarMetas(): Promise<Resultado<Meta[]>> {
  const { data, error } = await supabase
    .from('metas')
    .select('id, titulo, descricao, concluida, criado_em')
    .order('criado_em', { ascending: false });

  if (error) return falha(error, 'Não foi possível carregar suas metas.');
  return { ok: true, dados: data.map(paraMeta) };
}

// Marca ou desmarca a meta como concluída. O RLS impede alterar meta de outro usuário;
// nesse caso nenhuma linha é afetada.
export async function alterarConclusao(
  metaId: string,
  concluida: boolean,
): Promise<Resultado<null>> {
  const { data, error } = await supabase
    .from('metas')
    .update({ concluida })
    .eq('id', metaId)
    .select('id');

  if (error || data.length === 0) {
    return falha(error, 'Não foi possível atualizar a meta. Tente novamente.');
  }
  return { ok: true, dados: null };
}

export async function excluirMeta(metaId: string): Promise<Resultado<null>> {
  const { data, error } = await supabase.from('metas').delete().eq('id', metaId).select('id');

  if (error || data.length === 0) {
    return falha(error, 'Não foi possível excluir a meta. Tente novamente.');
  }
  return { ok: true, dados: null };
}
