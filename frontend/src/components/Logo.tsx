import { Image, StyleSheet } from 'react-native';

const PROPORCAO = 1246 / 375;

type Props = {
  largura?: number;
};

export function Logo({ largura = 180 }: Props) {
  return (
    <Image
      source={require('../../assets/logo.png')}
      style={[estilos.logo, { width: largura, height: largura / PROPORCAO }]}
      resizeMode="contain"
      accessibilityRole="image"
      accessibilityLabel="TrainPRO"
    />
  );
}

const estilos = StyleSheet.create({
  logo: { alignSelf: 'flex-start' },
});
