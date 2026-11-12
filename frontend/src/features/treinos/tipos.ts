export type TipoTreino = 'predefinido' | 'personalizado';

export type Treino = {
  id: string;
  nome: string;
  tipo: TipoTreino;
};

// Sessão = divisão do treino (ex.: "Treino A - Peito/Tríceps").
export type Sessao = {
  id: string;
  nome: string;
  totalExercicios: number;
};

export type Exercicio = {
  id: string;
  nome: string;
};

export type RegistroSerie = {
  id: string;
  exercicioId: string;
  numeroSerie: number;
  carga: number;
  repeticoes: number;
};
