import { createClient } from "@supabase/supabase-js";

/**
 * Client para uso no browser (usa a anon key).
 * Pode ser importado em componentes client.
 */
export const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
