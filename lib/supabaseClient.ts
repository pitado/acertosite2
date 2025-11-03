import { createClient } from "@supabase/supabase-js";

/**
 * Client para uso no browser (usa a anon key).
 * Pode ser importado em componentes client.
 */
export const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Client para uso no servidor (rotas API / server actions).
 * Usa a service role. NUNCA importar em componentes client.
 */
export function supabaseServer() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
