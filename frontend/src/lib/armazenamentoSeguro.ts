import * as SecureStore from 'expo-secure-store';

// Guarda a sessão do Supabase no cofre do aparelho. O SecureStore limita cada valor
// a ~2 KB e a sessão costuma passar disso, então o texto é dividido em pedaços.

const TAMANHO_PEDACO = 1800;

const chaveQtd = (chave: string) => `${chave}.qtd`;
const chavePedaco = (chave: string, i: number) => `${chave}.${i}`;

export const armazenamentoSeguro = {
  async getItem(chave: string): Promise<string | null> {
    const qtdTexto = await SecureStore.getItemAsync(chaveQtd(chave));
    if (!qtdTexto) return null;

    const pedacos: string[] = [];
    for (let i = 0; i < Number(qtdTexto); i++) {
      const pedaco = await SecureStore.getItemAsync(chavePedaco(chave, i));
      if (pedaco === null) return null;
      pedacos.push(pedaco);
    }
    return pedacos.join('');
  },

  async setItem(chave: string, valor: string): Promise<void> {
    await this.removeItem(chave);
    const total = Math.ceil(valor.length / TAMANHO_PEDACO);
    for (let i = 0; i < total; i++) {
      await SecureStore.setItemAsync(
        chavePedaco(chave, i),
        valor.slice(i * TAMANHO_PEDACO, (i + 1) * TAMANHO_PEDACO),
      );
    }
    await SecureStore.setItemAsync(chaveQtd(chave), String(total));
  },

  async removeItem(chave: string): Promise<void> {
    const qtdTexto = await SecureStore.getItemAsync(chaveQtd(chave));
    const qtd = Number(qtdTexto ?? 0);
    for (let i = 0; i < qtd; i++) {
      await SecureStore.deleteItemAsync(chavePedaco(chave, i));
    }
    await SecureStore.deleteItemAsync(chaveQtd(chave));
  },
};
