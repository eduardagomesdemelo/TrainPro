import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { BotaoIcone } from '../../components/BotaoIcone';
import { formatarData } from '../../lib/formatacao';
import { alvoToqueMinimo, cores, espacamento, raio, tipografia } from '../../theme/tokens';
import { Meta } from './servicoMetas';

type Props = {
  meta: Meta;
  // Quando verdadeiro, toca a animação de "Concluído!" sobre o cartão.
  animarConclusao: boolean;
  aoTerminarAnimacao: () => void;
  aoAlternarConclusao: () => void;
  aoExcluir: () => void;
};

export function ItemMeta({
  meta,
  animarConclusao,
  aoTerminarAnimacao,
  aoAlternarConclusao,
  aoExcluir,
}: Props) {
  const larguraFaixa = useRef(new Animated.Value(0)).current;
  const opacidadeFaixa = useRef(new Animated.Value(0)).current;
  const opacidadeTexto = useRef(new Animated.Value(0)).current;

  // A faixa verde avança da esquerda para a direita, mostra "Concluído!" e some.
  // A largura não suporta o driver nativo, por isso useNativeDriver é false.
  useEffect(() => {
    if (!animarConclusao) return;

    larguraFaixa.setValue(0);
    opacidadeFaixa.setValue(0);
    opacidadeTexto.setValue(0);

    Animated.sequence([
      Animated.parallel([
        Animated.timing(larguraFaixa, { toValue: 1, duration: 600, useNativeDriver: false }),
        Animated.timing(opacidadeFaixa, { toValue: 1, duration: 300, useNativeDriver: false }),
      ]),
      Animated.timing(opacidadeTexto, { toValue: 1, duration: 250, useNativeDriver: false }),
      Animated.delay(900),
      Animated.timing(opacidadeFaixa, { toValue: 0, duration: 400, useNativeDriver: false }),
    ]).start(aoTerminarAnimacao);
  }, [animarConclusao]);

  return (
    <View style={estilos.cartao}>
      <Pressable
        onPress={aoAlternarConclusao}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: meta.concluida }}
        accessibilityLabel={
          meta.concluida
            ? `Desmarcar meta ${meta.titulo} como concluída`
            : `Marcar meta ${meta.titulo} como concluída`
        }
        hitSlop={8}
        style={estilos.marcador}
      >
        <Ionicons
          name={meta.concluida ? 'checkmark-circle' : 'ellipse-outline'}
          size={28}
          color={meta.concluida ? cores.sucesso : cores.textoSecundario}
        />
      </Pressable>

      <View style={estilos.textos}>
        <Text style={[estilos.titulo, meta.concluida && estilos.tituloConcluido]}>
          {meta.titulo}
        </Text>
        {meta.descricao && <Text style={estilos.descricao}>{meta.descricao}</Text>}
        <Text style={estilos.data}>Criada em {formatarData(meta.criadoEm)}</Text>
      </View>

      <BotaoIcone
        icone="trash-outline"
        descricao={`Excluir meta ${meta.titulo}`}
        aoPressionar={aoExcluir}
      />

      {animarConclusao && (
        <Animated.View
          pointerEvents="none"
          style={[
            estilos.faixa,
            {
              opacity: opacidadeFaixa,
              width: larguraFaixa.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
            },
          ]}
        >
          <Animated.View style={[estilos.faixaConteudo, { opacity: opacidadeTexto }]}>
            <Ionicons name="checkmark-circle" size={22} color={cores.fundo} />
            <Text style={estilos.faixaTexto}>Concluído!</Text>
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  cartao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamento.md,
    padding: espacamento.lg,
    backgroundColor: cores.superficie,
    borderRadius: raio.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    overflow: 'hidden',
  },
  marcador: {
    width: alvoToqueMinimo - 8,
    height: alvoToqueMinimo - 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textos: { flex: 1, gap: espacamento.xs },
  titulo: { ...tipografia.corpo, color: cores.texto, fontWeight: '700' },
  tituloConcluido: { color: cores.textoSecundario, textDecorationLine: 'line-through' },
  descricao: { ...tipografia.corpo, color: cores.textoSecundario },
  data: { ...tipografia.legenda, color: cores.textoDesabilitado },
  faixa: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: cores.sucesso,
    justifyContent: 'center',
  },
  faixaConteudo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: espacamento.sm,
  },
  faixaTexto: { ...tipografia.subtitulo, color: cores.fundo, fontWeight: '800' },
});
