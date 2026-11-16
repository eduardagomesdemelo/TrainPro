import { useLocalSearchParams } from 'expo-router';
import { ComponentRef, useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
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
  const [alturaVisivel, setAlturaVisivel] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const rolagem = useRef<ComponentRef<typeof ScrollView>>(null);
  const posicoes = useRef<Record<string, number>>({});

  // Leva o exercício aberto para o topo da área visível, longe do teclado.
  const rolarPara = useCallback((exercicioId: string) => {
    const y = posicoes.current[exercicioId];
    if (y !== undefined) {
      rolagem.current?.scrollTo({ y: Math.max(y - espacamento.md, 0), animated: true });
    }
  }, []);

  // Quando o teclado termina de abrir, o espaço visível muda; reposiciona o exercício aberto.
  useEffect(() => {
    const assinatura = Keyboard.addListener('keyboardDidShow', () => {
      if (abertoId) rolarPara(abertoId);
    });
    return () => assinatura.remove();
  }, [abertoId, rolarPara]);

  function alternarExercicio(exercicioId: string) {
    const abrir = abertoId !== exercicioId;
    setAbertoId(abrir ? exercicioId : null);
    // Espera o cartão expandir antes de rolar.
    if (abrir) setTimeout(() => rolarPara(exercicioId), 80);
  }

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
        <KeyboardAvoidingView style={estilos.tela} behavior="padding">
          <ScrollView
            ref={rolagem}
            onLayout={(e) => setAlturaVisivel(e.nativeEvent.layout.height)}
            contentContainerStyle={[
              estilos.lista,
              // Com um exercício aberto, o espaço extra permite rolá-lo até o topo mesmo sendo o último.
              abertoId !== null && { paddingBottom: alturaVisivel },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {exercicios.map((exercicio) => (
              <View
                key={exercicio.id}
                onLayout={(e) => {
                  posicoes.current[exercicio.id] = e.nativeEvent.layout.y;
                }}
              >
                <ItemExercicio
                  exercicio={exercicio}
                  series={registros.filter((r) => r.exercicioId === exercicio.id)}
                  aberto={abertoId === exercicio.id}
                  aoAlternar={() => alternarExercicio(exercicio.id)}
                  aoRegistrar={(carga, repeticoes) => aoRegistrar(exercicio.id, carga, repeticoes)}
                />
              </View>
            ))}
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  lista: { padding: espacamento.xl, gap: espacamento.md, paddingBottom: espacamento.xxl * 2 },
});
