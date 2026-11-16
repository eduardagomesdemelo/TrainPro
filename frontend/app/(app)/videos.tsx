import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Cabecalho } from '../../src/components/Cabecalho';
import { EstadoMensagem } from '../../src/components/EstadoMensagem';
import {
  CategoriaVideos,
  listarCategoriasDeVideos,
} from '../../src/features/videos/servicoVideos';
import { alvoToqueMinimo, cores, espacamento, raio, tipografia } from '../../src/theme/tokens';

export default function Videos() {
  const router = useRouter();
  const [categorias, setCategorias] = useState<CategoriaVideos[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    const resultado = await listarCategoriasDeVideos();
    if (resultado.ok) setCategorias(resultado.dados);
    else setErro(resultado.mensagem);
    setCarregando(false);
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return (
    <SafeAreaView style={estilos.tela}>
      <Cabecalho titulo="Vídeos de exercícios" />

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
      ) : categorias.length === 0 ? (
        <EstadoMensagem
          icone="videocam-off-outline"
          titulo="Nenhum vídeo disponível"
          descricao="Os vídeos de demonstração ainda não foram cadastrados."
        />
      ) : (
        <FlatList
          data={categorias}
          keyExtractor={(categoria) => categoria.nome}
          contentContainerStyle={estilos.lista}
          ItemSeparatorComponent={() => <View style={estilos.separador} />}
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                router.push({ pathname: '/videos/[categoria]', params: { categoria: item.nome } })
              }
              accessibilityRole="button"
              accessibilityLabel={`${item.nome}, ${item.quantidade} vídeos`}
              android_ripple={{ color: cores.borda }}
              style={estilos.cartao}
            >
              <View style={estilos.icone}>
                <Ionicons name="play" size={22} color={cores.primaria} />
              </View>
              <View style={estilos.info}>
                <Text style={estilos.nome}>{item.nome}</Text>
                <Text style={estilos.quantidade}>
                  {item.quantidade} {item.quantidade === 1 ? 'vídeo' : 'vídeos'}
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
  lista: { padding: espacamento.xl },
  separador: { height: espacamento.md },
  cartao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamento.md,
    minHeight: alvoToqueMinimo + 20,
    padding: espacamento.lg,
    backgroundColor: cores.superficie,
    borderRadius: raio.lg,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  icone: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.superficieElevada,
  },
  info: { flex: 1, gap: 2 },
  nome: { ...tipografia.corpo, color: cores.texto, fontWeight: '700' },
  quantidade: { ...tipografia.legenda, color: cores.textoSecundario },
});
