import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Client para uso no browser (usa a anon key).
 * Pode ser importado em componentes client.
 */
let cachedClient: SupabaseClient | null = null;

export function getSupabaseClient() {
  if (cachedClient) return cachedClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  cachedClient = createClient(url, anonKey);
  return cachedClient;
}
