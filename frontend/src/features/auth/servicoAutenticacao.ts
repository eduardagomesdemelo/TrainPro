import * as Linking from 'expo-linking';

import { supabase } from '../../lib/supabase';
import { normalizarEmail } from './validacao';

export type ResultadoCadastro =
  | { status: 'confirmacao_enviada' }
  | { status: 'conta_existente' }
  | { status: 'erro'; mensagem: string };

export type ResultadoReenvio = { ok: true } | { ok: false; mensagem: string };

// Link aberto ao confirmar o e-mail: leva o usuário ao login. Precisa constar nas Redirect URLs do Supabase.
function linkDeRetorno(): string {
  return Linking.createURL('entrar', { queryParams: { confirmado: '1' } });
}

function traduzirErro(erro: { code?: string; name?: string; status?: number }): string {
  if (erro.name === 'AuthRetryableFetchError' || erro.status === 0) {
    return 'Sem conexão com o servidor. Verifique sua internet e tente novamente.';
  }
  switch (erro.code) {
    case 'weak_password':
      return 'Senha muito fraca. Use pelo menos 8 caracteres, com letras e números.';
    case 'email_address_invalid':
    case 'validation_failed':
      return 'Digite um e-mail válido.';
    case 'over_email_send_rate_limit':
    case 'over_request_rate_limit':
      return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.';
    case 'signup_disabled':
      return 'Os cadastros estão temporariamente indisponíveis.';
    default:
      return 'Não foi possível concluir o cadastro. Tente novamente.';
  }
}

export async function cadastrarUsuario(dados: {
  nome: string;
  email: string;
  senha: string;
}): Promise<ResultadoCadastro> {
  const { data, error } = await supabase.auth.signUp({
    email: normalizarEmail(dados.email),
    password: dados.senha,
    options: {
      emailRedirectTo: linkDeRetorno(),
      data: { nome: dados.nome.trim() },
    },
  });

  if (error) {
    if (error.code === 'user_already_exists') return { status: 'conta_existente' };
    return { status: 'erro', mensagem: traduzirErro(error) };
  }

  // Para não revelar e-mails cadastrados, o Supabase devolve um usuário sem identidades
  // quando o e-mail já existe.
  if (data.user && data.user.identities?.length === 0) {
    return { status: 'conta_existente' };
  }

  return { status: 'confirmacao_enviada' };
}

export async function reenviarConfirmacao(email: string): Promise<ResultadoReenvio> {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: normalizarEmail(email),
    options: { emailRedirectTo: linkDeRetorno() },
  });

  if (error) {
    return {
      ok: false,
      mensagem:
        error.code === 'over_email_send_rate_limit'
          ? 'Aguarde um pouco antes de pedir um novo e-mail.'
          : 'Não foi possível reenviar o e-mail. Tente novamente.',
    };
  }
  return { ok: true };
}

export type ResultadoLogin = { ok: true } | { ok: false; mensagem: string };

// E-mail inexistente e senha errada recebem a mesma mensagem, para não expor quais e-mails têm conta.
function traduzirErroLogin(erro: { code?: string; name?: string; status?: number }): string {
  if (erro.name === 'AuthRetryableFetchError' || erro.status === 0) {
    return 'Sem conexão com o servidor. Verifique sua internet e tente novamente.';
  }
  switch (erro.code) {
    case 'invalid_credentials':
      return 'E-mail ou senha incorretos. Se ainda não tem conta, cadastre-se.';
    case 'email_not_confirmed':
      return 'Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.';
    case 'over_request_rate_limit':
      return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.';
    default:
      return 'Não foi possível entrar. Tente novamente.';
  }
}

export async function entrarComEmail(dados: {
  email: string;
  senha: string;
}): Promise<ResultadoLogin> {
  const { error } = await supabase.auth.signInWithPassword({
    email: normalizarEmail(dados.email),
    password: dados.senha,
  });

  return error ? { ok: false, mensagem: traduzirErroLogin(error) } : { ok: true };
}

export async function sair(): Promise<void> {
  await supabase.auth.signOut();
}
