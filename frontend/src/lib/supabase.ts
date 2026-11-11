import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

import { env } from './env';
import { armazenamentoSeguro } from './armazenamentoSeguro';

/**
 * Cliente único do Supabase usado em todo o app.
 * - A sessão fica no armazenamento seguro do aparelho.
 * - O token é renovado automaticamente.
 * - A segurança dos dados NÃO depende desta chave (que é pública): quem protege
 *   as tabelas são as políticas RLS configuradas no banco.
 */
export const supabase = createClient(env.supabaseUrl, env.supabaseChavePublicavel, {
  auth: {
    storage: armazenamentoSeguro,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // no app mobile não há callback de sessão pela URL
  },
});
