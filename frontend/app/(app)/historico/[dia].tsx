import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BotaoIcone } from '../../../src/components/BotaoIcone';
import { Cabecalho } from '../../../src/components/Cabecalho';
import { EstadoMensagem } from '../../../src/components/EstadoMensagem';
import { ModalEdicaoSerie } from '../../../src/features/historico/ModalEdicaoSerie';
import {
  ExercicioDoDia,
  SerieDoHistorico,
  detalharDia,
} from '../../../src/features/historico/servicoHistorico';
import { editarSerie } from '../../../src/features/treinos/servicoRegistros';
import { diaDaSemana, formatarCarga, formatarDia } from '../../../src/lib/formatacao';
import { cores, espacamento, raio, tipografia } from '../../../src/theme/tokens';

type SerieEmEdicao = { exercicio: string; serie: SerieDoHistorico };

export default function HistoricoDoDia() {
  const { dia } = useLocalSearchParams<{ dia: string }>();

  const [exercicios, setExercicios] = useState<ExercicioDoDia[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [emEdicao, setEmEdicao] = useState<SerieEmEdicao | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    const resultado = await detalharDia(dia);
    if (resultado.ok) setExercicios(resultado.dados);
    else setErro(resultado.mensagem);
    setCarregando(false);
  }, [dia]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function salvarEdicao(carga: number, repeticoes: number): Promise<string | null> {
    if (!emEdicao) return null;

    const resultado = await editarSerie({ serieId: emEdicao.serie.id, carga, repeticoes });
    if (!resultado.ok) return resultado.mensagem;

    // Atualiza só a série alterada na tela, sem recarregar o dia inteiro.
    setExercicios((anteriores) =>
      anteriores.map((exercicio) => ({
        ...exercicio,
        series: exercicio.series.map((serie) =>
          serie.id === emEdicao.serie.id ? { ...serie, carga, repeticoes } : serie,
        ),
      })),
    );
    return null;
  }

  const totalSeries = exercicios.reduce((soma, e) => soma + e.series.length, 0);

  return (
    <SafeAreaView style={estilos.tela}>
      <Cabecalho titulo={formatarDia(dia)} />

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
          icone="calendar-outline"
          titulo="Sem registros"
          descricao="Não há séries registradas neste dia."
        />
      ) : (
        <ScrollView contentContainerStyle={estilos.lista} showsVerticalScrollIndicator={false}>
          <Text style={estilos.resumo}>
            {diaDaSemana(dia)} · {exercicios.length}{' '}
            {exercicios.length === 1 ? 'exercício' : 'exercícios'} · {totalSeries}{' '}
            {totalSeries === 1 ? 'série' : 'séries'}
          </Text>

          {exercicios.map((exercicio) => (
            <View key={exercicio.exercicioId} style={estilos.cartao}>
              <Text style={estilos.nome}>{exercicio.exercicio}</Text>
              <Text style={estilos.origem}>
                {exercicio.treino} · {exercicio.sessao}
              </Text>

              <View style={estilos.series}>
                {exercicio.series.map((serie) => (
                  <View key={serie.id} style={estilos.serie}>
                    <Text style={estilos.serieNumero}>Série {serie.numeroSerie}</Text>
                    <Text style={estilos.serieDados}>
                      {formatarCarga(serie.carga)} kg × {serie.repeticoes}
                    </Text>
                    <BotaoIcone
                      icone="create-outline"
                      descricao={`Editar série ${serie.numeroSerie} de ${exercicio.exercicio}`}
                      aoPressionar={() => setEmEdicao({ exercicio: exercicio.exercicio, serie })}
                    />
                  </View>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <ModalEdicaoSerie
        visivel={emEdicao !== null}
        exercicio={emEdicao?.exercicio ?? ''}
        numeroSerie={emEdicao?.serie.numeroSerie ?? 0}
        cargaInicial={emEdicao?.serie.carga ?? 0}
        repeticoesInicial={emEdicao?.serie.repeticoes ?? 0}
        aoSalvar={salvarEdicao}
        aoFechar={() => setEmEdicao(null)}
      />
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  lista: { padding: espacamento.xl, gap: espacamento.md, paddingBottom: espacamento.xxl },
  resumo: { ...tipografia.corpo, color: cores.textoSecundario, marginBottom: espacamento.sm },
  cartao: {
    padding: espacamento.lg,
    gap: espacamento.xs,
    backgroundColor: cores.superficie,
    borderRadius: raio.lg,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  nome: { ...tipografia.corpo, color: cores.texto, fontWeight: '700' },
  origem: { ...tipografia.legenda, color: cores.primaria },
  series: { gap: espacamento.sm, marginTop: espacamento.md },
  serie: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: espacamento.md,
    backgroundColor: cores.superficieElevada,
    borderRadius: raio.sm,
  },
  serieNumero: { ...tipografia.corpo, color: cores.textoSecundario, flex: 1 },
  serieDados: { ...tipografia.corpo, color: cores.texto, fontWeight: '700' },
});
