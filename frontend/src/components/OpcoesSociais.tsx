import { Alert, StyleSheet, Text, View } from 'react-native';

import { cores, espacamento, tipografia } from '../theme/tokens';
import { BotaoSocial } from './BotaoSocial';

type Props = {
  acao: 'Cadastrar' | 'Entrar';
};

export function OpcoesSociais({ acao }: Props) {
  function avisarEmBreve(forma: string) {
    Alert.alert('Em breve', `O acesso com ${forma} estará disponível em breve.`);
  }

  return (
    <View>
      <View style={estilos.separador}>
        <View style={estilos.linha} />
        <Text style={estilos.separadorTexto}>ou continue com</Text>
        <View style={estilos.linha} />
      </View>

      <View style={estilos.botoes}>
        <BotaoSocial
          icone="logo-google"
          descricao={`${acao} com Google`}
          aoPressionar={() => avisarEmBreve('Google')}
        />
        <BotaoSocial
          icone="logo-facebook"
          descricao={`${acao} com Facebook`}
          aoPressionar={() => avisarEmBreve('Facebook')}
        />
        <BotaoSocial
          icone="call-outline"
          descricao={`${acao} com telefone`}
          aoPressionar={() => avisarEmBreve('telefone')}
        />
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  separador: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamento.md,
    marginTop: espacamento.xl,
  },
  linha: { flex: 1, height: 1, backgroundColor: cores.borda },
  separadorTexto: { ...tipografia.legenda, color: cores.textoSecundario },
  botoes: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: espacamento.lg,
    marginTop: espacamento.lg,
  },
});
