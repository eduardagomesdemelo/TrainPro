import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Botao } from '../../components/Botao';
import { CampoRef, CampoTexto } from '../../components/CampoTexto';
import { formatarCarga } from '../../lib/formatacao';
import { cores, espacamento, raio, tipografia } from '../../theme/tokens';
import { converterCarga, validarCarga, validarRepeticoes } from './servicoRegistros';
import { Exercicio, RegistroSerie } from './tipos';

type Props = {
  exercicio: Exercicio;
  series: RegistroSerie[];
  aberto: boolean;
  aoAlternar: () => void;
  // Retorna a mensagem de erro, ou null quando a série foi registrada.
  aoRegistrar: (carga: number, repeticoes: number) => Promise<string | null>;
};

export function ItemExercicio({ exercicio, series, aberto, aoAlternar, aoRegistrar }: Props) {
  const [carga, setCarga] = useState('');
  const [repeticoes, setRepeticoes] = useState('');
  const [erroCarga, setErroCarga] = useState<string | null>(null);
  const [erroRepeticoes, setErroRepeticoes] = useState<string | null>(null);
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const refRepeticoes = useRef<CampoRef>(null);
  const feito = series.length > 0;

  async function aoSalvar() {
    if (salvando) return;
    setErroGeral(null);

    const novoErroCarga = validarCarga(carga);
    const novoErroRepeticoes = validarRepeticoes(repeticoes);
    setErroCarga(novoErroCarga);
    setErroRepeticoes(novoErroRepeticoes);
    if (novoErroCarga || novoErroRepeticoes) return;

    setSalvando(true);
    const erro = await aoRegistrar(converterCarga(carga)!, Number(repeticoes));
    setSalvando(false);

    if (erro) {
      setErroGeral(erro);
      return;
    }
    // Mantém a carga para facilitar a próxima série; limpa só as repetições.
    setRepeticoes('');
  }

  return (
    <View style={[estilos.cartao, aberto && estilos.cartaoAberto]}>
      <Pressable
        onPress={aoAlternar}
        accessibilityRole="button"
        accessibilityState={{ expanded: aberto }}
        accessibilityLabel={`${exercicio.nome}. ${series.length} séries registradas hoje`}
        android_ripple={{ color: cores.borda }}
        style={estilos.topo}
      >
        <Ionicons
          name={feito ? 'checkmark-circle' : 'barbell-outline'}
          size={24}
          color={feito ? cores.sucesso : cores.primaria}
        />
        <View style={estilos.topoTextos}>
          <Text style={estilos.nome}>{exercicio.nome}</Text>
          {feito && (
            <Text style={estilos.resumo}>
              {series.length} {series.length === 1 ? 'série' : 'séries'} hoje
            </Text>
          )}
        </View>
        <Ionicons
          name={aberto ? 'chevron-up' : 'chevron-down'}
          size={22}
          color={cores.textoSecundario}
        />
      </Pressable>

      {aberto && (
        <View style={estilos.conteudo}>
          {series.map((serie) => (
            <View key={serie.id} style={estilos.serie}>
              <Text style={estilos.serieNumero}>Série {serie.numeroSerie}</Text>
              <Text style={estilos.serieDados}>
                {formatarCarga(serie.carga)} kg × {serie.repeticoes}
              </Text>
            </View>
          ))}

          <Text style={estilos.tituloForm}>Registrar série {series.length + 1}</Text>

          <View style={estilos.linhaCampos}>
            <View style={estilos.campo}>
              <CampoTexto
                rotulo="Carga (kg)"
                value={carga}
                onChangeText={setCarga}
                erro={erroCarga}
                keyboardType="decimal-pad"
                maxLength={7}
                returnKeyType="next"
                onSubmitEditing={() => refRepeticoes.current?.focus()}
              />
            </View>
            <View style={estilos.campo}>
              <CampoTexto
                ref={refRepeticoes}
                rotulo="Repetições"
                value={repeticoes}
                onChangeText={setRepeticoes}
                erro={erroRepeticoes}
                keyboardType="number-pad"
                maxLength={3}
                returnKeyType="done"
                onSubmitEditing={aoSalvar}
              />
            </View>
          </View>

          {erroGeral && (
            <Text style={estilos.erroGeral} accessibilityLiveRegion="assertive">
              {erroGeral}
            </Text>
          )}

          <Botao titulo="Registrar série" icone="add-circle-outline" aoPressionar={aoSalvar} carregando={salvando} />
        </View>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  cartao: {
    backgroundColor: cores.superficie,
    borderRadius: raio.lg,
    borderWidth: 1.5,
    borderColor: cores.borda,
    overflow: 'hidden',
  },
  cartaoAberto: { borderColor: cores.primaria },
  topo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamento.md,
    padding: espacamento.lg,
  },
  topoTextos: { flex: 1, gap: 2 },
  nome: { ...tipografia.corpo, color: cores.texto, fontWeight: '700' },
  resumo: { ...tipografia.legenda, color: cores.sucesso },
  conteudo: {
    padding: espacamento.lg,
    paddingTop: 0,
    gap: espacamento.md,
  },
  serie: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: espacamento.sm,
    paddingHorizontal: espacamento.md,
    backgroundColor: cores.superficieElevada,
    borderRadius: raio.sm,
  },
  serieNumero: { ...tipografia.corpo, color: cores.textoSecundario },
  serieDados: { ...tipografia.corpo, color: cores.texto, fontWeight: '700' },
  tituloForm: { ...tipografia.corpo, color: cores.primaria, fontWeight: '700', marginTop: espacamento.sm },
  linhaCampos: { flexDirection: 'row', gap: espacamento.md },
  campo: { flex: 1 },
  erroGeral: { ...tipografia.legenda, color: cores.erro },
});
