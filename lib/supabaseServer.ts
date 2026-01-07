import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Client do Supabase para uso no SERVER (Route Handlers / Server Actions).
 *
 * Prioridade de envs:
 * - URL: SUPABASE_URL -> NEXT_PUBLIC_SUPABASE_URL
 * - KEY: SUPABASE_SERVICE_ROLE_KEY -> SUPABASE_SERVICE_ROLE -> SUPABASE_SERVICE_KEY -> SUPABASE_ANON_KEY -> NEXT_PUBLIC_SUPABASE_ANON_KEY
 */
export function supabaseServer(): SupabaseClient {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;

  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE ||
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase env vars ausentes. Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY (ou ao menos NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY)."
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}
