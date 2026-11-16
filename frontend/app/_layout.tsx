import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { DialogoProvider } from '../src/components/dialogo/DialogoContexto';
import { cores } from '../src/theme/tokens';

export default function LayoutRaiz() {
  return (
    <DialogoProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: cores.fundo },
        }}
      />
    </DialogoProvider>
  );
}
