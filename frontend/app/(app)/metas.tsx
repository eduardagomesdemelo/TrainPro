import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, SectionList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BotaoIcone } from '../../src/components/BotaoIcone';
import { Cabecalho } from '../../src/components/Cabecalho';
import { useDialogo } from '../../src/components/dialogo/DialogoContexto';
import { EstadoMensagem } from '../../src/components/EstadoMensagem';
import { ItemMeta } from '../../src/features/metas/ItemMeta';
import {
  Meta,
  alterarConclusao,
  excluirMeta,
  listarMetas,
} from '../../src/features/metas/servicoMetas';
import { cores, espacamento, tipografia } from '../../src/theme/tokens';

export default function Metas() {
  const router = useRouter();
  const { confirmar, mostrarErro } = useDialogo();
  const [metas, setMetas] = useState<Meta[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [concluindoId, setConcluindoId] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setErro(null);
    const resultado = await listarMetas();
    if (resultado.ok) setMetas(resultado.dados);
    else setErro(resultado.mensagem);
    setCarregando(false);
  }, []);

  // Recarrega ao voltar do cadastro, para mostrar a meta recém-criada.
  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  async function alternarConclusao(meta: Meta) {
    const concluir = !meta.concluida;
    const resultado = await alterarConclusao(meta.id, concluir);

    if (!resultado.ok) {
      mostrarErro(resultado.mensagem);
      return;
    }
    setMetas((anteriores) =>
      anteriores.map((m) => (m.id === meta.id ? { ...m, concluida: concluir } : m)),
    );
    // A animação só toca ao concluir, não ao desmarcar.
    if (concluir) setConcluindoId(meta.id);
  }

  async function confirmarExclusao(meta: Meta) {
    const confirmou = await confirmar({
      titulo: 'Excluir meta',
      mensagem: `Deseja excluir "${meta.titulo}"?`,
      textoConfirmar: 'Excluir',
      perigoso: true,
    });
    if (confirmou) excluir(meta);
  }

  async function excluir(meta: Meta) {
    const resultado = await excluirMeta(meta.id);
    if (resultado.ok) {
      setMetas((anteriores) => anteriores.filter((m) => m.id !== meta.id));
    } else {
      mostrarErro(resultado.mensagem);
    }
  }

  const secoes = [
    { titulo: 'Pendentes', data: metas.filter((m) => !m.concluida) },
    { titulo: 'Concluídas', data: metas.filter((m) => m.concluida) },
  ].filter((secao) => secao.data.length > 0);

  return (
    <SafeAreaView style={estilos.tela}>
      <Cabecalho titulo="Minhas metas" />

      {carregando ? (
        <View style={estilos.centro}>
          <ActivityIndicator size="large" color={cores.primaria} />
        </View>
      ) : erro ? (
        <EstadoMensagem
          icone="cloud-offline-outline"
          titulo="Algo deu errado"
          descricao={erro}
          acao={{ titulo: 'Tentar novamente', aoPressionar: carregar }}
        />
      ) : metas.length === 0 ? (
        <EstadoMensagem
          icone="locate-outline"
          titulo="Nenhuma meta ainda"
          descricao="Toque no botão + para cadastrar o seu primeiro objetivo."
        />
      ) : (
        <SectionList
          sections={secoes}
          keyExtractor={(meta) => meta.id}
          stickySectionHeadersEnabled={false}
          contentContainerStyle={estilos.lista}
          ItemSeparatorComponent={() => <View style={estilos.separador} />}
          renderSectionHeader={({ section }) => (
            <Text style={estilos.secao} accessibilityRole="header">
              {section.titulo} ({section.data.length})
            </Text>
          )}
          renderItem={({ item }) => (
            <ItemMeta
              meta={item}
              animarConclusao={concluindoId === item.id}
              aoTerminarAnimacao={() => setConcluindoId(null)}
              aoAlternarConclusao={() => alternarConclusao(item)}
              aoExcluir={() => confirmarExclusao(item)}
            />
          )}
        />
      )}

      <View style={estilos.rodape}>
        <BotaoIcone
          icone="add"
          descricao="Cadastrar meta"
          variante="destaque"
          aoPressionar={() => router.push('/nova-meta')}
        />
      </View>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  lista: { padding: espacamento.xl },
  secao: {
    ...tipografia.legenda,
    color: cores.textoSecundario,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: espacamento.sm,
    marginBottom: espacamento.md,
  },
  separador: { height: espacamento.md },
  rodape: {
    alignItems: 'center',
    paddingVertical: espacamento.md,
    borderTopWidth: 1,
    borderTopColor: cores.borda,
    backgroundColor: cores.fundo,
  },
});
