import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Botao } from '../../src/components/Botao';
import { CampoRef, CampoTexto } from '../../src/components/CampoTexto';
import { OpcoesSociais } from '../../src/components/OpcoesSociais';
import { Logo } from '../../src/components/Logo';
import { TelaAuth } from '../../src/components/TelaAuth';
import { entrarComEmail } from '../../src/features/auth/servicoAutenticacao';
import { validarEmail } from '../../src/features/auth/validacao';
import { cores, espacamento, raio, tipografia } from '../../src/theme/tokens';

export default function Entrar() {
  const router = useRouter();
  // 'confirmado=1' vem do link do e-mail de confirmação.
  const { confirmado } = useLocalSearchParams<{ confirmado?: string }>();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erroEmail, setErroEmail] = useState<string | null>(null);
  const [erroSenha, setErroSenha] = useState<string | null>(null);
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const refSenha = useRef<CampoRef>(null);

  async function aoEntrar() {
    if (enviando) return;
    setErroGeral(null);

    const novoErroEmail = validarEmail(email);
    const novoErroSenha = senha ? null : 'Informe sua senha.';
    setErroEmail(novoErroEmail);
    setErroSenha(novoErroSenha);
    if (novoErroEmail || novoErroSenha) return;

    setEnviando(true);
    const resultado = await entrarComEmail({ email, senha });
    setEnviando(false);

    if (resultado.ok) {
      router.replace('/inicio');
    } else {
      setErroGeral(resultado.mensagem);
    }
  }

  return (
    <TelaAuth>
      <Logo />
      <Text style={estilos.titulo}>Entre na sua conta</Text>

      {confirmado === '1' && (
        <View style={estilos.aviso} accessibilityLiveRegion="polite">
          <Text style={estilos.avisoTexto}>E-mail confirmado! Agora você já pode fazer login.</Text>
        </View>
      )}

      <View style={estilos.formulario}>
        <CampoTexto
          rotulo="E-mail"
          value={email}
          onChangeText={setEmail}
          erro={erroEmail}
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
          erro={erroSenha}
          autoCapitalize="none"
          autoComplete="current-password"
          textContentType="password"
          maxLength={72}
          returnKeyType="done"
          onSubmitEditing={aoEntrar}
        />
      </View>

      {erroGeral && (
        <Text style={estilos.erroGeral} accessibilityLiveRegion="assertive">
          {erroGeral}
        </Text>
      )}

      <View style={estilos.botao}>
        <Botao titulo="Entrar" aoPressionar={aoEntrar} carregando={enviando} />
      </View>

      <OpcoesSociais acao="Entrar" />

      <View style={estilos.rodape}>
        <Text style={estilos.rodapeTexto}>Não tem uma conta? </Text>
        <Link href="/cadastro" style={estilos.link} accessibilityRole="link">
          Cadastre-se
        </Link>
      </View>
    </TelaAuth>
  );
}

const estilos = StyleSheet.create({
  titulo: { ...tipografia.titulo, color: cores.texto, marginTop: espacamento.xl },
  aviso: {
    marginTop: espacamento.lg,
    padding: espacamento.lg,
    borderRadius: raio.md,
    backgroundColor: cores.superficieElevada,
    borderWidth: 1,
    borderColor: cores.sucesso,
  },
  avisoTexto: { ...tipografia.corpo, color: cores.sucesso },
  formulario: { gap: espacamento.lg, marginTop: espacamento.xl },
  erroGeral: { ...tipografia.corpo, color: cores.erro, marginTop: espacamento.lg },
  botao: { marginTop: espacamento.xl },
  rodape: { flexDirection: 'row', justifyContent: 'center', marginTop: espacamento.xl },
  rodapeTexto: { ...tipografia.corpo, color: cores.textoSecundario },
  link: { ...tipografia.corpo, color: cores.primaria, fontWeight: '700' },
});
