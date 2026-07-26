import { NextRequest, NextResponse } from "next/server";
import { supabase, getUserIdFromToken } from "@/lib/supabase";

// GET /api/notifications — the current user's notification inbox, plus their
// role so the client can split "As poster" / "As picker" (and skip the
// split entirely for a single-role account).
export async function GET(req: NextRequest) {
  const token  = req.headers.get("authorization")?.replace("Bearer ", "");
  const userId = token ? await getUserIdFromToken(token) : null;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
  }

  const [{ data: user }, { data: notifications, error }] = await Promise.all([
    supabase.from("users").select("role").eq("id", userId).single(),
    supabase
      .from("notifications")
      .select("id, job_id, type, role, title, body, read_at, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  if (error) {
    console.error("[GET /api/notifications]", error);
    return NextResponse.json({ error: "Failed to load notifications." }, { status: 500 });
  }

  return NextResponse.json({
    role: user?.role ?? "both",
    notifications: (notifications ?? []).map((n) => ({
      id:        n.id,
      jobId:     n.job_id,
      type:      n.type,
      role:      n.role,
      title:     n.title,
      body:      n.body,
      readAt:    n.read_at,
      createdAt: n.created_at,
    })),
  });
}
