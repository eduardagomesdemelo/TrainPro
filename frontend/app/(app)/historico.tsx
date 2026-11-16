import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Cabecalho } from '../../src/components/Cabecalho';
import { EstadoMensagem } from '../../src/components/EstadoMensagem';
import { DiaDeTreino, listarDiasDeTreino } from '../../src/features/historico/servicoHistorico';
import { diaDaSemana, formatarDia } from '../../src/lib/formatacao';
import { cores, espacamento, raio, tipografia } from '../../src/theme/tokens';

export default function Historico() {
  const router = useRouter();
  const [dias, setDias] = useState<DiaDeTreino[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setErro(null);
    const resultado = await listarDiasDeTreino();
    if (resultado.ok) setDias(resultado.dados);
    else setErro(resultado.mensagem);
    setCarregando(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  return (
    <SafeAreaView style={estilos.tela}>
      <Cabecalho titulo="Histórico" />

      {carregando ? (
        <View style={estilos.centro}>
          <ActivityIndicator size="large" color={cores.primaria} />
        </View>
      ) : erro ? (
        <EstadoMensagem
          icone="cloud-offline-outline"
          titulo="Algo deu errado"
          descricao={erro}
          acao={{ titulo: 'Tentar novamente', aoPressionar: carregar }}
        />
      ) : dias.length === 0 ? (
        <EstadoMensagem
          icone="calendar-outline"
          titulo="Nenhum treino registrado"
          descricao="Registre séries em um treino e os dias em que você treinou aparecem aqui."
        />
      ) : (
        <FlatList
          data={dias}
          keyExtractor={(item) => item.dia}
          contentContainerStyle={estilos.lista}
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                router.push({ pathname: '/historico/[dia]', params: { dia: item.dia } })
              }
              accessibilityRole="button"
              accessibilityLabel={`Treino de ${diaDaSemana(item.dia)}, ${formatarDia(item.dia)}, ${item.totalExercicios} exercícios`}
              android_ripple={{ color: cores.borda }}
              style={estilos.cartao}
            >
              <View style={estilos.icone}>
                <Ionicons name="calendar-outline" size={24} color={cores.primaria} />
              </View>
              <View style={estilos.textos}>
                <Text style={estilos.data}>{formatarDia(item.dia)}</Text>
                <Text style={estilos.detalhe}>
                  {diaDaSemana(item.dia)} · {item.totalExercicios}{' '}
                  {item.totalExercicios === 1 ? 'exercício' : 'exercícios'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color={cores.textoSecundario} />
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  lista: { padding: espacamento.xl, gap: espacamento.md },
  cartao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamento.lg,
    padding: espacamento.lg,
    backgroundColor: cores.superficie,
    borderRadius: raio.lg,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  icone: {
    width: 48,
    height: 48,
    borderRadius: raio.md,
    backgroundColor: cores.superficieElevada,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textos: { flex: 1, gap: espacamento.xs },
  data: { ...tipografia.corpo, color: cores.texto, fontWeight: '700' },
  detalhe: { ...tipografia.legenda, color: cores.textoSecundario },
});
