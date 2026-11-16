import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Botao } from '../../src/components/Botao';
import { BotaoIcone } from '../../src/components/BotaoIcone';
import { Cabecalho } from '../../src/components/Cabecalho';
import { CampoTexto } from '../../src/components/CampoTexto';
import { useDialogo } from '../../src/components/dialogo/DialogoContexto';
import { SeletorExercicios } from '../../src/features/treinos/SeletorExercicios';
import {
  MAX_SESSOES,
  NOME_TREINO_MAX,
  criarTreinoPersonalizado,
  validarNomeTreino,
} from '../../src/features/treinos/servicoTreinos';
import { alvoToqueMinimo, cores, espacamento, raio, tipografia } from '../../src/theme/tokens';

const NOME_SESSAO_MAX = 50;

type SessaoEmEdicao = {
  chave: number; // identifica a sessão na lista, mesmo quando outra é removida
  nome: string;
  exercicios: string[];
};

// Sugere "Treino A", "Treino B"... usando a primeira letra ainda não utilizada.
function proximoNomeDeSessao(sessoes: SessaoEmEdicao[]): string {
  for (let i = 0; i < MAX_SESSOES; i++) {
    const nome = `Treino ${String.fromCharCode(65 + i)}`;
    if (!sessoes.some((s) => s.nome === nome)) return nome;
  }
  return 'Novo treino';
}

export default function TreinoPersonalizado() {
  const router = useRouter();
  const { avisar, mostrarErro } = useDialogo();
  const proximaChave = useRef(1);

  const [nome, setNome] = useState('');
  const [erroNome, setErroNome] = useState<string | null>(null);
  const [sessoes, setSessoes] = useState<SessaoEmEdicao[]>([]);
  const [sessaoEmSelecao, setSessaoEmSelecao] = useState<number | null>(null);
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  function adicionarSessao() {
    if (sessoes.length >= MAX_SESSOES) {
      mostrarErro(`Um treino pode ter até ${MAX_SESSOES} sessões.`, 'Limite atingido');
      return;
    }
    setSessoes([
      ...sessoes,
      { chave: proximaChave.current++, nome: proximoNomeDeSessao(sessoes), exercicios: [] },
    ]);
  }

  function atualizarSessao(chave: number, alteracao: Partial<SessaoEmEdicao>) {
    setSessoes(sessoes.map((s) => (s.chave === chave ? { ...s, ...alteracao } : s)));
  }

  function removerSessao(chave: number) {
    setSessoes(sessoes.filter((s) => s.chave !== chave));
  }

  // Retorna a primeira mensagem de erro do formulário, ou null se estiver tudo certo.
  function validar(): string | null {
    if (sessoes.length === 0) return 'Adicione pelo menos uma sessão ao treino.';

    const semNome = sessoes.find((s) => !s.nome.trim());
    if (semNome) return 'Toda sessão precisa de um nome.';

    const semExercicio = sessoes.find((s) => s.exercicios.length === 0);
    if (semExercicio) {
      return `A sessão "${semExercicio.nome.trim()}" não tem exercícios. Escolha pelo menos um.`;
    }
    return null;
  }

  async function aoCriar() {
    if (salvando) return;

    const novoErroNome = validarNomeTreino(nome);
    const novoErroGeral = validar();
    setErroNome(novoErroNome);
    setErroGeral(novoErroGeral);
    if (novoErroNome || novoErroGeral) return;

    setSalvando(true);
    const resultado = await criarTreinoPersonalizado(
      nome,
      sessoes.map((s) => ({ nome: s.nome.trim(), exercicios: s.exercicios })),
    );
    setSalvando(false);

    if (resultado.ok) {
      avisar('Treino criado com sucesso!');
      router.replace('/inicio');
    } else {
      mostrarErro(resultado.mensagem);
    }
  }

  const sessaoAberta = sessoes.find((s) => s.chave === sessaoEmSelecao);

  return (
    <SafeAreaView style={estilos.tela}>
      <KeyboardAvoidingView
        style={estilos.tela}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Cabecalho titulo="Treino personalizado" />

        <ScrollView
          contentContainerStyle={estilos.conteudo}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <CampoTexto
            rotulo="Nome do treino"
            value={nome}
            onChangeText={setNome}
            erro={erroNome}
            placeholder="Ex.: Hipertrofia em casa"
            autoCapitalize="sentences"
            maxLength={NOME_TREINO_MAX}
            returnKeyType="done"
          />

          <View style={estilos.tituloSecao}>
            <Text style={estilos.secao} accessibilityRole="header">
              Sessões
            </Text>
            <Botao
              titulo="Adicionar sessão"
              icone="add"
              variante="secundario"
              aoPressionar={adicionarSessao}
            />
          </View>

          {sessoes.length === 0 && (
            <Text style={estilos.vazio}>
              Adicione sessões como Treino A, Treino B... e escolha os exercícios de cada uma.
            </Text>
          )}

          {sessoes.map((sessao) => (
            <View key={sessao.chave} style={estilos.cartao}>
              <View style={estilos.cartaoTopo}>
                <TextInput
                  value={sessao.nome}
                  onChangeText={(texto) => atualizarSessao(sessao.chave, { nome: texto })}
                  maxLength={NOME_SESSAO_MAX}
                  accessibilityLabel="Nome da sessão"
                  placeholderTextColor={cores.textoDesabilitado}
                  selectionColor={cores.primaria}
                  style={estilos.nomeSessao}
                />
                <BotaoIcone
                  icone="trash-outline"
                  descricao={`Remover sessão ${sessao.nome}`}
                  aoPressionar={() => removerSessao(sessao.chave)}
                />
              </View>

              {sessao.exercicios.length > 0 && (
                <View style={estilos.chips}>
                  {sessao.exercicios.map((exercicio) => (
                    <View key={exercicio} style={estilos.chip}>
                      <Text style={estilos.chipTexto}>{exercicio}</Text>
                    </View>
                  ))}
                </View>
              )}

              <Pressable
                onPress={() => setSessaoEmSelecao(sessao.chave)}
                accessibilityRole="button"
                android_ripple={{ color: cores.borda }}
                style={estilos.escolher}
              >
                <Ionicons name="barbell-outline" size={20} color={cores.primaria} />
                <Text style={estilos.escolherTexto}>
                  {sessao.exercicios.length > 0
                    ? `Editar exercícios (${sessao.exercicios.length})`
                    : 'Escolher exercícios'}
                </Text>
              </Pressable>
            </View>
          ))}

          {erroGeral && (
            <Text style={estilos.erro} accessibilityLiveRegion="polite">
              {erroGeral}
            </Text>
          )}

          <Botao
            titulo="Criar treino"
            icone="checkmark-circle-outline"
            aoPressionar={aoCriar}
            carregando={salvando}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <SeletorExercicios
        visivel={sessaoAberta !== undefined}
        selecionados={sessaoAberta?.exercicios ?? []}
        aoConfirmar={(exercicios) => {
          if (sessaoAberta) atualizarSessao(sessaoAberta.chave, { exercicios });
        }}
        aoFechar={() => setSessaoEmSelecao(null)}
      />
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: espacamento.xl, gap: espacamento.lg, paddingBottom: espacamento.xxl * 2 },
  tituloSecao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: espacamento.md,
    marginTop: espacamento.sm,
  },
  secao: { ...tipografia.subtitulo, color: cores.texto },
  vazio: { ...tipografia.corpo, color: cores.textoSecundario },
  cartao: {
    padding: espacamento.lg,
    gap: espacamento.md,
    backgroundColor: cores.superficie,
    borderRadius: raio.lg,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  cartaoTopo: { flexDirection: 'row', alignItems: 'center', gap: espacamento.sm },
  nomeSessao: {
    flex: 1,
    minHeight: alvoToqueMinimo,
    ...tipografia.corpo,
    fontWeight: '700',
    color: cores.texto,
    borderBottomWidth: 1,
    borderBottomColor: cores.borda,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: espacamento.sm },
  chip: {
    paddingHorizontal: espacamento.md,
    paddingVertical: espacamento.xs,
    borderRadius: raio.pilula,
    backgroundColor: cores.superficieElevada,
  },
  chipTexto: { ...tipografia.legenda, color: cores.texto },
  escolher: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamento.sm,
    minHeight: alvoToqueMinimo,
  },
  escolherTexto: { ...tipografia.corpo, color: cores.primaria, fontWeight: '600' },
  erro: { ...tipografia.corpo, color: cores.erro },
});
