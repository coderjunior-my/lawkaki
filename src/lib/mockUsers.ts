import { supabase } from "@/lib/supabase";
import type { UserRole } from "@/lib/types";

export interface DbUser {
  id:         string;
  name:       string;
  phone:      string;
  role:       UserRole;
  firm_name:  string | null;
  firm_state: string | null;
}

export async function findUserByPhone(phone: string): Promise<DbUser | null> {
  const { data } = await supabase
    .from("users")
    .select("id, name, phone, role, firm_name, firm_state")
    .eq("phone", phone)
    .eq("status", "active")
    .single();
  return (data as DbUser) ?? null;
}
