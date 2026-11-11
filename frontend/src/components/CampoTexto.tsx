import { Ionicons } from '@expo/vector-icons';
import { ComponentRef, Ref, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { alvoToqueMinimo, cores, espacamento, raio, tipografia } from '../theme/tokens';

export type CampoRef = ComponentRef<typeof TextInput>;

type Props = Omit<TextInputProps, 'style'> & {
  rotulo: string;
  erro?: string | null;
  dica?: string;
  senha?: boolean;
  ref?: Ref<CampoRef>;
};

export function CampoTexto({ rotulo, erro, dica, senha = false, ref, ...resto }: Props) {
  const [focado, setFocado] = useState(false);
  const [visivel, setVisivel] = useState(false);

  return (
    <View style={estilos.container}>
      <Text style={estilos.rotulo}>{rotulo}</Text>

      <View style={[estilos.caixa, focado && estilos.focado, !!erro && estilos.comErro]}>
        <TextInput
          ref={ref}
          {...resto}
          style={estilos.input}
          placeholderTextColor={cores.textoDesabilitado}
          selectionColor={cores.primaria}
          secureTextEntry={senha && !visivel}
          accessibilityLabel={rotulo}
          onFocus={(e) => {
            setFocado(true);
            resto.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocado(false);
            resto.onBlur?.(e);
          }}
        />
        {senha && (
          <Pressable
            onPress={() => setVisivel((v) => !v)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={visivel ? 'Ocultar senha' : 'Mostrar senha'}
            style={estilos.olho}
          >
            <Ionicons
              name={visivel ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color={cores.textoSecundario}
            />
          </Pressable>
        )}
      </View>

      {erro ? (
        <Text style={estilos.erro} accessibilityLiveRegion="polite">
          {erro}
        </Text>
      ) : dica ? (
        <Text style={estilos.dica}>{dica}</Text>
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  container: { gap: espacamento.xs },
  rotulo: { ...tipografia.legenda, color: cores.textoSecundario, fontWeight: '600' },
  caixa: {
    minHeight: alvoToqueMinimo + 4,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cores.superficie,
    borderWidth: 1.5,
    borderColor: cores.borda,
    borderRadius: raio.md,
    paddingHorizontal: espacamento.lg,
  },
  focado: { borderColor: cores.primaria },
  comErro: { borderColor: cores.erro },
  input: { flex: 1, ...tipografia.corpo, color: cores.texto, paddingVertical: espacamento.md },
  olho: { paddingLeft: espacamento.md },
  erro: { ...tipografia.legenda, color: cores.erro },
  dica: { ...tipografia.legenda, color: cores.textoSecundario },
});
