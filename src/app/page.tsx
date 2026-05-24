"use client";

import { useState, useEffect } from "react";
import Dashboard from "@/components/Dashboard";
import LoginFlow from "@/components/LoginFlow";

export default function Page() {
  const [token, setToken]       = useState<string | null>(null);
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    setToken(localStorage.getItem("lk_token"));
    setUserName(localStorage.getItem("lk_name") ?? "");
    setUserPhone(localStorage.getItem("lk_phone") ?? "");
    setLoading(false);
  }, []);

  // Avoid flash of login screen on reload
  if (loading) return null;

  if (!token) {
    return (
      <LoginFlow
        onSuccess={(t, n, p) => {
          localStorage.setItem("lk_token", t);
          localStorage.setItem("lk_name", n);
          localStorage.setItem("lk_phone", p);
          setToken(t);
          setUserName(n);
          setUserPhone(p);
        }}
      />
    );
  }

  function handleSignOut() {
    localStorage.removeItem("lk_token");
    localStorage.removeItem("lk_name");
    localStorage.removeItem("lk_phone");
    setToken(null);
    setUserName("");
    setUserPhone("");
  }

  return <Dashboard onSignOut={handleSignOut} userName={userName} userPhone={userPhone} />;
}
