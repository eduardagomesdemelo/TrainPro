export type DivisaoPredefinida = {
  nome: string;
  exercicios: string[];
};

export type TreinoPredefinido = {
  id: string;
  nome: string;
  descricao: string;
  divisoes: DivisaoPredefinida[];
};

export const treinosPredefinidos: TreinoPredefinido[] = [
  {
    id: 'abc',
    nome: 'Treino ABC',
    descricao: 'Divisão em 3 dias, ideal para intermediários.',
    divisoes: [
      {
        nome: 'Treino A - Peito/Tríceps',
        exercicios: [
          'Supino Reto',
          'Supino Inclinado',
          'Crucifixo',
          'Crossover',
          'Tríceps Pulley',
          'Tríceps Testa',
        ],
      },
      {
        nome: 'Treino B - Costas/Bíceps',
        exercicios: [
          'Puxada Frontal',
          'Remada Curvada',
          'Remada Baixa',
          'Pulldown',
          'Rosca Direta',
          'Rosca Martelo',
        ],
      },
      {
        nome: 'Treino C - Pernas/Ombros',
        exercicios: [
          'Agachamento Livre',
          'Leg Press',
          'Cadeira Extensora',
          'Mesa Flexora',
          'Elevação Lateral',
          'Desenvolvimento com Halteres',
        ],
      },
    ],
  },
  {
    id: 'abcd',
    nome: 'Treino ABCD',
    descricao: 'Divisão em 4 dias, com mais volume por grupo muscular.',
    divisoes: [
      {
        nome: 'Treino A - Peito',
        exercicios: [
          'Supino Reto',
          'Supino Inclinado',
          'Supino Declinado',
          'Crucifixo',
          'Crossover',
        ],
      },
      {
        nome: 'Treino B - Costas',
        exercicios: [
          'Puxada Frontal',
          'Remada Curvada',
          'Remada Unilateral',
          'Remada Baixa',
          'Barra Fixa',
        ],
      },
      {
        nome: 'Treino C - Pernas',
        exercicios: [
          'Agachamento Livre',
          'Leg Press',
          'Cadeira Extensora',
          'Mesa Flexora',
          'Panturrilha em Pé',
        ],
      },
      {
        nome: 'Treino D - Ombros/Braços',
        exercicios: [
          'Desenvolvimento Militar',
          'Elevação Lateral',
          'Rosca Direta',
          'Rosca Martelo',
          'Tríceps Pulley',
          'Tríceps Francês',
        ],
      },
    ],
  },
  {
    id: 'abcde',
    nome: 'Treino ABCDE',
    descricao: 'Divisão em 5 dias, um grupo muscular por dia.',
    divisoes: [
      {
        nome: 'Treino A - Peito',
        exercicios: [
          'Supino Reto',
          'Supino Inclinado',
          'Crucifixo',
          'Crossover',
          'Fly na Máquina',
        ],
      },
      {
        nome: 'Treino B - Costas',
        exercicios: [
          'Puxada Frontal',
          'Remada Curvada',
          'Remada Baixa',
          'Pulldown',
          'Barra Fixa',
        ],
      },
      {
        nome: 'Treino C - Ombros',
        exercicios: [
          'Desenvolvimento Militar',
          'Elevação Lateral',
          'Elevação Frontal',
          'Crucifixo Inverso',
          'Encolhimento',
        ],
      },
      {
        nome: 'Treino D - Braços',
        exercicios: [
          'Rosca Direta',
          'Rosca Martelo',
          'Rosca Scott',
          'Tríceps Pulley',
          'Tríceps Testa',
          'Mergulho',
        ],
      },
      {
        nome: 'Treino E - Pernas',
        exercicios: [
          'Agachamento Livre',
          'Leg Press',
          'Cadeira Extensora',
          'Mesa Flexora',
          'Stiff',
          'Panturrilha em Pé',
        ],
      },
    ],
  },
  {
    id: 'push-pull-legs',
    nome: 'Push / Pull / Legs',
    descricao: 'Empurrar, puxar e pernas, em 3 ou 6 dias por semana.',
    divisoes: [
      {
        nome: 'Push - Empurrar',
        exercicios: [
          'Supino Reto',
          'Supino Inclinado',
          'Desenvolvimento Militar',
          'Elevação Lateral',
          'Tríceps Pulley',
        ],
      },
      {
        nome: 'Pull - Puxar',
        exercicios: [
          'Puxada Frontal',
          'Remada Curvada',
          'Remada Baixa',
          'Rosca Direta',
          'Rosca Martelo',
        ],
      },
      {
        nome: 'Legs - Pernas',
        exercicios: [
          'Agachamento Livre',
          'Leg Press',
          'Cadeira Extensora',
          'Mesa Flexora',
          'Panturrilha em Pé',
        ],
      },
    ],
  },
  {
    id: 'upper-lower',
    nome: 'Upper / Lower',
    descricao: 'Superior e inferior, em 4 dias por semana.',
    divisoes: [
      {
        nome: 'Upper - Superior',
        exercicios: [
          'Supino Reto',
          'Puxada Frontal',
          'Desenvolvimento Militar',
          'Rosca Direta',
          'Tríceps Pulley',
        ],
      },
      {
        nome: 'Lower - Inferior',
        exercicios: [
          'Agachamento Livre',
          'Leg Press',
          'Cadeira Extensora',
          'Mesa Flexora',
          'Panturrilha em Pé',
        ],
      },
    ],
  },
  {
    id: 'full-body',
    nome: 'Full Body',
    descricao: 'Corpo inteiro, em 2 a 3 dias por semana.',
    divisoes: [
      {
        nome: 'Full Body',
        exercicios: [
          'Agachamento Livre',
          'Supino Reto',
          'Puxada Frontal',
          'Desenvolvimento Militar',
          'Rosca Direta',
          'Tríceps Pulley',
          'Abdominal Crunch',
        ],
      },
    ],
  },
];
