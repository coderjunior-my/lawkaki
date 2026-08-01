"use client";

import { useState, useEffect } from "react";
import Dashboard from "@/components/Dashboard";
import LoginFlow from "@/components/LoginFlow";
import Landing from "@/components/Landing";
import CircularLoader from "@/components/CircularLoader";

export default function Page() {
  const [token,     setToken]     = useState<string | null>(null);
  const [userId,    setUserId]    = useState("");
  const [userName,  setUserName]  = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [loading,   setLoading]   = useState(true);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    setToken(localStorage.getItem("lk_token"));
    setUserId(localStorage.getItem("lk_user_id") ?? "");
    setUserName(localStorage.getItem("lk_name") ?? "");
    setUserPhone(localStorage.getItem("lk_phone") ?? "");
    setLoading(false);
  }, []);

  // Form inputs are intentionally under 16px, so mobile Safari auto-zooms
  // in on focus — that's the desired "easier to type" behaviour. But Safari
  // doesn't reliably zoom back out once the keyboard is dismissed, which
  // strands the user zoomed in on part of the form with the CTA off-screen.
  // Briefly capping maximum-scale on blur forces it to snap back to 1x;
  // restoring it right after keeps pinch-zoom and the next field's
  // zoom-in working normally.
  useEffect(() => {
    const meta = document.querySelector('meta[name="viewport"]');
    if (!meta) return;
    const original = meta.getAttribute("content") ?? "width=device-width, initial-scale=1";

    function onFocusOut(e: FocusEvent) {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag !== "INPUT" && tag !== "TEXTAREA" && tag !== "SELECT") return;
      meta!.setAttribute("content", `${original}, maximum-scale=1`);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => meta!.setAttribute("content", original));
      });
    }

    document.addEventListener("focusout", onFocusOut);
    return () => document.removeEventListener("focusout", onFocusOut);
  }, []);

  if (loading) {
    return (
      <div style={{
        height: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "var(--off-white)",
      }}>
        <CircularLoader size={180} label="Loading" />
      </div>
    );
  }

  if (!token) {
    if (!showLogin) {
      return <Landing onGetStarted={() => setShowLogin(true)} />;
    }
    return (
      <LoginFlow
        onExit={() => setShowLogin(false)}
        onSuccess={(t, uid, n, p) => {
          localStorage.setItem("lk_token",   t);
          localStorage.setItem("lk_user_id", uid);
          localStorage.setItem("lk_name",    n);
          localStorage.setItem("lk_phone",   p);
          setToken(t);
          setUserId(uid);
          setUserName(n);
          setUserPhone(p);
        }}
      />
    );
  }

  function handleSignOut() {
    localStorage.removeItem("lk_token");
    localStorage.removeItem("lk_user_id");
    localStorage.removeItem("lk_name");
    localStorage.removeItem("lk_phone");
    setToken(null);
    setUserId("");
    setUserName("");
    setUserPhone("");
  }

  return (
    <Dashboard
      onSignOut={handleSignOut}
      token={token}
      userId={userId}
      userName={userName}
      userPhone={userPhone}
    />
  );
}
