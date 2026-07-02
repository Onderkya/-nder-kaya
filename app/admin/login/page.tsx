"use client";

import { useState } from "react";

export default function AdminLoginPage() {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(false);
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      window.location.href = "/admin";
    } else {
      setError(true);
      setLoading(false);
    }
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center p-4"
      style={{ background: "rgb(var(--background))" }}
    >
      <div className="adm-rise w-full max-w-sm">
        <div className="adm-card p-8 sm:p-10">
          <div className="mb-7 text-center">
            <div
              className="font-display text-[2rem] font-semibold leading-none"
              style={{ color: "rgb(var(--foreground))" }}
            >
              🌊 Antalya Bridge
            </div>
            <p className="adm-muted mt-3 text-[14px] leading-relaxed">
              Yönetim paneline hoş geldiniz.<br />Devam etmek için giriş yapın.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="adm-label" htmlFor="login-email">E-posta</label>
              <input id="login-email" name="email" type="email" placeholder="ad@ornek.com" required autoComplete="email" className="adm-input" />
            </div>
            <div>
              <label className="adm-label" htmlFor="login-password">Şifre</label>
              <input id="login-password" name="password" type="password" placeholder="••••••••" required autoComplete="current-password" className="adm-input" />
            </div>
            {error && (
              <p className="text-sm font-medium" style={{ color: "rgb(var(--accent))" }}>
                E-posta veya şifre hatalı.
              </p>
            )}
            <button disabled={loading} className="adm-btn adm-btn-primary w-full">
              {loading ? "Giriş yapılıyor…" : "Giriş yap"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
