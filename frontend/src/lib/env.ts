// Só variáveis EXPO_PUBLIC_ chegam ao app. Falha cedo se alguma estiver ausente.
function lerVariavel(nome: string, valor: string | undefined): string {
  if (!valor) {
    throw new Error(
      `Variável de ambiente ausente: ${nome}. Defina-a no arquivo .env.`,
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
