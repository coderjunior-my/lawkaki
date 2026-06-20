import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Server-side only — service role bypasses RLS.
// Never import this file in client components.
// Lazy singleton so missing env vars at build time don't crash the module.
let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (_client) return _client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set."
    );
  }
  _client = createClient(url, key, { auth: { persistSession: false } });
  return _client;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getClient() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export async function getUserIdFromToken(token: string): Promise<string | null> {
  const { data } = await supabase
    .from("sessions")
    .select("user_id, expires_at")
    .eq("token", token)
    .single();
  if (!data) return null;
  if (new Date(data.expires_at) < new Date()) return null;
  return data.user_id as string;
}
