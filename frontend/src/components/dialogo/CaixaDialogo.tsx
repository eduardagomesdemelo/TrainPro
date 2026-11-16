import { Ionicons } from '@expo/vector-icons';
import { ComponentProps } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { cores, espacamento, raio, tipografia } from '../../theme/tokens';
import { Botao } from '../Botao';

type NomeIcone = ComponentProps<typeof Ionicons>['name'];

export type OpcaoDaLista = {
  texto: string;
  icone: NomeIcone;
  aoEscolher: () => void;
};

export type ConteudoDaCaixa =
  | {
      tipo: 'confirmar';
      titulo: string;
      mensagem: string;
      textoConfirmar: string;
      perigoso: boolean;
    }
  | { tipo: 'mensagem'; variante: 'erro' | 'info'; titulo: string; mensagem: string; textoBotao: string }
  | { tipo: 'opcoes'; titulo: string; mensagem?: string; opcoes: OpcaoDaLista[] };

type Props = {
  conteudo: ConteudoDaCaixa | null;
  // Chamado ao tocar em um botão ou fora da caixa; "confirmou" só é verdadeiro no botão de confirmar.
  aoFechar: (confirmou: boolean) => void;
};

function Icone({ nome, cor }: { nome: NomeIcone; cor: string }) {
  return (
    <View style={[estilos.iconeFundo, { borderColor: cor }]}>
      <Ionicons name={nome} size={30} color={cor} />
    </View>
  );
}

// Caixa de diálogo no visual do app, usada no lugar do alerta nativo do Android.
export function CaixaDialogo({ conteudo, aoFechar }: Props) {
  return (
    <Modal
      visible={conteudo !== null}
      transparent
      animationType="fade"
      onRequestClose={() => aoFechar(false)}
      statusBarTranslucent
      navigationBarTranslucent
    >
      <View style={estilos.fundo}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => aoFechar(false)}
          accessibilityLabel="Fechar"
        />

        {conteudo && (
          <View style={estilos.caixa} accessibilityViewIsModal>
            {conteudo.tipo === 'confirmar' && (
              <Icone
                nome={conteudo.perigoso ? 'trash-outline' : 'help-circle-outline'}
                cor={conteudo.perigoso ? cores.erro : cores.primaria}
              />
            )}
            {conteudo.tipo === 'mensagem' && (
              <Icone
                nome={conteudo.variante === 'erro' ? 'alert-circle-outline' : 'information-circle-outline'}
                cor={conteudo.variante === 'erro' ? cores.erro : cores.primaria}
              />
            )}

            <Text style={estilos.titulo} accessibilityRole="header">
              {conteudo.titulo}
            </Text>
            {conteudo.mensagem && <Text style={estilos.mensagem}>{conteudo.mensagem}</Text>}

            {conteudo.tipo === 'confirmar' && (
              <View style={estilos.acoes}>
                <View style={estilos.acao}>
                  <Botao titulo="Cancelar" variante="secundario" aoPressionar={() => aoFechar(false)} />
                </View>
                <View style={estilos.acao}>
                  <Botao
                    titulo={conteudo.textoConfirmar}
                    variante={conteudo.perigoso ? 'perigo' : 'primario'}
                    aoPressionar={() => aoFechar(true)}
                  />
                </View>
              </View>
            )}

            {conteudo.tipo === 'mensagem' && (
              <View style={estilos.acaoUnica}>
                <Botao titulo={conteudo.textoBotao} aoPressionar={() => aoFechar(true)} />
              </View>
            )}

            {conteudo.tipo === 'opcoes' && (
              <View style={estilos.opcoes}>
                {conteudo.opcoes.map((opcao) => (
                  <Pressable
                    key={opcao.texto}
                    onPress={() => {
                      aoFechar(false);
                      opcao.aoEscolher();
                    }}
                    accessibilityRole="button"
                    android_ripple={{ color: cores.borda }}
                    style={estilos.opcao}
                  >
                    <Ionicons name={opcao.icone} size={22} color={cores.primaria} />
                    <Text style={estilos.opcaoTexto}>{opcao.texto}</Text>
                  </Pressable>
                ))}
                <Botao titulo="Cancelar" variante="texto" aoPressionar={() => aoFechar(false)} />
              </View>
            )}
          </View>
        )}
      </View>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  fundo: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    padding: espacamento.xl,
  },
  caixa: {
    alignItems: 'center',
    gap: espacamento.md,
    padding: espacamento.xl,
    backgroundColor: cores.superficie,
    borderRadius: raio.lg,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  iconeFundo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.superficieElevada,
  },
  titulo: { ...tipografia.subtitulo, color: cores.texto, textAlign: 'center' },
  mensagem: { ...tipografia.corpo, color: cores.textoSecundario, textAlign: 'center' },
  acoes: { flexDirection: 'row', gap: espacamento.md, marginTop: espacamento.sm },
  acao: { flex: 1 },
  acaoUnica: { alignSelf: 'stretch', marginTop: espacamento.sm },
  opcoes: { alignSelf: 'stretch', gap: espacamento.sm, marginTop: espacamento.sm },
  opcao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamento.md,
    minHeight: 52,
    paddingHorizontal: espacamento.lg,
    backgroundColor: cores.superficieElevada,
    borderRadius: raio.md,
  },
  opcaoTexto: { ...tipografia.corpo, color: cores.texto, fontWeight: '600' },
});
