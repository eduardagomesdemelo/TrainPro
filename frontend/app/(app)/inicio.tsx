import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Botao } from '../../src/components/Botao';
import { sair } from '../../src/features/auth/servicoAutenticacao';
import { supabase } from '../../src/lib/supabase';
import { cores, espacamento, tipografia } from '../../src/theme/tokens';

export default function Inicio() {
  const router = useRouter();
  const [nome, setNome] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from('perfis')
      .select('nome')
      .maybeSingle()
      .then(({ data }) => setNome(data?.nome ?? null));
  }, []);

  async function aoSair() {
    await sair();
    router.replace('/entrar');
  }

  return (
    <SafeAreaView style={estilos.tela}>
      <Text style={estilos.titulo}>Olá{nome ? `, ${nome}` : ''}!</Text>
      <Botao titulo="Sair" variante="secundario" aoPressionar={aoSair} />
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: cores.fundo,
    padding: espacamento.xl,
    gap: espacamento.xl,
    justifyContent: 'center',
  },
  titulo: { ...tipografia.titulo, color: cores.texto },
});
