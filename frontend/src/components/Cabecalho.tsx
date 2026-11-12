import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { alvoToqueMinimo, cores, espacamento, tipografia } from '../theme/tokens';

type Props = {
  titulo: string;
};

export function Cabecalho({ titulo }: Props) {
  const router = useRouter();

  return (
    <View style={estilos.container}>
      <Pressable
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="Voltar"
        hitSlop={8}
        style={estilos.voltar}
      >
        <Ionicons name="arrow-back" size={24} color={cores.texto} />
      </Pressable>
      <Text style={estilos.titulo} accessibilityRole="header" numberOfLines={1}>
        {titulo}
      </Text>
      <View style={estilos.voltar} />
    </View>
  );
}

const estilos = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: espacamento.lg,
    paddingVertical: espacamento.md,
  },
  voltar: {
    width: alvoToqueMinimo,
    height: alvoToqueMinimo,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titulo: { ...tipografia.subtitulo, color: cores.texto, flex: 1, textAlign: 'center' },
});
