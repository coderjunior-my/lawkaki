"use client";

import { useEffect, useState, useCallback } from "react";

/* ============================================================
   Minimal admin console — payment review only. Admin accounts are
   provisioned out-of-band (flip users.is_admin directly); there's no
   self-serve admin signup. Reuses the same session token a lawyer
   already has from the normal WhatsApp OTP login.
   ============================================================ */

interface Payment {
  id: string;
  method: string;
  totalAmount: number;
  reference: string | null;
  status: "pending" | "confirmed" | "rejected";
  submittedAt: string;
  reviewedAt: string | null;
  poster: { name: string; phone: string; firmName: string } | null;
  transactions: { id: string; amount: number; venue: string | null; docType: string | null }[];
}

export default function AdminPage() {
  const [token, setToken]         = useState("");
  const [payments, setPayments]   = useState<Payment[] | null>(null);
  const [forbidden, setForbidden] = useState(false);
  const [busyId, setBusyId]       = useState<string | null>(null);

  useEffect(() => {
    setToken(localStorage.getItem("lk_token") ?? "");
  }, []);

  const refresh = useCallback(() => {
    if (!token) return;
    fetch("/api/admin/payments?status=pending", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => {
        if (r.status === 403) { setForbidden(true); return null; }
        return r.json();
      })
      .then((d) => { if (d) setPayments(d.payments ?? []); })
      .catch(() => {});
  }, [token]);

  useEffect(() => { refresh(); }, [refresh]);

  async function act(id: string, action: "confirm" | "reject") {
    setBusyId(id);
    try {
      await fetch(`/api/admin/payments/${id}/${action}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      refresh();
    } finally {
      setBusyId(null);
    }
  }

  if (!token) {
    return (
      <div style={{ padding: 40, fontFamily: "var(--font-sans, sans-serif)" }}>
        Log in to Law Kaki first, then come back to <code>/admin</code>.
      </div>
    );
  }

  if (forbidden) {
    return (
      <div style={{ padding: 40, fontFamily: "var(--font-sans, sans-serif)" }}>
        This account isn&apos;t an admin.
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px", fontFamily: "var(--font-sans, sans-serif)" }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 4 }}>
        Pending platform payments
      </h1>
      <p style={{ color: "var(--warm-grey)", fontSize: 14, marginBottom: 28 }}>
        Confirm once the bank transfer actually lands. Reject if it doesn&apos;t match — the poster can resubmit.
      </p>

      {payments === null ? (
        <div style={{ color: "var(--warm-grey)" }}>Loading…</div>
      ) : payments.length === 0 ? (
        <div style={{ color: "var(--warm-grey)" }}>Nothing pending.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {payments.map((p) => (
            <div key={p.id} style={{ background: "#FFF", border: "1px solid var(--hair)", borderRadius: 14, padding: "16px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{p.poster?.name ?? "Unknown"}</div>
                  <div style={{ fontSize: 12.5, color: "var(--warm-grey)" }}>
                    {p.poster?.phone} · {p.poster?.firmName}
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--warm-grey)", marginTop: 4 }}>
                    Submitted {new Date(p.submittedAt).toLocaleString("en-MY")} · {p.method.replace("_", " ")}
                  </div>
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>
                  RM {p.totalAmount.toFixed(2)}
                </div>
              </div>

              <div style={{ fontSize: 12.5, color: "var(--warm-grey)", marginBottom: 12 }}>
                {p.transactions.length} transaction{p.transactions.length !== 1 ? "s" : ""}:{" "}
                {p.transactions.map((t) => `${t.venue ?? "—"} (RM ${t.amount.toFixed(2)})`).join(", ")}
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="lk-btn lk-btn--sm"
                  disabled={busyId === p.id}
                  onClick={() => act(p.id, "confirm")}
                  style={{ height: 32 }}
                >
                  Confirm received
                </button>
                <button
                  className="lk-btn lk-btn--ghost lk-btn--sm"
                  disabled={busyId === p.id}
                  onClick={() => act(p.id, "reject")}
                  style={{ height: 32 }}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
