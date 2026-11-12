import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Botao } from '../../components/Botao';
import { BotaoIcone } from '../../components/BotaoIcone';
import { CampoTexto } from '../../components/CampoTexto';
import { alvoToqueMinimo, cores, espacamento, raio, tipografia } from '../../theme/tokens';
import {
  ExercicioCatalogo,
  GRUPOS_MUSCULARES,
  GrupoMuscular,
  catalogoExercicios,
} from './catalogoExercicios';
import { MAX_EXERCICIOS_POR_SESSAO } from './servicoTreinos';

const NOME_EXERCICIO_MAX = 60;

type Props = {
  visivel: boolean;
  selecionados: string[];
  aoConfirmar: (exercicios: string[]) => void;
  aoFechar: () => void;
};

// Escolha de exercícios por grupo muscular, com opção de criar um exercício próprio.
export function SeletorExercicios({ visivel, selecionados, aoConfirmar, aoFechar }: Props) {
  const [marcados, setMarcados] = useState<string[]>(selecionados);
  const [grupoAtivo, setGrupoAtivo] = useState<GrupoMuscular>(GRUPOS_MUSCULARES[0]);
  // Exercícios criados pelo usuário ficam disponíveis enquanto o treino está sendo montado.
  const [proprios, setProprios] = useState<ExercicioCatalogo[]>([]);
  const [criando, setCriando] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novoGrupo, setNovoGrupo] = useState<GrupoMuscular | null>(null);
  const [erroNovo, setErroNovo] = useState<string | null>(null);

  // A cada abertura, parte da seleção atual da sessão.
  useEffect(() => {
    if (visivel) {
      setMarcados(selecionados);
      cancelarCriacao();
    }
  }, [visivel]);

  function cancelarCriacao() {
    setCriando(false);
    setNovoNome('');
    setNovoGrupo(null);
    setErroNovo(null);
  }

  function alternar(nome: string) {
    if (marcados.includes(nome)) {
      setMarcados(marcados.filter((n) => n !== nome));
    } else if (marcados.length >= MAX_EXERCICIOS_POR_SESSAO) {
      Alert.alert('Limite atingido', `Cada sessão pode ter até ${MAX_EXERCICIOS_POR_SESSAO} exercícios.`);
    } else {
      setMarcados([...marcados, nome]);
    }
  }

  function adicionarProprio() {
    const nome = novoNome.trim();
    const todos = [...catalogoExercicios, ...proprios];

    if (!nome) return setErroNovo('Digite o nome do exercício.');
    if (!novoGrupo) return setErroNovo('Escolha o grupo muscular.');
    if (todos.some((e) => e.nome.toLowerCase() === nome.toLowerCase())) {
      return setErroNovo('Já existe um exercício com esse nome.');
    }
    if (marcados.length >= MAX_EXERCICIOS_POR_SESSAO) {
      return setErroNovo(`Cada sessão pode ter até ${MAX_EXERCICIOS_POR_SESSAO} exercícios.`);
    }

    setProprios([...proprios, { nome, grupo: novoGrupo }]);
    setMarcados([...marcados, nome]);
    setGrupoAtivo(novoGrupo);
    cancelarCriacao();
  }

  function confirmar() {
    aoConfirmar(marcados);
    aoFechar();
  }

  const exerciciosDoGrupo = [...catalogoExercicios, ...proprios].filter(
    (e) => e.grupo === grupoAtivo,
  );

  return (
    <Modal visible={visivel} animationType="slide" onRequestClose={aoFechar}>
      <SafeAreaView style={estilos.tela}>
        <View style={estilos.cabecalho}>
          <BotaoIcone icone="close" descricao="Fechar sem salvar" aoPressionar={aoFechar} />
          <Text style={estilos.titulo} accessibilityRole="header">
            Exercícios
          </Text>
          <View style={estilos.confirmar}>
            <Botao
              titulo={`Confirmar ${marcados.length} exercícios`}
              icone="checkmark"
              apenasIcone
              aoPressionar={confirmar}
            />
          </View>
        </View>

        <FlatList
          horizontal
          data={[...GRUPOS_MUSCULARES]}
          keyExtractor={(grupo) => grupo}
          showsHorizontalScrollIndicator={false}
          style={estilos.abas}
          contentContainerStyle={estilos.abasConteudo}
          renderItem={({ item }) => {
            const ativo = item === grupoAtivo;
            return (
              <Pressable
                onPress={() => setGrupoAtivo(item)}
                accessibilityRole="tab"
                accessibilityState={{ selected: ativo }}
                style={[estilos.aba, ativo && estilos.abaAtiva]}
              >
                <Text style={[estilos.abaTexto, ativo && estilos.abaTextoAtivo]}>{item}</Text>
              </Pressable>
            );
          }}
        />

        {criando ? (
          <View style={estilos.formulario}>
            <CampoTexto
              rotulo="Nome do exercício"
              value={novoNome}
              onChangeText={setNovoNome}
              maxLength={NOME_EXERCICIO_MAX}
              autoCapitalize="sentences"
            />
            <View style={estilos.grupos}>
              {GRUPOS_MUSCULARES.map((grupo) => {
                const ativo = novoGrupo === grupo;
                return (
                  <Pressable
                    key={grupo}
                    onPress={() => setNovoGrupo(grupo)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: ativo }}
                    style={[estilos.aba, ativo && estilos.abaAtiva]}
                  >
                    <Text style={[estilos.abaTexto, ativo && estilos.abaTextoAtivo]}>{grupo}</Text>
                  </Pressable>
                );
              })}
            </View>
            {erroNovo && (
              <Text style={estilos.erro} accessibilityLiveRegion="polite">
                {erroNovo}
              </Text>
            )}
            <View style={estilos.acoesFormulario}>
              <View style={estilos.acao}>
                <Botao titulo="Cancelar" variante="secundario" aoPressionar={cancelarCriacao} />
              </View>
              <View style={estilos.acao}>
                <Botao titulo="Adicionar" aoPressionar={adicionarProprio} />
              </View>
            </View>
          </View>
        ) : (
          <Pressable
            onPress={() => setCriando(true)}
            accessibilityRole="button"
            style={estilos.criar}
          >
            <Ionicons name="add-circle-outline" size={22} color={cores.primaria} />
            <Text style={estilos.criarTexto}>Criar exercício personalizado</Text>
          </Pressable>
        )}

        <FlatList
          data={exerciciosDoGrupo}
          keyExtractor={(exercicio) => exercicio.nome}
          contentContainerStyle={estilos.lista}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => {
            const marcado = marcados.includes(item.nome);
            return (
              <Pressable
                onPress={() => alternar(item.nome)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: marcado }}
                android_ripple={{ color: cores.borda }}
                style={[estilos.item, marcado && estilos.itemMarcado]}
              >
                <Ionicons
                  name={marcado ? 'checkbox' : 'square-outline'}
                  size={24}
                  color={marcado ? cores.primaria : cores.textoSecundario}
                />
                <Text style={estilos.itemNome}>{item.nome}</Text>
              </Pressable>
            );
          }}
        />
      </SafeAreaView>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: espacamento.lg,
    paddingVertical: espacamento.md,
  },
  titulo: { ...tipografia.subtitulo, color: cores.texto },
  confirmar: { width: alvoToqueMinimo + 16 },
  abas: { flexGrow: 0 },
  abasConteudo: { paddingHorizontal: espacamento.lg, gap: espacamento.sm },
  aba: {
    paddingHorizontal: espacamento.lg,
    paddingVertical: espacamento.sm,
    borderRadius: raio.pilula,
    borderWidth: 1.5,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
  },
  abaAtiva: { borderColor: cores.primaria, backgroundColor: cores.superficieElevada },
  abaTexto: { ...tipografia.legenda, color: cores.textoSecundario, fontWeight: '600' },
  abaTextoAtivo: { color: cores.primaria },
  criar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamento.sm,
    minHeight: alvoToqueMinimo,
    paddingHorizontal: espacamento.xl,
    marginTop: espacamento.sm,
  },
  criarTexto: { ...tipografia.corpo, color: cores.primaria, fontWeight: '600' },
  formulario: { padding: espacamento.xl, gap: espacamento.md },
  grupos: { flexDirection: 'row', flexWrap: 'wrap', gap: espacamento.sm },
  erro: { ...tipografia.legenda, color: cores.erro },
  acoesFormulario: { flexDirection: 'row', gap: espacamento.md },
  acao: { flex: 1 },
  lista: { padding: espacamento.lg, gap: espacamento.sm },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamento.md,
    minHeight: alvoToqueMinimo + 4,
    paddingHorizontal: espacamento.lg,
    backgroundColor: cores.superficie,
    borderRadius: raio.md,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  itemMarcado: { borderColor: cores.primaria },
  itemNome: { ...tipografia.corpo, color: cores.texto, flex: 1 },
});
