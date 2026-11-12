export type Resultado<T> = { ok: true; dados: T } | { ok: false; mensagem: string };

// Converte um erro do Supabase em um resultado de falha com mensagem amigável,
// sem expor detalhes internos do banco ao usuário.
export function falha(
  erro: { message?: string } | null,
  mensagemPadrao: string,
): { ok: false; mensagem: string } {
  const semConexao = erro?.message?.includes('Network request failed');
  return {
    ok: false,
    mensagem: semConexao
      ? 'Sem conexão com o servidor. Verifique sua internet e tente novamente.'
      : mensagemPadrao,
  };
}
