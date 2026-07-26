import { NextRequest, NextResponse } from "next/server";
import { supabase, getUserIdFromToken } from "@/lib/supabase";

// POST /api/notifications/read — mark notifications read for the current user.
// Body { id }: one notification. Body { ids: [...] }: a batch (e.g. "mark all
// as read" scoped to the tab currently in view). No body / {}: every unread
// notification for this user.
export async function POST(req: NextRequest) {
  const token  = req.headers.get("authorization")?.replace("Bearer ", "");
  const userId = token ? await getUserIdFromToken(token) : null;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { id, ids } = body as { id?: string; ids?: string[] };

  let query = supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", userId)
    .is("read_at", null);

  if (id) query = query.eq("id", id);
  else if (ids?.length) query = query.in("id", ids);

  const { error } = await query;
  if (error) {
    console.error("[POST /api/notifications/read]", error);
    return NextResponse.json({ error: "Failed to mark as read." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
