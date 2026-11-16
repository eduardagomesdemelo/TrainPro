import { Link, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Botao } from '../../src/components/Botao';
import { CampoRef, CampoTexto } from '../../src/components/CampoTexto';
import { useDialogo } from '../../src/components/dialogo/DialogoContexto';
import { OpcoesSociais } from '../../src/components/OpcoesSociais';
import { Logo } from '../../src/components/Logo';
import { TelaAuth } from '../../src/components/TelaAuth';
import { cadastrarUsuario } from '../../src/features/auth/servicoAutenticacao';
import {
  validarConfirmacaoSenha,
  validarEmail,
  validarNome,
  validarSenha,
} from '../../src/features/auth/validacao';
import { cores, espacamento, tipografia } from '../../src/theme/tokens';

type Erros = Partial<Record<'nome' | 'email' | 'senha' | 'confirmacao', string | null>>;

export default function Cadastro() {
  const router = useRouter();
  const { informar } = useDialogo();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [erros, setErros] = useState<Erros>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const refEmail = useRef<CampoRef>(null);
  const refSenha = useRef<CampoRef>(null);
  const refConfirmacao = useRef<CampoRef>(null);

  function validarFormulario(): boolean {
    const novosErros: Erros = {
      nome: validarNome(nome),
      email: validarEmail(email),
      senha: validarSenha(senha),
      confirmacao: validarConfirmacaoSenha(senha, confirmacao),
    };
    setErros(novosErros);
    return Object.values(novosErros).every((erro) => !erro);
  }

  async function aoCadastrar() {
    if (enviando) return;
    setErroGeral(null);
    if (!validarFormulario()) return;

    setEnviando(true);
    const resultado = await cadastrarUsuario({ nome, email, senha });
    setEnviando(false);

    switch (resultado.status) {
      case 'confirmacao_enviada':
        router.replace({ pathname: '/verifique-email', params: { email: email.trim() } });
        break;
      case 'conta_existente':
        await informar(
          'Conta já cadastrada',
          'Já existe uma conta com este e-mail. Entre para continuar.',
          'Ir para o login',
        );
        router.replace('/entrar');
        break;
      case 'erro':
        setErroGeral(resultado.mensagem);
        break;
    }
  }

  return (
    <TelaAuth>
      <Logo />
      <Text style={estilos.titulo}>Crie sua conta</Text>
      <Text style={estilos.subtitulo}>Comece a acompanhar seus treinos em poucos passos.</Text>

      <View style={estilos.formulario}>
        <CampoTexto
          rotulo="Nome"
          value={nome}
          onChangeText={setNome}
          erro={erros.nome}
          autoCapitalize="words"
          autoComplete="name"
          textContentType="name"
          maxLength={100}
          returnKeyType="next"
          onSubmitEditing={() => refEmail.current?.focus()}
        />
        <CampoTexto
          ref={refEmail}
          rotulo="E-mail"
          value={email}
          onChangeText={setEmail}
          erro={erros.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          maxLength={150}
          returnKeyType="next"
          onSubmitEditing={() => refSenha.current?.focus()}
        />
        <CampoTexto
          ref={refSenha}
          rotulo="Senha"
          senha
          value={senha}
          onChangeText={setSenha}
          erro={erros.senha}
          dica="Mínimo de 8 caracteres, com letras e números."
          autoCapitalize="none"
          autoComplete="new-password"
          textContentType="newPassword"
          maxLength={72}
          returnKeyType="next"
          onSubmitEditing={() => refConfirmacao.current?.focus()}
        />
        <CampoTexto
          ref={refConfirmacao}
          rotulo="Repetir senha"
          senha
          value={confirmacao}
          onChangeText={setConfirmacao}
          erro={erros.confirmacao}
          autoCapitalize="none"
          autoComplete="new-password"
          textContentType="newPassword"
          maxLength={72}
          returnKeyType="done"
          onSubmitEditing={aoCadastrar}
        />
      </View>

      {erroGeral && (
        <Text style={estilos.erroGeral} accessibilityLiveRegion="assertive">
          {erroGeral}
        </Text>
      )}

      <Text style={estilos.termos}>
        Ao criar sua conta, você concorda com os Termos de Serviço e a Política de Privacidade.
      </Text>

      <Botao titulo="Criar conta" aoPressionar={aoCadastrar} carregando={enviando} />

      <OpcoesSociais acao="Cadastrar" />

      <View style={estilos.rodape}>
        <Text style={estilos.rodapeTexto}>Já tem uma conta? </Text>
        <Link href="/entrar" style={estilos.link} accessibilityRole="link">
          Entrar
        </Link>
      </View>
    </TelaAuth>
  );
}

const estilos = StyleSheet.create({
  titulo: { ...tipografia.titulo, color: cores.texto, marginTop: espacamento.xl },
  subtitulo: { ...tipografia.corpo, color: cores.textoSecundario, marginTop: espacamento.xs },
  formulario: { gap: espacamento.lg, marginTop: espacamento.xl },
  erroGeral: { ...tipografia.corpo, color: cores.erro, marginTop: espacamento.lg },
  termos: {
    ...tipografia.legenda,
    color: cores.textoSecundario,
    marginTop: espacamento.xl,
    marginBottom: espacamento.lg,
  },
  rodape: { flexDirection: 'row', justifyContent: 'center', marginTop: espacamento.xl },
  rodapeTexto: { ...tipografia.corpo, color: cores.textoSecundario },
  link: { ...tipografia.corpo, color: cores.primaria, fontWeight: '700' },
});
