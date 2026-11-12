import { supabase } from '../../lib/supabase';
import { Resultado, falha } from '../../lib/resultado';
import { Exercicio, Sessao, Treino } from './tipos';
import { TreinoPredefinido } from './treinosPredefinidos';

export const NOME_TREINO_MAX = 100;

// Iguais aos limites da função criar_treino no banco.
export const MAX_SESSOES = 14;
export const MAX_EXERCICIOS_POR_SESSAO = 30;

export function validarNomeTreino(nome: string): string | null {
  const limpo = nome.trim();
  if (!limpo) return 'Informe um nome para o treino.';
  if (limpo.length > NOME_TREINO_MAX) {
    return `O nome deve ter no máximo ${NOME_TREINO_MAX} caracteres.`;
  }
  return null;
}

export type DivisaoParaCriar = { nome: string; exercicios: string[] };

// A função criar_treino grava treino, divisões e exercícios numa única transação no banco.
// O dono do treino é definido no servidor (usuário autenticado), nunca enviado pelo app.
async function criarTreino(
  nome: string,
  tipo: 'predefinido' | 'personalizado',
  divisoes: DivisaoParaCriar[],
): Promise<Resultado<string>> {
  const { data, error } = await supabase.rpc('criar_treino', {
    p_nome: nome,
    p_tipo: tipo,
    p_divisoes: divisoes,
  });

  if (error) return falha(error, 'Não foi possível criar o treino. Tente novamente.');
  return { ok: true, dados: data as string };
}

export function criarTreinoPredefinido(treino: TreinoPredefinido) {
  return criarTreino(treino.nome, 'predefinido', treino.divisoes);
}

export function criarTreinoPersonalizado(nome: string, sessoes: DivisaoParaCriar[]) {
  return criarTreino(nome.trim(), 'personalizado', sessoes);
}

// As consultas abaixo dependem do RLS: só retornam dados do usuário autenticado.
export async function listarTreinos(): Promise<Resultado<Treino[]>> {
  const { data, error } = await supabase
    .from('treinos')
    .select('id, nome, tipo')
    .order('criado_em', { ascending: false });

  if (error) return falha(error, 'Não foi possível carregar seus treinos.');
  return { ok: true, dados: data as Treino[] };
}

export async function listarSessoes(treinoId: string): Promise<Resultado<Sessao[]>> {
  const { data, error } = await supabase
    .from('divisoes_treino')
    .select('id, nome, exercicios(count)')
    .eq('treino_id', treinoId)
    .order('ordem');

  if (error) return falha(error, 'Não foi possível carregar as sessões do treino.');

  const sessoes = data.map((linha) => ({
    id: linha.id,
    nome: linha.nome,
    totalExercicios: linha.exercicios[0]?.count ?? 0,
  }));
  return { ok: true, dados: sessoes };
}

export async function listarExercicios(sessaoId: string): Promise<Resultado<Exercicio[]>> {
  const { data, error } = await supabase
    .from('exercicios')
    .select('id, nome')
    .eq('divisao_id', sessaoId)
    .order('ordem');

  if (error) return falha(error, 'Não foi possível carregar os exercícios.');
  return { ok: true, dados: data };
}

// Divisões, exercícios e registros do treino são apagados em cascata pelo banco.
// O RLS impede apagar treino de outro usuário; nesse caso nenhuma linha é afetada.
export async function excluirTreino(treinoId: string): Promise<Resultado<null>> {
  const { data, error } = await supabase.from('treinos').delete().eq('id', treinoId).select('id');

  if (error || data.length === 0) {
    return falha(error, 'Não foi possível excluir o treino. Tente novamente.');
  }
  return { ok: true, dados: null };
}
