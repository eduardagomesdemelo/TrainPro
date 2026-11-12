import { Ionicons } from '@expo/vector-icons';
import { ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { cores, espacamento, tipografia } from '../theme/tokens';
import { Botao } from './Botao';

type Props = {
  icone: ComponentProps<typeof Ionicons>['name'];
  titulo: string;
  descricao?: string;
  // Ação opcional, usada em estados de erro ("Tentar novamente").
  acao?: { titulo: string; aoPressionar: () => void };
};

// Mensagem centralizada para telas vazias ou com erro.
export function EstadoMensagem({ icone, titulo, descricao, acao }: Props) {
  return (
    <View style={estilos.container}>
      <Ionicons name={icone} size={56} color={cores.textoDesabilitado} />
      <Text style={estilos.titulo}>{titulo}</Text>
      {descricao && <Text style={estilos.descricao}>{descricao}</Text>}
      {acao && (
        <View style={estilos.acao}>
          <Botao titulo={acao.titulo} variante="secundario" aoPressionar={acao.aoPressionar} />
        </View>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  container: { alignItems: 'center', padding: espacamento.xl, gap: espacamento.sm },
  titulo: { ...tipografia.subtitulo, color: cores.texto, textAlign: 'center' },
  descricao: { ...tipografia.corpo, color: cores.textoSecundario, textAlign: 'center' },
  acao: { marginTop: espacamento.md, alignSelf: 'stretch' },
});
