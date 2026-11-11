import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { alvoToqueMinimo, cores, raio, tipografia } from '../theme/tokens';

type Props = {
  titulo: string;
  aoPressionar: () => void;
  variante?: 'primario' | 'secundario' | 'texto';
  carregando?: boolean;
  desabilitado?: boolean;
};

export function Botao({
  titulo,
  aoPressionar,
  variante = 'primario',
  carregando = false,
  desabilitado = false,
}: Props) {
  const inativo = desabilitado || carregando;
  const corTexto = variante === 'primario' ? cores.sobrePrimaria : cores.primaria;

  return (
    <Pressable
      onPress={aoPressionar}
      disabled={inativo}
      accessibilityRole="button"
      accessibilityLabel={titulo}
      accessibilityState={{ disabled: inativo, busy: carregando }}
      android_ripple={{ color: cores.borda }}
      style={({ pressed }) => [
        estilos.base,
        estilos[variante],
        variante === 'primario' && pressed && { backgroundColor: cores.primariaPressionada },
        inativo && estilos.inativo,
      ]}
    >
      {carregando ? (
        <ActivityIndicator color={corTexto} />
      ) : (
        <Text style={[estilos.rotulo, { color: corTexto }]}>{titulo}</Text>
      )}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  base: {
    minHeight: alvoToqueMinimo + 4,
    borderRadius: raio.md,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primario: { backgroundColor: cores.primaria },
  secundario: { borderWidth: 1.5, borderColor: cores.primaria },
  texto: {},
  rotulo: { ...tipografia.corpo, fontWeight: '700' },
  inativo: { opacity: 0.5 },
});
