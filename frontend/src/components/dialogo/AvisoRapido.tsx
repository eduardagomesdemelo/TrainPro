import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { cores, espacamento, raio, tipografia } from '../../theme/tokens';

export type AvisoRapidoDados = {
  id: number;
  mensagem: string;
  tipo: 'sucesso' | 'info';
};

const DURACAO_MS = 2800;

type Props = {
  aviso: AvisoRapidoDados | null;
  aoEncerrar: (id: number) => void;
};

// Aviso curto na parte de baixo da tela; some sozinho depois de alguns segundos.
export function AvisoRapido({ aviso, aoEncerrar }: Props) {
  const insets = useSafeAreaInsets();
  const opacidade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!aviso) return;

    opacidade.setValue(0);
    Animated.sequence([
      Animated.timing(opacidade, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(DURACAO_MS),
      Animated.timing(opacidade, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(({ finished }) => {
      // Se outro aviso interrompeu esta animação, o id novo cuida do encerramento.
      if (finished) aoEncerrar(aviso.id);
    });
  }, [aviso?.id]);

  if (!aviso) return null;

  const sucesso = aviso.tipo === 'sucesso';

  return (
    <Animated.View
      pointerEvents="none"
      accessibilityLiveRegion="polite"
      style={[estilos.aviso, { opacity: opacidade, bottom: insets.bottom + espacamento.xxl * 2 }]}
    >
      <Ionicons
        name={sucesso ? 'checkmark-circle' : 'information-circle'}
        size={22}
        color={sucesso ? cores.sucesso : cores.primaria}
      />
      <Text style={estilos.texto}>{aviso.mensagem}</Text>
    </Animated.View>
  );
}

const estilos = StyleSheet.create({
  aviso: {
    position: 'absolute',
    left: espacamento.xl,
    right: espacamento.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamento.md,
    paddingVertical: espacamento.md,
    paddingHorizontal: espacamento.lg,
    backgroundColor: cores.superficieElevada,
    borderRadius: raio.md,
    borderWidth: 1,
    borderColor: cores.borda,
    elevation: 8,
  },
  texto: { ...tipografia.corpo, color: cores.texto, flex: 1 },
});
