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
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-2xl bg-white p-8 shadow">
        <div className="mb-6 text-center text-2xl font-bold">🌊 Antalya Bridge</div>
        <h1 className="mb-4 text-lg font-semibold">Yönetici Girişi</h1>
        <div className="space-y-3">
          <input name="email" type="email" placeholder="E-posta" required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <input name="password" type="password" placeholder="Şifre" required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          {error && <p className="text-sm text-red-600">E-posta veya şifre hatalı.</p>}
          <button disabled={loading} className="w-full rounded-lg bg-cyan-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">
            {loading ? "Giriş yapılıyor…" : "Giriş yap"}
          </button>
        </div>
      </form>
    </div>
  );
}
