import { createClient } from "@supabase/supabase-js";

const supabaseUrl      = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Server-side only — service role bypasses RLS.
// Never import this file in client components.
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
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
