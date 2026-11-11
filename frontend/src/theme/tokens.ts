export const cores = {
  fundo: '#0F0D11',
  superficie: '#1A171D',
  superficieElevada: '#251F28',
  borda: '#352D39',

  primaria: '#FF8A80',
  primariaPressionada: '#F26B63',
  sobrePrimaria: '#1A0B0A',

  texto: '#F5F1F6',
  textoSecundario: '#B5ABBA',
  textoDesabilitado: '#6E6475',

  sucesso: '#6FD6A0',
  alerta: '#FFC871',
  erro: '#FF6B7A',
} as const;

export const espacamento = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const raio = { sm: 8, md: 12, lg: 20, pilula: 999 } as const;

export const tipografia = {
  titulo: { fontSize: 28, fontWeight: '700' as const, lineHeight: 34 },
  subtitulo: { fontSize: 20, fontWeight: '600' as const, lineHeight: 26 },
  corpo: { fontSize: 16, fontWeight: '400' as const, lineHeight: 22 },
  legenda: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
} as const;

// Alvo de toque mínimo recomendado no Android (48dp).
export const alvoToqueMinimo = 48;
