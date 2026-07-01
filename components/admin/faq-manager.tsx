"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveFaqExtras } from "@/lib/faq-actions";
import { Icon } from "./icons";
import type { FaqExtra } from "@/lib/faq";

/**
 * Ekstra SSS maddesi yöneticisi. Koddaki 4 temel madde yerinde kalır; buradan
 * eklenenler onların altına gelir. Seçili sayfa dilini düzenler, diğer dilleri
 * korur (hepsi tek JSON'da). Ekle / sil / sırala + tek Kaydet.
 */
export function FaqManager({ initial, locale, langName }: { initial: FaqExtra[]; locale: string; langName: string }) {
  const [items, setItems] = useState<FaqExtra[]>(initial);
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  const edit = (i: number, field: "q" | "a", val: string) =>
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, [field]: { ...it[field], [locale]: val } } : it)));
  const add = () => setItems((prev) => [...prev, { q: {}, a: {} }]);
  const remove = (i: number) => setItems((prev) => prev.filter((_, idx) => idx !== i));
  const move = (i: number, dir: -1 | 1) =>
    setItems((prev) => {
      const a = [...prev];
      const j = i + dir;
      if (j < 0 || j >= a.length) return a;
      [a[i], a[j]] = [a[j], a[i]];
      return a;
    });
  const save = () =>
    start(async () => {
      await saveFaqExtras(JSON.stringify(items));
      setSaved(true);
      router.refresh();
    });

  return (
    <div className="adm-card adm-card-pad">
      <div className="mb-2 flex items-center gap-2">
        <span className="adm-gold-rule" />
        <h3 className="font-semibold text-[15px]" style={{ color: "rgb(var(--foreground))" }}>Ekstra SSS maddeleri</h3>
      </div>
      <p className="adm-help mb-4 mt-0">Buraya eklediğin soru-cevaplar SSS sayfasında mevcut maddelerin altına eklenir. Şu an <b>{langName}</b> dilini düzenliyorsun (diğer diller korunur). Kaydedince sitede anında görünür.</p>

      {items.length === 0 ? (
        <p className="adm-muted mb-4 text-[13.5px]">Henüz ekstra madde yok. Aşağıdan ekle.</p>
      ) : (
        <div className="space-y-4">
          {items.map((it, i) => (
            <div key={i} className="rounded-xl border p-4" style={{ borderColor: "rgb(var(--border))" }}>
              <div className="mb-3 flex items-center justify-between">
                <span className="adm-muted text-[12px] font-semibold">Madde {i + 1}</span>
                <div className="flex items-center gap-1.5">
                  <button type="button" onClick={() => move(i, -1)} className="adm-btn adm-btn-ghost adm-btn-sm" aria-label="Yukarı">↑</button>
                  <button type="button" onClick={() => move(i, 1)} className="adm-btn adm-btn-ghost adm-btn-sm" aria-label="Aşağı">↓</button>
                  <button type="button" onClick={() => remove(i)} className="adm-btn adm-btn-danger adm-btn-sm">Sil</button>
                </div>
              </div>
              <label className="adm-label">Soru</label>
              <input value={it.q[locale] ?? ""} onChange={(e) => edit(i, "q", e.target.value)} className="adm-input mb-3" placeholder="Örn. Ödeme nasıl yapılır?" />
              <label className="adm-label">Cevap</label>
              <textarea value={it.a[locale] ?? ""} onChange={(e) => edit(i, "a", e.target.value)} className="adm-textarea" placeholder="Cevabı yaz…" />
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button type="button" onClick={add} className="adm-btn adm-btn-ghost"><Icon name="plus" size={16} /> Madde ekle</button>
        <button type="button" onClick={save} disabled={pending} className="adm-btn adm-btn-primary">{pending ? "Kaydediliyor…" : "Kaydet"}</button>
        {saved && !pending ? <span className="adm-badge adm-badge-success"><Icon name="check" size={13} /> Kaydedildi</span> : null}
      </div>
    </div>
  );
}
