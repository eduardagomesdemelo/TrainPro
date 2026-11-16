import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Cabecalho } from '../../../src/components/Cabecalho';
import { EstadoMensagem } from '../../../src/components/EstadoMensagem';
import { PlayerVideo } from '../../../src/features/videos/PlayerVideo';
import {
  VideoExercicio,
  listarVideosDaCategoria,
} from '../../../src/features/videos/servicoVideos';
import { cores, espacamento, raio, tipografia } from '../../../src/theme/tokens';

export default function VideosDaCategoria() {
  const { categoria } = useLocalSearchParams<{ categoria: string }>();
  const [videos, setVideos] = useState<VideoExercicio[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [selecionado, setSelecionado] = useState<VideoExercicio | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    const resultado = await listarVideosDaCategoria(categoria);
    if (resultado.ok) setVideos(resultado.dados);
    else setErro(resultado.mensagem);
    setCarregando(false);
  }, [categoria]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return (
    <SafeAreaView style={estilos.tela}>
      <Cabecalho titulo={categoria} />

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
      ) : videos.length === 0 ? (
        <EstadoMensagem
          icone="videocam-off-outline"
          titulo="Nenhum vídeo nesta categoria"
        />
      ) : (
        <FlatList
          data={videos}
          keyExtractor={(video) => video.id}
          contentContainerStyle={estilos.lista}
          ItemSeparatorComponent={() => <View style={estilos.separador} />}
          // Carrega só o que está perto da tela, já que cada item baixa uma miniatura.
          initialNumToRender={5}
          windowSize={5}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setSelecionado(item)}
              accessibilityRole="button"
              accessibilityLabel={`Assistir ${item.nome}`}
              style={estilos.cartao}
            >
              <View style={estilos.miniaturaArea}>
                <Image
                  source={{ uri: item.miniaturaUrl }}
                  style={estilos.miniatura}
                  resizeMode="cover"
                />
                <View style={estilos.sobreposicao}>
                  <View style={estilos.botaoPlay}>
                    <Ionicons name="play" size={26} color={cores.sobrePrimaria} />
                  </View>
                </View>
              </View>
              <Text style={estilos.nome} numberOfLines={2}>
                {item.nome}
              </Text>
            </Pressable>
          )}
        />
      )}

      <PlayerVideo video={selecionado} aoFechar={() => setSelecionado(null)} />
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  lista: { padding: espacamento.xl },
  separador: { height: espacamento.lg },
  cartao: {
    backgroundColor: cores.superficie,
    borderRadius: raio.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    overflow: 'hidden',
  },
  miniaturaArea: { width: '100%', aspectRatio: 16 / 9, backgroundColor: cores.superficieElevada },
  miniatura: { width: '100%', height: '100%' },
  sobreposicao: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  botaoPlay: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.primaria,
  },
  nome: { ...tipografia.corpo, color: cores.texto, fontWeight: '700', padding: espacamento.lg },
});
