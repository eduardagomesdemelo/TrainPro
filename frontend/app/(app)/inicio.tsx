import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '../../src/components/Avatar';
import { BotaoIcone } from '../../src/components/BotaoIcone';
import { useDialogo } from '../../src/components/dialogo/DialogoContexto';
import { EstadoMensagem } from '../../src/components/EstadoMensagem';
import { sair } from '../../src/features/auth/servicoAutenticacao';
import { Perfil, carregarPerfil } from '../../src/features/perfil/servicoPerfil';
import { excluirTreino, listarTreinos } from '../../src/features/treinos/servicoTreinos';
import { Treino } from '../../src/features/treinos/tipos';
import { cores, espacamento, raio, tipografia } from '../../src/theme/tokens';

export default function Inicio() {
  const router = useRouter();
  const { confirmar, mostrarErro } = useDialogo();
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [treinos, setTreinos] = useState<Treino[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setErro(null);

    const [resTreinos, resPerfil] = await Promise.all([listarTreinos(), carregarPerfil()]);

    if (resTreinos.ok) setTreinos(resTreinos.dados);
    else setErro(resTreinos.mensagem);
    if (resPerfil.ok) setPerfil(resPerfil.dados);
    setCarregando(false);
  }, []);

  // Recarrega ao voltar para a tela, para mostrar treinos recém-criados.
  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  async function confirmarExclusao(treino: Treino) {
    const confirmou = await confirmar({
      titulo: 'Excluir treino',
      mensagem: `Deseja excluir "${treino.nome}"? As sessões, os exercícios e os registros dele também serão apagados.`,
      textoConfirmar: 'Excluir',
      perigoso: true,
    });
    if (confirmou) excluir(treino);
  }

  async function excluir(treino: Treino) {
    const resultado = await excluirTreino(treino.id);
    if (resultado.ok) {
      setTreinos((anteriores) => anteriores.filter((t) => t.id !== treino.id));
    } else {
      mostrarErro(resultado.mensagem);
    }
  }

  async function aoSair() {
    await sair();
    router.replace('/entrar');
  }

  return (
    <SafeAreaView style={estilos.tela}>
      <View style={estilos.cabecalho}>
        <Pressable
          onPress={() => router.push('/perfil')}
          accessibilityRole="button"
          accessibilityLabel="Abrir meu perfil"
          hitSlop={8}
        >
          <Avatar nome={perfil?.nome ?? ''} fotoUrl={perfil?.fotoUrl} tamanho={48} />
        </Pressable>
        <Text style={estilos.titulo} accessibilityRole="header">
          Seus treinos
        </Text>
        <BotaoIcone icone="log-out-outline" descricao="Sair da conta" aoPressionar={aoSair} />
      </View>

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
      ) : treinos.length === 0 ? (
        <EstadoMensagem
          icone="barbell-outline"
          titulo="Nenhum treino ainda"
          descricao="Toque em Novo treino para criar o seu primeiro programa."
        />
      ) : (
        <FlatList
          data={treinos}
          keyExtractor={(treino) => treino.id}
          contentContainerStyle={estilos.lista}
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                router.push({ pathname: '/treino/[id]', params: { id: item.id, nome: item.nome } })
              }
              accessibilityRole="button"
              accessibilityLabel={`${item.nome}, treino ${item.tipo}`}
              android_ripple={{ color: cores.borda }}
              style={estilos.cartao}
            >
              <View style={estilos.icone}>
                <Ionicons name="barbell-outline" size={26} color={cores.primaria} />
              </View>
              <View style={estilos.textos}>
                <Text style={estilos.nomeTreino} numberOfLines={1}>
                  {item.nome}
                </Text>
                <Text style={estilos.tipo}>
                  {item.tipo === 'predefinido' ? 'Pré-definido' : 'Personalizado'}
                </Text>
              </View>
              <BotaoIcone
                icone="trash-outline"
                descricao={`Excluir treino ${item.nome}`}
                aoPressionar={() => confirmarExclusao(item)}
              />
            </Pressable>
          )}
        />
      )}

      <View style={estilos.rodape}>
        <View style={estilos.coluna}>
          <BotaoIcone
            icone="time-outline"
            descricao="Histórico de treinos"
            aoPressionar={() => router.push('/historico')}
          />
        </View>
        <View style={estilos.coluna}>
          <BotaoIcone
            icone="locate-outline"
            descricao="Minhas metas"
            aoPressionar={() => router.push('/metas')}
          />
        </View>
        <View style={estilos.coluna}>
          <BotaoIcone
            icone="play-circle-outline"
            descricao="Vídeos de exercícios"
            aoPressionar={() => router.push('/videos')}
          />
        </View>
        <View style={estilos.coluna}>
          <BotaoIcone
            icone="add"
            descricao="Novo treino"
            variante="destaque"
            aoPressionar={() => router.push('/novo-treino')}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: espacamento.xl,
    paddingVertical: espacamento.lg,
  },
  titulo: { ...tipografia.titulo, color: cores.texto, flex: 1, marginLeft: espacamento.lg },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  lista: {
    padding: espacamento.xl,
    paddingTop: espacamento.sm,
    gap: espacamento.md,
  },
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
    width: 52,
    height: 52,
    borderRadius: raio.md,
    backgroundColor: cores.superficieElevada,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textos: { flex: 1, gap: espacamento.xs },
  nomeTreino: { ...tipografia.corpo, color: cores.texto, fontWeight: '700' },
  tipo: { ...tipografia.legenda, color: cores.textoSecundario },
  rodape: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: espacamento.md,
    borderTopWidth: 1,
    borderTopColor: cores.borda,
    backgroundColor: cores.fundo,
  },
  coluna: { flex: 1, alignItems: 'center' },
});
