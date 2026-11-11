import { Ionicons } from '@expo/vector-icons';
import { ComponentProps } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { alvoToqueMinimo, cores, raio } from '../theme/tokens';

type Props = {
  icone: ComponentProps<typeof Ionicons>['name'];
  descricao: string;
  aoPressionar: () => void;
};

export function BotaoSocial({ icone, descricao, aoPressionar }: Props) {
  return (
    <Pressable
      onPress={aoPressionar}
      accessibilityRole="button"
      accessibilityLabel={descricao}
      android_ripple={{ color: cores.borda }}
      style={estilos.botao}
    >
      <Ionicons name={icone} size={24} color={cores.texto} />
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  botao: {
    width: alvoToqueMinimo + 8,
    height: alvoToqueMinimo + 8,
    borderRadius: raio.md,
    backgroundColor: cores.superficie,
    borderWidth: 1.5,
    borderColor: cores.borda,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
