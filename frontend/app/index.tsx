import { StyleSheet, Text, View } from 'react-native';

import { cores, tipografia } from '../src/theme/tokens';

/** Tela provisória; será substituída pelo fluxo de autenticação (UC01/UC02). */
export default function Inicio() {
  return (
    <View style={estilos.container}>
      <Text style={estilos.titulo}>TrainPRO</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  titulo: { ...tipografia.titulo, color: cores.primaria },
});
