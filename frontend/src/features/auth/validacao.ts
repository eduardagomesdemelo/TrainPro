
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const SENHA_MIN = 8;
// O bcrypt, usado pelo Supabase, ignora o que passar de 72 bytes.
export const SENHA_MAX = 72;

export function normalizarEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function validarNome(nome: string): string | null {
  const limpo = nome.trim();
  if (!limpo) return 'Informe seu nome.';
  if (limpo.length < 2) return 'O nome deve ter pelo menos 2 caracteres.';
  if (limpo.length > 100) return 'O nome deve ter no máximo 100 caracteres.';
  return null;
}

export function validarEmail(email: string): string | null {
  const limpo = normalizarEmail(email);
  if (!limpo) return 'Informe seu e-mail.';
  if (limpo.length > 150 || !REGEX_EMAIL.test(limpo)) return 'Digite um e-mail válido.';
  return null;
}

export function validarSenha(senha: string): string | null {
  if (!senha) return 'Crie uma senha.';
  if (senha.length < SENHA_MIN) return `A senha deve ter pelo menos ${SENHA_MIN} caracteres.`;
  if (senha.length > SENHA_MAX) return `A senha deve ter no máximo ${SENHA_MAX} caracteres.`;
  if (!/[A-Za-z]/.test(senha) || !/\d/.test(senha)) {
    return 'A senha deve conter letras e números.';
  }
  return null;
}

export function validarConfirmacaoSenha(senha: string, confirmacao: string): string | null {
  if (!confirmacao) return 'Repita a senha.';
  if (senha !== confirmacao) return 'As senhas não coincidem.';
  return null;
}
