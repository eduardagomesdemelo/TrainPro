import { supabase } from '../../lib/supabase';
import { Resultado, falha } from '../../lib/resultado';

export type DiaDeTreino = {
  dia: string; // "AAAA-MM-DD"
  totalExercicios: number;
  totalSeries: number;
};

export type SerieDoHistorico = {
  id: string;
  numeroSerie: number;
  carga: number;
  repeticoes: number;
};

// Séries de um exercício no dia, com o treino e a sessão a que ele pertence.
export type ExercicioDoDia = {
  exercicioId: string;
  exercicio: string;
  sessao: string;
  treino: string;
  series: SerieDoHistorico[];
};

export async function listarDiasDeTreino(): Promise<Resultado<DiaDeTreino[]>> {
  const { data, error } = await supabase.rpc('historico_por_dia');

  if (error) return falha(error, 'Não foi possível carregar o histórico.');

  const dias = (data as { dia: string; total_exercicios: number; total_series: number }[]).map(
    (linha) => ({
      dia: linha.dia,
      totalExercicios: Number(linha.total_exercicios),
      totalSeries: Number(linha.total_series),
    }),
  );
  return { ok: true, dados: dias };
}

type LinhaDoDia = {
  id: string;
  exercicio_id: string;
  exercicio: string;
  sessao: string;
  treino: string;
  numero_serie: number;
  carga: number;
  repeticoes: number;
};

export async function detalharDia(dia: string): Promise<Resultado<ExercicioDoDia[]>> {
  const { data, error } = await supabase.rpc('historico_do_dia', { p_dia: dia });

  if (error) return falha(error, 'Não foi possível carregar os detalhes do treino.');

  // As linhas chegam na ordem em que foram registradas; agrupa por exercício mantendo essa ordem.
  const grupos = new Map<string, ExercicioDoDia>();
  for (const linha of data as LinhaDoDia[]) {
    if (!grupos.has(linha.exercicio_id)) {
      grupos.set(linha.exercicio_id, {
        exercicioId: linha.exercicio_id,
        exercicio: linha.exercicio,
        sessao: linha.sessao,
        treino: linha.treino,
        series: [],
      });
    }
    grupos.get(linha.exercicio_id)!.series.push({
      id: linha.id,
      numeroSerie: linha.numero_serie,
      carga: Number(linha.carga),
      repeticoes: linha.repeticoes,
    });
  }
  return { ok: true, dados: Array.from(grupos.values()) };
}
