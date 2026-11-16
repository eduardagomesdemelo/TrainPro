import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import * as Linking from 'expo-linking';

import { Resultado, falha } from '../../lib/resultado';
import { supabase } from '../../lib/supabase';
import {
  normalizarEmail,
  validarEmail,
  validarNome,
  validarSenha,
} from '../auth/validacao';

export type Perfil = {
  id: string;
  nome: string;
  email: string;
  fotoUrl: string | null;
};

const BUCKET_FOTOS = 'avatares';
const VALIDADE_URL_FOTO_SEGUNDOS = 60 * 60;
const LADO_FOTO = 512;

// A foto fica num bucket privado; o app acessa por um link temporário.
async function gerarUrlDaFoto(caminho: string | null): Promise<string | null> {
  if (!caminho) return null;
  const { data, error } = await supabase.storage
    .from(BUCKET_FOTOS)
    .createSignedUrl(caminho, VALIDADE_URL_FOTO_SEGUNDOS);
  return data?.signedUrl ?? null;
}

export async function carregarPerfil(): Promise<Resultado<Perfil>> {
  const { data: sessao, error: erroUsuario } = await supabase.auth.getUser();
  if (erroUsuario || !sessao.user) return falha(erroUsuario, 'Não foi possível carregar o perfil.');

  // O RLS garante que só o perfil do próprio usuário é retornado.
  const { data, error } = await supabase
    .from('perfis')
    .select('nome, foto_path')
    .maybeSingle();
  if (error) return falha(error, 'Não foi possível carregar o perfil.');

  return {
    ok: true,
    dados: {
      id: sessao.user.id,
      nome: data?.nome ?? '',
      email: sessao.user.email ?? '',
      fotoUrl: await gerarUrlDaFoto(data?.foto_path ?? null),
    },
  };
}

export async function atualizarNome(usuarioId: string, nome: string): Promise<Resultado<null>> {
  const erroValidacao = validarNome(nome);
  if (erroValidacao) return { ok: false, mensagem: erroValidacao };

  const { data, error } = await supabase
    .from('perfis')
    .update({ nome: nome.trim() })
    .eq('id', usuarioId)
    .select('id');

  if (error || data.length === 0) return falha(error, 'Não foi possível salvar o nome.');
  return { ok: true, dados: null };
}

// O Supabase envia links de confirmação; o e-mail só muda depois de confirmados.
export async function solicitarTrocaDeEmail(email: string): Promise<Resultado<null>> {
  const erroValidacao = validarEmail(email);
  if (erroValidacao) return { ok: false, mensagem: erroValidacao };

  const { error } = await supabase.auth.updateUser(
    { email: normalizarEmail(email) },
    { emailRedirectTo: Linking.createURL('entrar') },
  );

  if (error) {
    const mensagens: Record<string, string> = {
      email_exists: 'Este e-mail já está em uso por outra conta.',
      over_email_send_rate_limit: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
    };
    return {
      ok: false,
      mensagem: mensagens[error.code ?? ''] ?? 'Não foi possível alterar o e-mail. Tente novamente.',
    };
  }
  return { ok: true, dados: null };
}

// Confirma a senha atual antes de trocar, para proteger a conta se o aparelho estiver desbloqueado.
export async function alterarSenha(
  emailAtual: string,
  senhaAtual: string,
  senhaNova: string,
): Promise<Resultado<null>> {
  const erroValidacao = validarSenha(senhaNova);
  if (erroValidacao) return { ok: false, mensagem: erroValidacao };

  const { error: erroConfirmacao } = await supabase.auth.signInWithPassword({
    email: emailAtual,
    password: senhaAtual,
  });
  if (erroConfirmacao) {
    return erroConfirmacao.code === 'invalid_credentials'
      ? { ok: false, mensagem: 'A senha atual está incorreta.' }
      : falha(erroConfirmacao, 'Não foi possível confirmar a senha atual.');
  }

  const { error } = await supabase.auth.updateUser({ password: senhaNova });
  if (error) {
    return {
      ok: false,
      mensagem:
        error.code === 'same_password'
          ? 'A nova senha precisa ser diferente da atual.'
          : 'Não foi possível alterar a senha. Tente novamente.',
    };
  }
  return { ok: true, dados: null };
}

export type OrigemFoto = 'galeria' | 'camera';

// Converte texto base64 nos bytes da imagem. Ler o arquivo local com fetch() devolve um
// arquivo vazio no React Native, por isso a foto é obtida em base64.
function base64ParaBytes(base64: string): ArrayBuffer {
  const texto = atob(base64);
  const bytes = new Uint8Array(texto.length);
  for (let i = 0; i < texto.length; i++) bytes[i] = texto.charCodeAt(i);
  return bytes.buffer;
}

// Escolhe a imagem, reduz para 512 px e comprime antes de enviar, para ocupar pouco espaço.
// Retorna a imagem em base64, ou null se o usuário cancelou.
async function escolherEPrepararFoto(origem: OrigemFoto): Promise<Resultado<string | null>> {
  const opcoes: ImagePicker.ImagePickerOptions = {
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 1,
  };

  if (origem === 'camera') {
    const permissao = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissao.granted) {
      return { ok: false, mensagem: 'Permita o acesso à câmera nas configurações do aparelho.' };
    }
  }

  const escolha =
    origem === 'camera'
      ? await ImagePicker.launchCameraAsync(opcoes)
      : await ImagePicker.launchImageLibraryAsync(opcoes);
  if (escolha.canceled) return { ok: true, dados: null };

  const contexto = ImageManipulator.manipulate(escolha.assets[0].uri);
  contexto.resize({ width: LADO_FOTO });
  const imagem = await contexto.renderAsync();
  const resultado = await imagem.saveAsync({
    format: SaveFormat.JPEG,
    compress: 0.8,
    base64: true,
  });
  return { ok: true, dados: resultado.base64 ?? null };
}

// Retorna a nova URL da foto, ou null se o usuário cancelou a escolha.
export async function trocarFoto(
  usuarioId: string,
  origem: OrigemFoto,
): Promise<Resultado<string | null>> {
  const preparada = await escolherEPrepararFoto(origem);
  if (!preparada.ok || preparada.dados === null) return preparada;

  const caminho = `${usuarioId}/avatar.jpg`;
  const arquivo = base64ParaBytes(preparada.dados);

  const { error: erroEnvio } = await supabase.storage
    .from(BUCKET_FOTOS)
    .upload(caminho, arquivo, { contentType: 'image/jpeg', upsert: true });
  if (erroEnvio) return falha(erroEnvio, 'Não foi possível enviar a foto. Tente novamente.');

  const { error } = await supabase
    .from('perfis')
    .update({ foto_path: caminho })
    .eq('id', usuarioId);
  if (error) return falha(error, 'Não foi possível salvar a foto. Tente novamente.');

  return { ok: true, dados: await gerarUrlDaFoto(caminho) };
}

export async function removerFoto(usuarioId: string): Promise<Resultado<null>> {
  const { error: erroPerfil } = await supabase
    .from('perfis')
    .update({ foto_path: null })
    .eq('id', usuarioId);
  if (erroPerfil) return falha(erroPerfil, 'Não foi possível remover a foto.');

  await supabase.storage.from(BUCKET_FOTOS).remove([`${usuarioId}/avatar.jpg`]);
  return { ok: true, dados: null };
}
