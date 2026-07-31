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
