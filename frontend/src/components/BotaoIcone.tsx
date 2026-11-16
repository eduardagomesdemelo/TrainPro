import { Ionicons } from '@expo/vector-icons';
import { ComponentProps } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { alvoToqueMinimo, cores, raio } from '../theme/tokens';

type Props = {
  icone: ComponentProps<typeof Ionicons>['name'];
  // Lido por leitores de tela, já que o botão não tem texto.
  descricao: string;
  aoPressionar: () => void;
  // "destaque" = círculo salmão para a ação principal; "sutil" = só o ícone.
  variante?: 'destaque' | 'sutil';
};

export function BotaoIcone({ icone, descricao, aoPressionar, variante = 'sutil' }: Props) {
  const destaque = variante === 'destaque';

  return (
    <Pressable
      onPress={aoPressionar}
      accessibilityRole="button"
      accessibilityLabel={descricao}
      hitSlop={8}
      android_ripple={{ color: destaque ? cores.primariaPressionada : cores.borda }}
      style={[estilos.base, destaque && estilos.destaque]}
    >
      <Ionicons
        name={icone}
        size={destaque ? 28 : 26}
        color={destaque ? cores.sobrePrimaria : cores.textoSecundario}
      />
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  base: {
    width: alvoToqueMinimo,
    height: alvoToqueMinimo,
    borderRadius: raio.pilula,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  destaque: {
    width: 52,
    height: 52,
    backgroundColor: cores.primaria,
  },
});
