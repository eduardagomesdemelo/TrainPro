import { useVideoPlayer, VideoView } from 'expo-video';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BotaoIcone } from '../../components/BotaoIcone';
import { cores, espacamento, raio, tipografia } from '../../theme/tokens';
import { VideoExercicio } from './servicoVideos';

type Props = {
  video: VideoExercicio | null;
  aoFechar: () => void;
};

// O player só existe enquanto há um vídeo selecionado; ao fechar, é descartado e o áudio para.
function Reproducao({ video }: { video: VideoExercicio }) {
  const player = useVideoPlayer(video.videoUrl, (p) => {
    p.play();
  });

  return (
    <VideoView
      player={player}
      style={estilos.video}
      contentFit="contain"
      nativeControls
      fullscreenOptions={{ enable: true }}
    />
  );
}

export function PlayerVideo({ video, aoFechar }: Props) {
  return (
    <Modal
      visible={video !== null}
      animationType="slide"
      onRequestClose={aoFechar}
      supportedOrientations={['portrait', 'landscape']}
    >
      <SafeAreaView style={estilos.tela}>
        <View style={estilos.cabecalho}>
          <BotaoIcone icone="close" descricao="Fechar vídeo" aoPressionar={aoFechar} />
          <Text style={estilos.titulo} numberOfLines={2} accessibilityRole="header">
            {video?.nome}
          </Text>
          <View style={estilos.espaco} />
        </View>

        {video && (
          <View style={estilos.conteudo}>
            <Reproducao video={video} />
            <View style={estilos.detalhes}>
              <Text style={estilos.categoria}>{video.categoria}</Text>
              <Text style={estilos.dica}>
                Observe a execução correta do exercício para evitar lesões e aproveitar melhor o
                treino.
              </Text>
            </View>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: espacamento.md,
    paddingHorizontal: espacamento.lg,
    paddingVertical: espacamento.md,
  },
  titulo: { ...tipografia.subtitulo, color: cores.texto, flex: 1, textAlign: 'center' },
  espaco: { width: 52 },
  conteudo: { padding: espacamento.lg, gap: espacamento.lg },
  video: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: raio.lg,
    backgroundColor: '#000',
  },
  detalhes: {
    padding: espacamento.lg,
    gap: espacamento.sm,
    backgroundColor: cores.superficie,
    borderRadius: raio.lg,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  categoria: { ...tipografia.corpo, color: cores.primaria, fontWeight: '700' },
  dica: { ...tipografia.corpo, color: cores.textoSecundario },
});
