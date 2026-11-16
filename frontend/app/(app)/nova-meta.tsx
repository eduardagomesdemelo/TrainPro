import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Botao } from '../../src/components/Botao';
import { Cabecalho } from '../../src/components/Cabecalho';
import { CampoRef, CampoTexto } from '../../src/components/CampoTexto';
import { useDialogo } from '../../src/components/dialogo/DialogoContexto';
import {
  DESCRICAO_META_MAX,
  TITULO_META_MAX,
  cadastrarMeta,
  validarDescricaoMeta,
  validarTituloMeta,
} from '../../src/features/metas/servicoMetas';
import { cores, espacamento } from '../../src/theme/tokens';

export default function NovaMeta() {
  const router = useRouter();
  const { avisar, mostrarErro } = useDialogo();
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [erroTitulo, setErroTitulo] = useState<string | null>(null);
  const [erroDescricao, setErroDescricao] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const refDescricao = useRef<CampoRef>(null);

  async function aoSalvar() {
    if (salvando) return;

    const novoErroTitulo = validarTituloMeta(titulo);
    const novoErroDescricao = validarDescricaoMeta(descricao);
    setErroTitulo(novoErroTitulo);
    setErroDescricao(novoErroDescricao);
    if (novoErroTitulo || novoErroDescricao) return;

    setSalvando(true);
    const resultado = await cadastrarMeta({ titulo, descricao });
    setSalvando(false);

    if (resultado.ok) {
      avisar('Meta cadastrada com sucesso!');
      router.back();
    } else {
      mostrarErro(resultado.mensagem);
    }
  }

  return (
    <SafeAreaView style={estilos.tela}>
      <KeyboardAvoidingView style={estilos.tela} behavior="padding">
        <Cabecalho titulo="Nova meta" />

        <ScrollView
          contentContainerStyle={estilos.conteudo}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <CampoTexto
            rotulo="Título"
            icone="flag-outline"
            value={titulo}
            onChangeText={setTitulo}
            erro={erroTitulo}
            placeholder="Ex.: Supino com 60 kg"
            autoCapitalize="sentences"
            maxLength={TITULO_META_MAX}
            returnKeyType="next"
            onSubmitEditing={() => refDescricao.current?.focus()}
          />

          <CampoTexto
            ref={refDescricao}
            rotulo="Detalhes (opcional)"
            value={descricao}
            onChangeText={setDescricao}
            erro={erroDescricao}
            dica={`${descricao.length}/${DESCRICAO_META_MAX} caracteres`}
            placeholder="Descreva como você pretende chegar lá"
            autoCapitalize="sentences"
            multiline
            maxLength={DESCRICAO_META_MAX}
          />

          <View style={estilos.acao}>
            <Botao
              titulo="Salvar meta"
              icone="checkmark-circle-outline"
              aoPressionar={aoSalvar}
              carregando={salvando}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: espacamento.xl, gap: espacamento.lg },
  acao: { marginTop: espacamento.sm },
});
