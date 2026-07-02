"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "./ui";
import { Icon } from "./icons";
import { useAiPanel } from "./ai-panel-context";

/**
 * Dashboard AI kartı — metrik bandının hemen altında durur. Yazıp gönder ya da
 * bir öneri çipine tıkla → yan panel açılır ve soru gönderilir (openWith).
 * AI hazır değilse (anahtar/DB yok) input yerine kısa rehber + Ayarlar linki.
 */

const CHIPS = ["Bu ay kaç satış oldu?", "Bekleyen talepleri özetle"];

export function DashboardAiCard({ available }: { available: boolean }) {
  const { openWith } = useAiPanel();
  const [value, setValue] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const text = value.trim();
    if (!text) return;
    setValue("");
    openWith(text);
  }

  const title = (
    <div className="flex items-center gap-2">
      <span className="grid h-8 w-8 place-items-center rounded-xl" style={{ background: "rgb(var(--primary) / 0.14)", color: "rgb(var(--primary))" }}>
        <Icon name="bolt" size={16} />
      </span>
      <h2 className="font-semibold text-[15px]" style={{ color: "rgb(var(--foreground))" }}>AI Asistan</h2>
    </div>
  );

  if (!available) {
    return (
      <Card>
        {title}
        <p className="adm-muted mt-3 text-[14px] leading-relaxed">
          AI asistanı kullanmak için OpenRouter anahtarını Ayarlar sayfasından ekle. Ekledikten sonra buradan veritabanına doğrudan soru sorabilirsin.
        </p>
        <Link href="/admin/settings" className="adm-btn adm-btn-ghost adm-btn-sm mt-4">
          <Icon name="settings" size={16} /> Ayarlar
        </Link>
      </Card>
    );
  }

  return (
    <Card>
      {title}
      <p className="adm-muted mt-2 text-[13.5px]">Veritabanına bir soru sor — yanıt sağdaki panelde açılır.</p>
      <form onSubmit={submit} className="mt-3 flex gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Örn. Bu ay kaç satış oldu?"
          className="adm-input flex-1"
        />
        <button type="submit" className="adm-btn adm-btn-primary" aria-label="Sor">
          <Icon name="chevron" size={18} className="-rotate-90" />
        </button>
      </form>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {CHIPS.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => openWith(q)}
            className="rounded-full border px-3 py-1.5 text-xs font-medium transition hover:brightness-95"
            style={{ borderColor: "rgb(var(--border))", background: "rgb(var(--muted))", color: "rgb(var(--foreground))" }}
          >
            {q}
          </button>
        ))}
      </div>
    </Card>
  );
}
