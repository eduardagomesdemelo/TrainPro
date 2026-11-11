/**
 * Variáveis de ambiente do app.
 * O Expo só expõe ao código as variáveis que começam com EXPO_PUBLIC_,
 * por isso aqui só entram valores que podem ser públicos (URL e chave publicável).
 * Falha cedo com uma mensagem clara se algo estiver faltando.
 */
function lerVariavel(nome: string, valor: string | undefined): string {
  if (!valor) {
    throw new Error(
      `Variável de ambiente ausente: ${nome}. Crie o arquivo .env com base no .env.example.`,
    );
  }
  return valor;
}

export const env = {
  supabaseUrl: lerVariavel('EXPO_PUBLIC_SUPABASE_URL', process.env.EXPO_PUBLIC_SUPABASE_URL),
  supabaseChavePublicavel: lerVariavel(
    'EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
    process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  ),
} as const;
