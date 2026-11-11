import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

import { env } from './env';
import { armazenamentoSeguro } from './armazenamentoSeguro';

// A chave publicável é pública por definição: quem protege os dados são as políticas RLS do banco.
export const supabase = createClient(env.supabaseUrl, env.supabaseChavePublicavel, {
  auth: {
    storage: armazenamentoSeguro,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
