import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { Botao } from '../../components/Botao';
import { CampoRef, CampoTexto } from '../../components/CampoTexto';
import { formatarCarga } from '../../lib/formatacao';
import { cores, espacamento, raio, tipografia } from '../../theme/tokens';
import {
  converterCarga,
  validarCarga,
  validarRepeticoes,
} from '../treinos/servicoRegistros';

type Props = {
  visivel: boolean;
  exercicio: string;
  numeroSerie: number;
  cargaInicial: number;
  repeticoesInicial: number;
  // Retorna a mensagem de erro, ou null quando a alteração foi salva.
  aoSalvar: (carga: number, repeticoes: number) => Promise<string | null>;
  aoFechar: () => void;
};

export function ModalEdicaoSerie({
  visivel,
  exercicio,
  numeroSerie,
  cargaInicial,
  repeticoesInicial,
  aoSalvar,
  aoFechar,
}: Props) {
  const [carga, setCarga] = useState('');
  const [repeticoes, setRepeticoes] = useState('');
  const [erroCarga, setErroCarga] = useState<string | null>(null);
  const [erroRepeticoes, setErroRepeticoes] = useState<string | null>(null);
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const refRepeticoes = useRef<CampoRef>(null);

  // A cada abertura, os campos partem dos valores atuais da série.
  useEffect(() => {
    if (visivel) {
      setCarga(formatarCarga(cargaInicial));
      setRepeticoes(String(repeticoesInicial));
      setErroCarga(null);
      setErroRepeticoes(null);
      setErroGeral(null);
    }
  }, [visivel, cargaInicial, repeticoesInicial]);

  async function salvar() {
    if (salvando) return;
    setErroGeral(null);

    const novoErroCarga = validarCarga(carga);
    const novoErroRepeticoes = validarRepeticoes(repeticoes);
    setErroCarga(novoErroCarga);
    setErroRepeticoes(novoErroRepeticoes);
    if (novoErroCarga || novoErroRepeticoes) return;

    setSalvando(true);
    const erro = await aoSalvar(converterCarga(carga)!, Number(repeticoes));
    setSalvando(false);

    if (erro) setErroGeral(erro);
    else aoFechar();
  }

  return (
    <Modal
      visible={visivel}
      transparent
      animationType="fade"
      onRequestClose={aoFechar}
      statusBarTranslucent
      navigationBarTranslucent
    >
      <KeyboardAvoidingView style={estilos.fundo} behavior="padding">
        {/* Tocar fora da janela fecha sem salvar. */}
        <Pressable
          style={estilos.toqueFora}
          onPress={aoFechar}
          accessibilityLabel="Fechar sem salvar"
        />

        <View style={estilos.janela}>
          <Text style={estilos.titulo} accessibilityRole="header">
            Editar série {numeroSerie}
          </Text>
          <Text style={estilos.subtitulo}>{exercicio}</Text>

          <View style={estilos.campos}>
            <View style={estilos.campo}>
              <CampoTexto
                rotulo="Carga (kg)"
                value={carga}
                onChangeText={setCarga}
                erro={erroCarga}
                keyboardType="decimal-pad"
                maxLength={7}
                autoFocus
                selectTextOnFocus
                returnKeyType="next"
                onSubmitEditing={() => refRepeticoes.current?.focus()}
              />
            </View>
            <View style={estilos.campo}>
              <CampoTexto
                ref={refRepeticoes}
                rotulo="Repetições"
                value={repeticoes}
                onChangeText={setRepeticoes}
                erro={erroRepeticoes}
                keyboardType="number-pad"
                maxLength={3}
                selectTextOnFocus
                returnKeyType="done"
                onSubmitEditing={salvar}
              />
            </View>
          </View>

          {erroGeral && (
            <Text style={estilos.erroGeral} accessibilityLiveRegion="assertive">
              {erroGeral}
            </Text>
          )}

          <View style={estilos.acoes}>
            <View style={estilos.acao}>
              <Botao titulo="Cancelar" variante="secundario" aoPressionar={aoFechar} />
            </View>
            <View style={estilos.acao}>
              <Botao
                titulo="Salvar"
                icone="checkmark"
                aoPressionar={salvar}
                carregando={salvando}
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  fundo: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    padding: espacamento.xl,
  },
  toqueFora: StyleSheet.absoluteFill,
  janela: {
    padding: espacamento.xl,
    gap: espacamento.md,
    backgroundColor: cores.superficie,
    borderRadius: raio.lg,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  titulo: { ...tipografia.subtitulo, color: cores.texto },
  subtitulo: { ...tipografia.corpo, color: cores.primaria },
  campos: { flexDirection: 'row', gap: espacamento.md, marginTop: espacamento.sm },
  campo: { flex: 1 },
  erroGeral: { ...tipografia.legenda, color: cores.erro },
  acoes: { flexDirection: 'row', gap: espacamento.md, marginTop: espacamento.sm },
  acao: { flex: 1 },
});
