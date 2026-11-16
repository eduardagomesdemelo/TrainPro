const DIAS_DA_SEMANA = [
  'domingo',
  'segunda-feira',
  'terça-feira',
  'quarta-feira',
  'quinta-feira',
  'sexta-feira',
  'sábado',
];

// 22.5 -> "22,5"
export function formatarCarga(carga: number): string {
  return String(carga).replace('.', ',');
}

// Converte "2026-11-15" em partes numéricas sem passar por fuso horário,
// para o dia nunca "voltar" por causa da diferença com UTC.
function separarDia(dia: string) {
  const [ano, mes, diaDoMes] = dia.split('-').map(Number);
  return { ano, mes, diaDoMes };
}

const doisDigitos = (n: number) => String(n).padStart(2, '0');

// "2026-11-15" -> "15/11/2026"
export function formatarDia(dia: string): string {
  const { ano, mes, diaDoMes } = separarDia(dia);
  return `${doisDigitos(diaDoMes)}/${doisDigitos(mes)}/${ano}`;
}

// "2026-11-15" -> "domingo"
export function diaDaSemana(dia: string): string {
  const { ano, mes, diaDoMes } = separarDia(dia);
  return DIAS_DA_SEMANA[new Date(ano, mes - 1, diaDoMes).getDay()];
}

// Data de um instante ISO no fuso do aparelho: "2026-11-15T23:10:00Z" -> "15/11/2026"
export function formatarData(instanteIso: string): string {
  const data = new Date(instanteIso);
  return `${doisDigitos(data.getDate())}/${doisDigitos(data.getMonth() + 1)}/${data.getFullYear()}`;
}
