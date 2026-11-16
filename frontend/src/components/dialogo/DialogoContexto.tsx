import { ReactNode, createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';

import { AvisoRapido, AvisoRapidoDados } from './AvisoRapido';
import { CaixaDialogo, ConteudoDaCaixa, OpcaoDaLista } from './CaixaDialogo';

type OpcoesDeConfirmacao = {
  titulo: string;
  mensagem: string;
  textoConfirmar?: string;
  // Destaca o botão em vermelho, para ações que apagam dados.
  perigoso?: boolean;
};

type Dialogo = {
  // Resolve com true se o usuário confirmou, false se cancelou ou tocou fora.
  confirmar: (opcoes: OpcoesDeConfirmacao) => Promise<boolean>;
  mostrarErro: (mensagem: string, titulo?: string) => Promise<void>;
  informar: (titulo: string, mensagem: string, textoBotao?: string) => Promise<void>;
  escolherOpcao: (titulo: string, opcoes: OpcaoDaLista[], mensagem?: string) => void;
  // Aviso curto que some sozinho, para confirmar que algo deu certo.
  avisar: (mensagem: string, tipo?: 'sucesso' | 'info') => void;
};

const DialogoContexto = createContext<Dialogo | null>(null);

export function useDialogo(): Dialogo {
  const dialogo = useContext(DialogoContexto);
  if (!dialogo) throw new Error('useDialogo precisa estar dentro de DialogoProvider.');
  return dialogo;
}

export function DialogoProvider({ children }: { children: ReactNode }) {
  const [conteudo, setConteudo] = useState<ConteudoDaCaixa | null>(null);
  const [aviso, setAviso] = useState<AvisoRapidoDados | null>(null);

  // Função que devolve a resposta do usuário a quem abriu a caixa.
  const resolver = useRef<((confirmou: boolean) => void) | null>(null);
  const proximoAviso = useRef(1);

  const abrir = useCallback((novo: ConteudoDaCaixa) => {
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
      setConteudo(novo);
    });
  }, []);

  const fechar = useCallback((confirmou: boolean) => {
    setConteudo(null);
    resolver.current?.(confirmou);
    resolver.current = null;
  }, []);

  const dialogo = useMemo<Dialogo>(
    () => ({
      confirmar: ({ titulo, mensagem, textoConfirmar = 'Confirmar', perigoso = false }) =>
        abrir({ tipo: 'confirmar', titulo, mensagem, textoConfirmar, perigoso }),
      mostrarErro: async (mensagem, titulo = 'Algo deu errado') => {
        await abrir({ tipo: 'mensagem', variante: 'erro', titulo, mensagem, textoBotao: 'OK' });
      },
      informar: async (titulo, mensagem, textoBotao = 'OK') => {
        await abrir({ tipo: 'mensagem', variante: 'info', titulo, mensagem, textoBotao });
      },
      escolherOpcao: (titulo, opcoes, mensagem) => {
        abrir({ tipo: 'opcoes', titulo, mensagem, opcoes });
      },
      avisar: (mensagem, tipo = 'sucesso') => {
        setAviso({ id: proximoAviso.current++, mensagem, tipo });
      },
    }),
    [abrir],
  );

  return (
    <DialogoContexto.Provider value={dialogo}>
      <View style={{ flex: 1 }}>
        {children}
        <AvisoRapido
          aviso={aviso}
          aoEncerrar={(id) => setAviso((atual) => (atual?.id === id ? null : atual))}
        />
        <CaixaDialogo conteudo={conteudo} aoFechar={fechar} />
      </View>
    </DialogoContexto.Provider>
  );
}
