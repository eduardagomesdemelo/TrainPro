import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Cabecalho } from '../../src/components/Cabecalho';
import { cores, espacamento, raio, tipografia } from '../../src/theme/tokens';

type OpcaoProps = {
  icone: ComponentProps<typeof Ionicons>['name'];
  titulo: string;
  descricao: string;
  aoPressionar: () => void;
};

function Opcao({ icone, titulo, descricao, aoPressionar }: OpcaoProps) {
  return (
    <Pressable
      onPress={aoPressionar}
      accessibilityRole="button"
      accessibilityLabel={`${titulo}. ${descricao}`}
      android_ripple={{ color: cores.borda }}
      style={estilos.opcao}
    >
      <View style={estilos.icone}>
        <Ionicons name={icone} size={28} color={cores.primaria} />
      </View>
      <View style={estilos.textos}>
        <Text style={estilos.opcaoTitulo}>{titulo}</Text>
        <Text style={estilos.opcaoDescricao}>{descricao}</Text>
      </View>
      <Ionicons name="chevron-forward" size={22} color={cores.textoSecundario} />
    </Pressable>
  );
}

export default function NovoTreino() {
  const router = useRouter();

  return (
    <SafeAreaView style={estilos.tela}>
      <Cabecalho titulo="Novo treino" />

      <View style={estilos.conteudo}>
        <Text style={estilos.pergunta}>Como você quer criar seu programa de treino?</Text>

        <Opcao
          icone="albums-outline"
          titulo="Treino pré-definido"
          descricao="Escolha uma divisão pronta para usar."
          aoPressionar={() => router.push('/treinos-predefinidos')}
        />
        <Opcao
          icone="create-outline"
          titulo="Treino personalizado"
          descricao="Dê um nome e monte do seu jeito."
          aoPressionar={() => router.push('/treino-personalizado')}
        />
      </View>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: espacamento.xl, gap: espacamento.lg },
  pergunta: { ...tipografia.corpo, color: cores.textoSecundario, marginBottom: espacamento.sm },
  opcao: {
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
    width: 52,
    height: 52,
    borderRadius: raio.md,
    backgroundColor: cores.superficieElevada,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textos: { flex: 1, gap: espacamento.xs },
  opcaoTitulo: { ...tipografia.corpo, color: cores.texto, fontWeight: '700' },
  opcaoDescricao: { ...tipografia.legenda, color: cores.textoSecundario },
});
