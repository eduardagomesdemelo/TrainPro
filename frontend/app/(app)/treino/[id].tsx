import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Cabecalho } from '../../../src/components/Cabecalho';
import { EstadoMensagem } from '../../../src/components/EstadoMensagem';
import { listarSessoes } from '../../../src/features/treinos/servicoTreinos';
import { Sessao } from '../../../src/features/treinos/tipos';
import { cores, espacamento, raio, tipografia } from '../../../src/theme/tokens';

export default function SessoesDoTreino() {
  const router = useRouter();
  const { id, nome } = useLocalSearchParams<{ id: string; nome?: string }>();

  const [sessoes, setSessoes] = useState<Sessao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    const resultado = await listarSessoes(id);
    if (resultado.ok) setSessoes(resultado.dados);
    else setErro(resultado.mensagem);
    setCarregando(false);
  }, [id]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return (
    <SafeAreaView style={estilos.tela}>
      <Cabecalho titulo={nome ?? 'Treino'} />

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
      ) : sessoes.length === 0 ? (
        <EstadoMensagem
          icone="albums-outline"
          titulo="Sem sessões"
          descricao="Este treino ainda não tem sessões."
        />
      ) : (
        <FlatList
          data={sessoes}
          keyExtractor={(sessao) => sessao.id}
          contentContainerStyle={estilos.lista}
          ListHeaderComponent={<Text style={estilos.instrucao}>Qual sessão você vai treinar?</Text>}
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                router.push({ pathname: '/sessao/[id]', params: { id: item.id, nome: item.nome } })
              }
              accessibilityRole="button"
              accessibilityLabel={`${item.nome}, ${item.totalExercicios} exercícios`}
              android_ripple={{ color: cores.borda }}
              style={estilos.cartao}
            >
              <View style={estilos.icone}>
                <Ionicons name="flash-outline" size={24} color={cores.primaria} />
              </View>
              <View style={estilos.textos}>
                <Text style={estilos.nome}>{item.nome}</Text>
                <Text style={estilos.detalhe}>
                  {item.totalExercicios} {item.totalExercicios === 1 ? 'exercício' : 'exercícios'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color={cores.textoSecundario} />
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  lista: { padding: espacamento.xl, gap: espacamento.md },
  instrucao: { ...tipografia.corpo, color: cores.textoSecundario, marginBottom: espacamento.sm },
  cartao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamento.lg,
    padding: espacamento.lg,
    backgroundColor: cores.superficie,
    borderRadius: raio.lg,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  icone: {
    width: 48,
    height: 48,
    borderRadius: raio.md,
    backgroundColor: cores.superficieElevada,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textos: { flex: 1, gap: espacamento.xs },
  nome: { ...tipografia.corpo, color: cores.texto, fontWeight: '700' },
  detalhe: { ...tipografia.legenda, color: cores.textoSecundario },
});
