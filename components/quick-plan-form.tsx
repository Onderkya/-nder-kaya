"use client";

import { useState } from "react";
import { whatsappLink, telegramLink } from "@/lib/config";

type Strings = {
  eyebrow: string;
  title: string;
  subtitle: string;
  fArrival: string;
  fPeople: string;
  fDays: string;
  fBudget: string;
  fStyle: string;
  fContact: string;
  fHandle: string;
  fHandlePh: string;
  fNote: string;
  fNotePh: string;
  styles: { key: string; label: string }[];
  budgets: { key: string; label: string }[];
  contactWa: string;
  contactTg: string;
  cta: string;
  note: string;
  // WhatsApp/Telegram'a gidecek özetin etiketleri
  msgIntro: string;
  msgArrival: string;
  msgPeople: string;
  msgDays: string;
  msgBudget: string;
  msgStyle: string;
  msgHandle: string;
  msgNote: string;
};

/**
 * Hızlı plan formu — backend yok. Misafirin girdiklerinden okunaklı bir özet
 * kurar ve WhatsApp (önceden doldurulmuş) ya da Telegram'a yönlendirir.
 * "Manuel, kişisel, güvenli" konumlandırmaya uygun: form fiyat vermez, teklif vaadi verir.
 */
export function QuickPlanForm({ t }: { t: Strings }) {
  const [arrival, setArrival] = useState("");
  const [people, setPeople] = useState("2");
  const [days, setDays] = useState("5");
  const [budget, setBudget] = useState(t.budgets[1]?.key ?? "");
  const [style, setStyle] = useState(t.styles[0]?.key ?? "");
  const [channel, setChannel] = useState<"wa" | "tg">("wa");
  const [handle, setHandle] = useState("");
  const [note, setNote] = useState("");

  function buildMessage() {
    const styleLabel = t.styles.find((s) => s.key === style)?.label ?? style;
    const budgetLabel = t.budgets.find((b) => b.key === budget)?.label ?? budget;
    const lines = [
      t.msgIntro,
      `• ${t.msgArrival}: ${arrival || "—"}`,
      `• ${t.msgPeople}: ${people}`,
      `• ${t.msgDays}: ${days}`,
      `• ${t.msgBudget}: ${budgetLabel}`,
      `• ${t.msgStyle}: ${styleLabel}`,
    ];
    if (handle.trim()) lines.push(`• ${t.msgHandle}: ${handle.trim()}`);
    if (note.trim()) lines.push(`• ${t.msgNote}: ${note.trim()}`);
    return lines.join("\n");
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const msg = buildMessage();
    const url = channel === "wa" ? whatsappLink(msg) : telegramLink();
    window.open(url, "_blank", "noopener");
  }

  const field =
    "w-full rounded-2xl border bg-transparent px-4 py-3 text-[15px] outline-none transition focus:ring-2";
  const fieldStyle = {
    borderColor: "rgb(var(--border))",
    color: "rgb(var(--foreground))",
  } as const;
  const labelCls =
    "mb-1.5 block text-[11px] font-semibold uppercase tracking-wide";
  const labelStyle = { color: "rgb(var(--muted-foreground))" } as const;

  return (
    <form
      onSubmit={submit}
      className="mx-auto max-w-3xl rounded-[2rem] border p-6 shadow-2xl sm:p-8"
      style={{
        backgroundColor: "rgb(var(--card))",
        borderColor: "rgb(var(--border))",
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls} style={labelStyle}>{t.fArrival}</label>
          <input
            type="date"
            value={arrival}
            onChange={(e) => setArrival(e.target.value)}
            className={field}
            style={fieldStyle}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls} style={labelStyle}>{t.fPeople}</label>
            <input
              type="number"
              min={1}
              max={20}
              value={people}
              onChange={(e) => setPeople(e.target.value)}
              className={field}
              style={fieldStyle}
            />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>{t.fDays}</label>
            <input
              type="number"
              min={1}
              max={30}
              value={days}
              onChange={(e) => setDays(e.target.value)}
              className={field}
              style={fieldStyle}
            />
          </div>
        </div>
        <div>
          <label className={labelCls} style={labelStyle}>{t.fBudget}</label>
          <select
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className={field}
            style={fieldStyle}
          >
            {t.budgets.map((b) => (
              <option key={b.key} value={b.key}>{b.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls} style={labelStyle}>{t.fStyle}</label>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className={field}
            style={fieldStyle}
          >
            {t.styles.map((s) => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* İletişim kanalı seçimi */}
      <div className="mt-5">
        <label className={labelCls} style={labelStyle}>{t.fContact}</label>
        <div className="grid grid-cols-2 gap-3">
          {([
            { key: "wa" as const, label: t.contactWa, color: "#25D366" },
            { key: "tg" as const, label: t.contactTg, color: "#229ED9" },
          ]).map((c) => {
            const active = channel === c.key;
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => setChannel(c.key)}
                className="flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition"
                style={{
                  borderColor: active ? c.color : "rgb(var(--border))",
                  backgroundColor: active ? `${c.color}1a` : "transparent",
                  color: active ? c.color : "rgb(var(--foreground))",
                }}
                aria-pressed={active}
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: c.color }}
                />
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* İletişim adresi (WhatsApp no / Telegram kullanıcı adı) */}
      <div className="mt-4">
        <label className={labelCls} style={labelStyle}>{t.fHandle}</label>
        <input
          type="text"
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          placeholder={t.fHandlePh}
          className={field}
          style={fieldStyle}
          autoComplete="off"
        />
      </div>

      {/* Eklemek istediğin not */}
      <div className="mt-4">
        <label className={labelCls} style={labelStyle}>{t.fNote}</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={t.fNotePh}
          rows={3}
          className={`${field} resize-none`}
          style={fieldStyle}
        />
      </div>

      <button type="submit" className="btn-accent mt-6 w-full justify-center shadow-lg shadow-black/10">
        {t.cta}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
      </button>
      <p className="mt-3 text-center text-xs" style={{ color: "rgb(var(--muted-foreground))" }}>
        {t.note}
      </p>
    </form>
  );
}
