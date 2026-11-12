import { supabase } from '../../lib/supabase';
import { Resultado, falha } from '../../lib/resultado';
import { RegistroSerie } from './tipos';

export const CARGA_MAX = 1000;
export const REPETICOES_MAX = 999;

// Linha como vem do banco (colunas em snake_case).
type LinhaRegistro = {
  id: string;
  exercicio_id: string;
  numero_serie: number;
  carga: number;
  repeticoes: number;
};

function paraRegistro(linha: LinhaRegistro): RegistroSerie {
  return {
    id: linha.id,
    exercicioId: linha.exercicio_id,
    numeroSerie: linha.numero_serie,
    carga: Number(linha.carga),
    repeticoes: linha.repeticoes,
  };
}

// Converte o texto digitado ("22,5") em número. Aceita vírgula ou ponto, até 2 casas decimais.
export function converterCarga(texto: string): number | null {
  const limpo = texto.trim();
  if (!/^\d+([.,]\d{1,2})?$/.test(limpo)) return null;
  return Number(limpo.replace(',', '.'));
}

export function validarCarga(texto: string): string | null {
  if (!texto.trim()) return 'Informe a carga.';
  const carga = converterCarga(texto);
  if (carga === null) return 'Use apenas números, ex.: 20 ou 22,5.';
  if (carga <= 0 || carga > CARGA_MAX) return `A carga deve ficar entre 0,01 e ${CARGA_MAX} kg.`;
  return null;
}

export function validarRepeticoes(texto: string): string | null {
  if (!texto.trim()) return 'Informe as repetições.';
  if (!/^\d+$/.test(texto.trim())) return 'Use apenas números inteiros.';
  const repeticoes = Number(texto);
  if (repeticoes < 1 || repeticoes > REPETICOES_MAX) {
    return `As repetições devem ficar entre 1 e ${REPETICOES_MAX}.`;
  }
  return null;
}

// O número da série é calculado no banco, que também impede registrar em exercício de outro usuário.
export async function registrarSerie(dados: {
  exercicioId: string;
  carga: number;
  repeticoes: number;
}): Promise<Resultado<RegistroSerie>> {
  const { data, error } = await supabase.rpc('registrar_serie', {
    p_exercicio_id: dados.exercicioId,
    p_carga: dados.carga,
    p_repeticoes: dados.repeticoes,
  });

  if (error) return falha(error, 'Não foi possível registrar a série. Tente novamente.');
  return { ok: true, dados: paraRegistro(data as LinhaRegistro) };
}

export async function listarRegistrosDeHoje(sessaoId: string): Promise<Resultado<RegistroSerie[]>> {
  const { data, error } = await supabase.rpc('registros_de_hoje', { p_divisao_id: sessaoId });

  if (error) return falha(error, 'Não foi possível carregar os registros de hoje.');
  return { ok: true, dados: (data as LinhaRegistro[]).map(paraRegistro) };
}
