import { NextRequest, NextResponse } from "next/server";
import { consumePendingSession } from "@/lib/otpStore";
import { LAW_FIRMS } from "@/lib/lawFirms";
import type { UserRole } from "@/lib/types";

const VALID_ROLES = new Set<UserRole>(["poster", "picker", "both"]);

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { sessionToken, name, firmId, role } = body as {
    sessionToken?: string;
    name?: string;
    firmId?: string;
    role?: UserRole;
  };

  // Validate the short-lived pending session created after OTP verification.
  const phone = sessionToken ? consumePendingSession(sessionToken) : null;
  if (!phone) {
    return NextResponse.json(
      { error: "Session expired. Please verify your number again." },
      { status: 401 }
    );
  }

  if (!name?.trim()) {
    return NextResponse.json({ error: "Enter your full name." }, { status: 400 });
  }

  if (!firmId || !LAW_FIRMS.find((f) => f.id === firmId)) {
    return NextResponse.json({ error: "Select a valid firm." }, { status: 400 });
  }

  if (!role || !VALID_ROLES.has(role)) {
    return NextResponse.json({ error: "Select how you will use Law Kaki." }, { status: 400 });
  }

  // Phase 1: Admin pre-screens who receives the app link, so all self-registrations succeed.
  // Phase 2: Query admin_approvals table; if absent, return 403 with "pending review" copy.
  // Phase 3: Verify Malaysian Bar Council roll number against the selected firm's roster.

  // TODO: persist to users table in DB.
  // await db.users.upsert({ phone, firmId, role, status: "active", verified: true, onboarded: true });

  const appToken = crypto.randomUUID();

  // TODO: persist appToken to sessions table with a 30-day expiry.

  return NextResponse.json({ ok: true, token: appToken, phone, name: name.trim(), role });
}
