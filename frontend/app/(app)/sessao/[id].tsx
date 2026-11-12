import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Cabecalho } from '../../../src/components/Cabecalho';
import { EstadoMensagem } from '../../../src/components/EstadoMensagem';
import { ItemExercicio } from '../../../src/features/treinos/ItemExercicio';
import {
  listarRegistrosDeHoje,
  registrarSerie,
} from '../../../src/features/treinos/servicoRegistros';
import { listarExercicios } from '../../../src/features/treinos/servicoTreinos';
import { Exercicio, RegistroSerie } from '../../../src/features/treinos/tipos';
import { cores, espacamento } from '../../../src/theme/tokens';

export default function Sessao() {
  const { id, nome } = useLocalSearchParams<{ id: string; nome?: string }>();

  const [exercicios, setExercicios] = useState<Exercicio[]>([]);
  const [registros, setRegistros] = useState<RegistroSerie[]>([]);
  const [abertoId, setAbertoId] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);

    const [resExercicios, resRegistros] = await Promise.all([
      listarExercicios(id),
      listarRegistrosDeHoje(id),
    ]);

    if (!resExercicios.ok) setErro(resExercicios.mensagem);
    else if (!resRegistros.ok) setErro(resRegistros.mensagem);
    else {
      setExercicios(resExercicios.dados);
      setRegistros(resRegistros.dados);
    }
    setCarregando(false);
  }, [id]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function aoRegistrar(exercicioId: string, carga: number, repeticoes: number) {
    const resultado = await registrarSerie({ exercicioId, carga, repeticoes });
    if (!resultado.ok) return resultado.mensagem;

    setRegistros((anteriores) => [...anteriores, resultado.dados]);
    return null;
  }

  return (
    <SafeAreaView style={estilos.tela}>
      <Cabecalho titulo={nome ?? 'Sessão'} />

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
      ) : exercicios.length === 0 ? (
        <EstadoMensagem
          icone="barbell-outline"
          titulo="Sem exercícios"
          descricao="Esta sessão ainda não tem exercícios."
        />
      ) : (
        <ScrollView
          contentContainerStyle={estilos.lista}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {exercicios.map((exercicio) => (
            <ItemExercicio
              key={exercicio.id}
              exercicio={exercicio}
              series={registros.filter((r) => r.exercicioId === exercicio.id)}
              aberto={abertoId === exercicio.id}
              aoAlternar={() => setAbertoId(abertoId === exercicio.id ? null : exercicio.id)}
              aoRegistrar={(carga, repeticoes) => aoRegistrar(exercicio.id, carga, repeticoes)}
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  lista: { padding: espacamento.xl, gap: espacamento.md, paddingBottom: espacamento.xxl * 2 },
});
