import { Image, StyleSheet, Text, View } from 'react-native';

import { cores } from '../theme/tokens';

type Props = {
  nome: string;
  fotoUrl?: string | null;
  tamanho?: number;
};

// Círculo com a foto do usuário ou, sem foto, a inicial do nome.
export function Avatar({ nome, fotoUrl, tamanho = 44 }: Props) {
  const inicial = nome.trim().charAt(0).toUpperCase() || '?';
  const medidas = { width: tamanho, height: tamanho, borderRadius: tamanho / 2 };

  return (
    <View
      style={[estilos.circulo, medidas]}
      accessibilityRole="image"
      accessibilityLabel={`Foto de perfil de ${nome || 'usuário'}`}
    >
      {fotoUrl ? (
        <Image source={{ uri: fotoUrl }} style={medidas} />
      ) : (
        <Text style={[estilos.inicial, { fontSize: tamanho * 0.42 }]}>{inicial}</Text>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  circulo: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: cores.superficieElevada,
    borderWidth: 1.5,
    borderColor: cores.primaria,
  },
  inicial: { color: cores.primaria, fontWeight: '700' },
});
