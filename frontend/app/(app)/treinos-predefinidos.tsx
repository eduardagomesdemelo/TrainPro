import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Botao } from '../../src/components/Botao';
import { Cabecalho } from '../../src/components/Cabecalho';
import { criarTreinoPredefinido } from '../../src/features/treinos/servicoTreinos';
import {
  TreinoPredefinido,
  treinosPredefinidos,
} from '../../src/features/treinos/treinosPredefinidos';
import { cores, espacamento, raio, tipografia } from '../../src/theme/tokens';

export default function TreinosPredefinidos() {
  const router = useRouter();
  const [selecionado, setSelecionado] = useState<TreinoPredefinido | null>(null);
  const [salvando, setSalvando] = useState(false);

  async function aoSalvar() {
    if (!selecionado || salvando) return;

    setSalvando(true);
    const resultado = await criarTreinoPredefinido(selecionado);
    setSalvando(false);

    if (resultado.ok) {
      Alert.alert('Treino criado', 'Seu treino foi criado com sucesso!', [
        { text: 'OK', onPress: () => router.replace('/inicio') },
      ]);
    } else {
      Alert.alert('Erro', resultado.mensagem);
    }
  }

  return (
    <SafeAreaView style={estilos.tela}>
      <Cabecalho titulo="Treinos pré-definidos" />

      <ScrollView contentContainerStyle={estilos.lista} showsVerticalScrollIndicator={false}>
        <Text style={estilos.instrucao}>Escolha uma divisão para ver os detalhes.</Text>

        {treinosPredefinidos.map((treino) => {
          const ativo = selecionado?.id === treino.id;
          return (
            <Pressable
              key={treino.id}
              onPress={() => setSelecionado(treino)}
              accessibilityRole="radio"
              accessibilityState={{ selected: ativo }}
              accessibilityLabel={`${treino.nome}. ${treino.descricao}`}
              android_ripple={{ color: cores.borda }}
              style={[estilos.cartao, ativo && estilos.cartaoAtivo]}
            >
              <View style={estilos.cartaoTopo}>
                <View style={estilos.cartaoTextos}>
                  <Text style={estilos.cartaoTitulo}>{treino.nome}</Text>
                  <Text style={estilos.cartaoDescricao}>{treino.descricao}</Text>
                </View>
                <Ionicons
                  name={ativo ? 'checkmark-circle' : 'ellipse-outline'}
                  size={26}
                  color={ativo ? cores.primaria : cores.textoDesabilitado}
                />
              </View>

              {ativo && (
                <View style={estilos.detalhes}>
                  {treino.divisoes.map((divisao) => (
                    <View key={divisao.nome} style={estilos.divisao}>
                      <Text style={estilos.divisaoNome}>{divisao.nome}</Text>
                      <Text style={estilos.divisaoExercicios}>{divisao.exercicios.join(' · ')}</Text>
                    </View>
                  ))}
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={estilos.rodape}>
        <Botao
          titulo="Salvar treino"
          aoPressionar={aoSalvar}
          carregando={salvando}
          desabilitado={!selecionado}
        />
      </View>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  lista: { padding: espacamento.xl, gap: espacamento.md },
  instrucao: { ...tipografia.corpo, color: cores.textoSecundario, marginBottom: espacamento.sm },
  cartao: {
    padding: espacamento.lg,
    backgroundColor: cores.superficie,
    borderRadius: raio.lg,
    borderWidth: 1.5,
    borderColor: cores.borda,
  },
  cartaoAtivo: { borderColor: cores.primaria },
  cartaoTopo: { flexDirection: 'row', alignItems: 'center', gap: espacamento.md },
  cartaoTextos: { flex: 1, gap: espacamento.xs },
  cartaoTitulo: { ...tipografia.corpo, color: cores.texto, fontWeight: '700' },
  cartaoDescricao: { ...tipografia.legenda, color: cores.textoSecundario },
  detalhes: {
    marginTop: espacamento.lg,
    paddingTop: espacamento.md,
    gap: espacamento.md,
    borderTopWidth: 1,
    borderTopColor: cores.borda,
  },
  divisao: { gap: espacamento.xs },
  divisaoNome: { ...tipografia.legenda, color: cores.primaria, fontWeight: '700' },
  divisaoExercicios: { ...tipografia.legenda, color: cores.textoSecundario },
  rodape: {
    padding: espacamento.xl,
    borderTopWidth: 1,
    borderTopColor: cores.borda,
    backgroundColor: cores.fundo,
  },
});
