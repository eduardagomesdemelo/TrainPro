import { Ionicons } from '@expo/vector-icons';
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '../../src/components/Avatar';
import { Botao } from '../../src/components/Botao';
import { Cabecalho } from '../../src/components/Cabecalho';
import { CampoRef, CampoTexto } from '../../src/components/CampoTexto';
import { OpcaoDaLista } from '../../src/components/dialogo/CaixaDialogo';
import { useDialogo } from '../../src/components/dialogo/DialogoContexto';
import { EstadoMensagem } from '../../src/components/EstadoMensagem';
import { validarConfirmacaoSenha, validarEmail, validarNome } from '../../src/features/auth/validacao';
import {
  OrigemFoto,
  Perfil,
  alterarSenha,
  atualizarNome,
  carregarPerfil,
  removerFoto,
  solicitarTrocaDeEmail,
  trocarFoto,
} from '../../src/features/perfil/servicoPerfil';
import { cores, espacamento, raio, tipografia } from '../../src/theme/tokens';

const TAMANHO_AVATAR = 120;

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <View style={estilos.secao}>
      <Text style={estilos.secaoTitulo} accessibilityRole="header">
        {titulo}
      </Text>
      {children}
    </View>
  );
}

export default function PerfilTela() {
  const { avisar, informar, mostrarErro, escolherOpcao } = useDialogo();
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [enviandoFoto, setEnviandoFoto] = useState(false);

  const [nome, setNome] = useState('');
  const [erroNome, setErroNome] = useState<string | null>(null);
  const [salvandoNome, setSalvandoNome] = useState(false);

  const [email, setEmail] = useState('');
  const [erroEmail, setErroEmail] = useState<string | null>(null);
  const [salvandoEmail, setSalvandoEmail] = useState(false);

  const [senhaAtual, setSenhaAtual] = useState('');
  const [senhaNova, setSenhaNova] = useState('');
  const [senhaRepetida, setSenhaRepetida] = useState('');
  const [erroSenhaAtual, setErroSenhaAtual] = useState<string | null>(null);
  const [erroSenhaNova, setErroSenhaNova] = useState<string | null>(null);
  const [erroSenhaRepetida, setErroSenhaRepetida] = useState<string | null>(null);
  const [salvandoSenha, setSalvandoSenha] = useState(false);

  const refSenhaNova = useRef<CampoRef>(null);
  const refSenhaRepetida = useRef<CampoRef>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    const resultado = await carregarPerfil();
    if (resultado.ok) {
      setPerfil(resultado.dados);
      setNome(resultado.dados.nome);
      setEmail(resultado.dados.email);
    } else {
      setErro(resultado.mensagem);
    }
    setCarregando(false);
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function salvarNome() {
    if (!perfil || salvandoNome) return;
    const erroValidacao = validarNome(nome);
    setErroNome(erroValidacao);
    if (erroValidacao) return;

    setSalvandoNome(true);
    const resultado = await atualizarNome(perfil.id, nome);
    setSalvandoNome(false);

    if (resultado.ok) {
      setPerfil({ ...perfil, nome: nome.trim() });
      setNome(nome.trim());
      avisar('Nome atualizado com sucesso!');
    } else {
      setErroNome(resultado.mensagem);
    }
  }

  async function salvarEmail() {
    if (!perfil || salvandoEmail) return;
    const erroValidacao = validarEmail(email);
    setErroEmail(erroValidacao);
    if (erroValidacao) return;

    setSalvandoEmail(true);
    const resultado = await solicitarTrocaDeEmail(email);
    setSalvandoEmail(false);

    if (resultado.ok) {
      setEmail(perfil.email);
      informar(
        'Confirme a alteração',
        'Enviamos links de confirmação para o e-mail novo e para o atual. O e-mail só muda depois que você confirmar.',
      );
    } else {
      setErroEmail(resultado.mensagem);
    }
  }

  async function salvarSenha() {
    if (!perfil || salvandoSenha) return;

    const novoErroAtual = senhaAtual ? null : 'Informe a senha atual.';
    const novoErroNova = senhaNova ? null : 'Informe a nova senha.';
    const novoErroRepetida = validarConfirmacaoSenha(senhaNova, senhaRepetida);
    setErroSenhaAtual(novoErroAtual);
    setErroSenhaNova(novoErroNova);
    setErroSenhaRepetida(novoErroRepetida);
    if (novoErroAtual || novoErroNova || novoErroRepetida) return;

    setSalvandoSenha(true);
    const resultado = await alterarSenha(perfil.email, senhaAtual, senhaNova);
    setSalvandoSenha(false);

    if (resultado.ok) {
      setSenhaAtual('');
      setSenhaNova('');
      setSenhaRepetida('');
      avisar('Senha alterada com sucesso!');
    } else if (resultado.mensagem.includes('atual está incorreta')) {
      setErroSenhaAtual(resultado.mensagem);
    } else {
      setErroSenhaNova(resultado.mensagem);
    }
  }

  async function escolherFoto(origem: OrigemFoto) {
    if (!perfil) return;
    setEnviandoFoto(true);
    const resultado = await trocarFoto(perfil.id, origem);
    setEnviandoFoto(false);

    if (!resultado.ok) mostrarErro(resultado.mensagem);
    else if (resultado.dados) setPerfil({ ...perfil, fotoUrl: resultado.dados });
  }

  async function excluirFoto() {
    if (!perfil) return;
    setEnviandoFoto(true);
    const resultado = await removerFoto(perfil.id);
    setEnviandoFoto(false);

    if (resultado.ok) setPerfil({ ...perfil, fotoUrl: null });
    else mostrarErro(resultado.mensagem);
  }

  function abrirOpcoesDaFoto() {
    const opcoes: OpcaoDaLista[] = [
      { texto: 'Galeria', icone: 'images-outline', aoEscolher: () => escolherFoto('galeria') },
      { texto: 'Câmera', icone: 'camera-outline', aoEscolher: () => escolherFoto('camera') },
    ];
    if (perfil?.fotoUrl) {
      opcoes.push({ texto: 'Remover foto', icone: 'trash-outline', aoEscolher: excluirFoto });
    }
    escolherOpcao('Foto de perfil', opcoes, 'Escolha de onde vem a sua foto.');
  }

  return (
    <SafeAreaView style={estilos.tela}>
      <Cabecalho titulo="Meu perfil" />

      {carregando ? (
        <View style={estilos.centro}>
          <ActivityIndicator size="large" color={cores.primaria} />
        </View>
      ) : erro || !perfil ? (
        <EstadoMensagem
          icone="cloud-offline-outline"
          titulo="Algo deu errado"
          descricao={erro ?? 'Não foi possível carregar o perfil.'}
          acao={{ titulo: 'Tentar novamente', aoPressionar: carregar }}
        />
      ) : (
        <KeyboardAvoidingView style={estilos.tela} behavior="padding">
          <ScrollView
            contentContainerStyle={estilos.conteudo}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={estilos.fotoArea}>
              <Pressable
                onPress={abrirOpcoesDaFoto}
                disabled={enviandoFoto}
                accessibilityRole="button"
                accessibilityLabel="Alterar foto de perfil"
              >
                <Avatar nome={perfil.nome} fotoUrl={perfil.fotoUrl} tamanho={TAMANHO_AVATAR} />
                {enviandoFoto ? (
                  <View style={estilos.carregandoFoto}>
                    <ActivityIndicator color={cores.primaria} />
                  </View>
                ) : (
                  <View style={estilos.camera}>
                    <Ionicons name="camera" size={18} color={cores.sobrePrimaria} />
                  </View>
                )}
              </Pressable>
            </View>

            <Secao titulo="Nome">
              <CampoTexto
                rotulo="Nome"
                icone="person-outline"
                value={nome}
                onChangeText={setNome}
                erro={erroNome}
                autoCapitalize="words"
                maxLength={100}
                returnKeyType="done"
                onSubmitEditing={salvarNome}
              />
              <Botao
                titulo="Salvar nome"
                icone="checkmark"
                variante="secundario"
                aoPressionar={salvarNome}
                carregando={salvandoNome}
                desabilitado={nome.trim() === perfil.nome}
              />
            </Secao>

            <Secao titulo="E-mail">
              <CampoTexto
                rotulo="E-mail"
                icone="mail-outline"
                value={email}
                onChangeText={setEmail}
                erro={erroEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={150}
                returnKeyType="done"
                onSubmitEditing={salvarEmail}
              />
              <Botao
                titulo="Alterar e-mail"
                icone="checkmark"
                variante="secundario"
                aoPressionar={salvarEmail}
                carregando={salvandoEmail}
                desabilitado={email.trim().toLowerCase() === perfil.email.toLowerCase()}
              />
            </Secao>

            <Secao titulo="Senha">
              <CampoTexto
                rotulo="Senha atual"
                icone="lock-closed-outline"
                senha
                value={senhaAtual}
                onChangeText={setSenhaAtual}
                erro={erroSenhaAtual}
                autoCapitalize="none"
                autoComplete="current-password"
                maxLength={72}
                returnKeyType="next"
                onSubmitEditing={() => refSenhaNova.current?.focus()}
              />
              <CampoTexto
                ref={refSenhaNova}
                rotulo="Nova senha"
                icone="lock-closed-outline"
                senha
                value={senhaNova}
                onChangeText={setSenhaNova}
                erro={erroSenhaNova}
                dica="Mínimo de 8 caracteres, com letras e números."
                autoCapitalize="none"
                autoComplete="new-password"
                maxLength={72}
                returnKeyType="next"
                onSubmitEditing={() => refSenhaRepetida.current?.focus()}
              />
              <CampoTexto
                ref={refSenhaRepetida}
                rotulo="Repetir nova senha"
                icone="lock-closed-outline"
                senha
                value={senhaRepetida}
                onChangeText={setSenhaRepetida}
                erro={erroSenhaRepetida}
                autoCapitalize="none"
                autoComplete="new-password"
                maxLength={72}
                returnKeyType="done"
                onSubmitEditing={salvarSenha}
              />
              <Botao
                titulo="Alterar senha"
                icone="checkmark"
                variante="secundario"
                aoPressionar={salvarSenha}
                carregando={salvandoSenha}
              />
            </Secao>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  conteudo: { padding: espacamento.xl, gap: espacamento.lg, paddingBottom: espacamento.xxl * 2 },
  fotoArea: { alignItems: 'center', marginBottom: espacamento.sm },
  camera: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: cores.primaria,
    borderWidth: 3,
    borderColor: cores.fundo,
    alignItems: 'center',
    justifyContent: 'center',
  },
  carregandoFoto: {
    ...StyleSheet.absoluteFill,
    borderRadius: TAMANHO_AVATAR / 2,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secao: {
    padding: espacamento.lg,
    gap: espacamento.md,
    backgroundColor: cores.superficie,
    borderRadius: raio.lg,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  secaoTitulo: { ...tipografia.subtitulo, color: cores.texto },
});
