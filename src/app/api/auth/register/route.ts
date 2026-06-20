import { NextRequest, NextResponse } from "next/server";
import { consumePendingSession } from "@/lib/otpStore";
import { LAW_FIRMS } from "@/lib/lawFirms";
import { supabase } from "@/lib/supabase";
import type { UserRole } from "@/lib/types";

const VALID_ROLES  = new Set<UserRole>(["poster", "picker", "both"]);
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1_000;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { sessionToken, name, firmId, role } = body as {
    sessionToken?: string;
    name?:         string;
    firmId?:       string;
    role?:         UserRole;
  };

  const phone = sessionToken ? await consumePendingSession(sessionToken) : null;
  if (!phone) {
    return NextResponse.json(
      { error: "Session expired. Please verify your number again." },
      { status: 401 },
    );
  }

  if (!name?.trim()) {
    return NextResponse.json({ error: "Enter your full name." }, { status: 400 });
  }

  const firm = firmId ? LAW_FIRMS.find((f) => f.id === firmId) : null;
  if (!firm) {
    return NextResponse.json({ error: "Select a valid firm." }, { status: 400 });
  }

  if (!role || !VALID_ROLES.has(role)) {
    return NextResponse.json({ error: "Select how you will use Law Kaki." }, { status: 400 });
  }

  // Phase 1: all registrations auto-approved.
  // Phase 2: check admin_approvals table; 403 if absent.
  const { data: user, error } = await supabase
    .from("users")
    .upsert(
      {
        phone,
        name:         name.trim(),
        firm_name:    firm.name,
        firm_state:   firm.state,
        role,
        status:       "active",
        verified:     true,
        verified_at:  new Date().toISOString(),
        onboarded:    true,
        onboarded_at: new Date().toISOString(),
      },
      { onConflict: "phone" },
    )
    .select("id")
    .single();

  if (error || !user) {
    console.error("[Register] DB error:", error);
    return NextResponse.json({ error: "Registration failed. Try again." }, { status: 500 });
  }

  const appToken = crypto.randomUUID();
  await supabase.from("sessions").insert({
    user_id:    user.id,
    token:      appToken,
    expires_at: new Date(Date.now() + SESSION_TTL_MS).toISOString(),
  });

  return NextResponse.json({
    ok: true, token: appToken, userId: user.id,
    phone, name: name.trim(), role,
  });
}
