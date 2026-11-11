import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { cores } from '../src/theme/tokens';

/** Layout raiz: define o tema escuro e a pilha de navegação do app. */
export default function LayoutRaiz() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: cores.fundo },
        }}
      />
    </>
  );
}
