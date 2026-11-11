import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Botao } from '../../src/components/Botao';
import { TelaAuth } from '../../src/components/TelaAuth';
import { reenviarConfirmacao } from '../../src/features/auth/servicoAutenticacao';
import { cores, espacamento, tipografia } from '../../src/theme/tokens';

const ESPERA_REENVIO_SEGUNDOS = 60;

export default function VerifiqueEmail() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email?: string }>();

  const [segundosRestantes, setSegundosRestantes] = useState(ESPERA_REENVIO_SEGUNDOS);
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState<{ texto: string; erro: boolean } | null>(null);

  useEffect(() => {
    if (segundosRestantes <= 0) return;
    const id = setTimeout(() => setSegundosRestantes((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [segundosRestantes]);

  async function aoReenviar() {
    if (!email || enviando || segundosRestantes > 0) return;
    setEnviando(true);
    setMensagem(null);
    const resultado = await reenviarConfirmacao(email);
    setEnviando(false);

    if (resultado.ok) {
      setMensagem({ texto: 'E-mail reenviado! Verifique sua caixa de entrada.', erro: false });
      setSegundosRestantes(ESPERA_REENVIO_SEGUNDOS);
    } else {
      setMensagem({ texto: resultado.mensagem, erro: true });
    }
  }

  return (
    <TelaAuth>
      <View style={estilos.icone}>
        <Ionicons name="mail-unread-outline" size={40} color={cores.primaria} />
      </View>

      <Text style={estilos.titulo}>Confirme seu e-mail</Text>
      <Text style={estilos.texto}>
        Enviamos um link de confirmação para{' '}
        <Text style={estilos.destaque}>{email ?? 'o seu e-mail'}</Text>. Toque no link para ativar
        sua conta e depois faça login.
      </Text>
      <Text style={estilos.dica}>Não encontrou? Olhe também a caixa de spam.</Text>

      {mensagem && (
        <Text
          style={[estilos.mensagem, { color: mensagem.erro ? cores.erro : cores.sucesso }]}
          accessibilityLiveRegion="polite"
        >
          {mensagem.texto}
        </Text>
      )}

      <View style={estilos.acoes}>
        <Botao
          titulo={
            segundosRestantes > 0 ? `Reenviar e-mail (${segundosRestantes}s)` : 'Reenviar e-mail'
          }
          variante="secundario"
          aoPressionar={aoReenviar}
          carregando={enviando}
          desabilitado={segundosRestantes > 0 || !email}
        />
        <Botao
          titulo="Já confirmei, ir para o login"
          aoPressionar={() => router.replace('/entrar')}
        />
      </View>
    </TelaAuth>
  );
}

const estilos = StyleSheet.create({
  icone: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: cores.superficieElevada,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titulo: { ...tipografia.titulo, color: cores.texto, marginTop: espacamento.xl },
  texto: { ...tipografia.corpo, color: cores.textoSecundario, marginTop: espacamento.md },
  destaque: { color: cores.texto, fontWeight: '700' },
  dica: { ...tipografia.legenda, color: cores.textoSecundario, marginTop: espacamento.md },
  mensagem: { ...tipografia.corpo, marginTop: espacamento.lg },
  acoes: { gap: espacamento.md, marginTop: espacamento.xxl },
});
