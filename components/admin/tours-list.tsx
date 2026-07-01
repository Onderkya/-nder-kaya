"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toggleTour, moveTour, deleteTour } from "@/lib/tour-actions";
import { Badge } from "./ui";
import { Icon } from "./icons";

export type TourRow = {
  key: string;
  name: string;
  img: string;
  days: number;
  stars: number;
  aud: string;
  active: boolean;
  custom: boolean;
};

/** Turlar listesi — sitedeki görünümüyle kart kart; sırala / aç-kapat / düzenle / sil. */
export function ToursList({ tours }: { tours: TourRow[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const run = (fn: () => Promise<void>) => start(async () => { await fn(); router.refresh(); });

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tours.map((t, i) => (
        <div key={t.key} className="adm-thumb flex flex-col" style={{ opacity: t.active ? 1 : 0.55 }}>
          <div className="relative aspect-[16/10]" style={{ background: "rgb(var(--muted))" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={t.img} alt={t.name} className="h-full w-full object-cover" />
            <span className="absolute left-2 top-2 flex gap-1.5">
              {t.aud ? <span className="rounded-md px-2 py-0.5 text-[10.5px] font-bold uppercase text-white" style={{ background: "rgb(7 26 33 / 0.72)" }}>{t.aud}</span> : null}
              {t.custom ? <span className="rounded-md px-2 py-0.5 text-[10.5px] font-bold uppercase" style={{ background: "rgb(var(--gold) / 0.9)", color: "#fff" }}>özel</span> : null}
            </span>
            {!t.active ? <span className="adm-badge adm-badge-danger absolute right-2 top-2">Pasif</span> : null}
          </div>
          <div className="flex flex-1 flex-col p-4">
            <p className="font-display text-[1.15rem] font-semibold leading-tight" style={{ color: "rgb(var(--foreground))" }}>{t.name}</p>
            <p className="adm-muted mt-1 text-[12.5px]">{t.days} gün · {t.stars}★</p>

            <div className="mt-3 flex items-center justify-between gap-2">
              {/* Sıra */}
              <div className="flex items-center gap-1">
                <button type="button" disabled={pending || i === 0} onClick={() => run(() => moveTour(t.key, -1))} className="adm-btn adm-btn-ghost adm-btn-sm" aria-label="Yukarı" style={{ minHeight: 32, padding: "4px 9px" }}>←</button>
                <button type="button" disabled={pending || i === tours.length - 1} onClick={() => run(() => moveTour(t.key, 1))} className="adm-btn adm-btn-ghost adm-btn-sm" aria-label="Aşağı" style={{ minHeight: 32, padding: "4px 9px" }}>→</button>
              </div>
              {/* Aktif/Pasif */}
              <label className="adm-switch">
                <input type="checkbox" checked={t.active} disabled={pending} onChange={(e) => run(() => toggleTour(t.key, e.target.checked))} />
                <span className="adm-switch-track" />
              </label>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <Link href={`/admin/tours/${t.key}`} className="adm-btn adm-btn-primary adm-btn-sm flex-1">Düzenle</Link>
              {t.custom ? (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => { if (confirm(`"${t.name}" turu silinsin mi?`)) run(() => deleteTour(t.key)); }}
                  className="adm-btn adm-btn-danger adm-btn-sm"
                >
                  Sil
                </button>
              ) : (
                <Badge tone="neutral">kodlu</Badge>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Yeni tur */}
      <Link href="/admin/tours/yeni" className="adm-empty flex min-h-[240px] flex-col items-center justify-center gap-2 transition hover:opacity-80">
        <span className="grid h-12 w-12 place-items-center rounded-2xl" style={{ background: "rgb(var(--primary) / 0.12)", color: "rgb(var(--primary))" }}><Icon name="plus" size={24} /></span>
        <span className="font-semibold" style={{ color: "rgb(var(--foreground))" }}>Yeni tur ekle</span>
        <span className="adm-muted text-[12.5px]">Sıfırdan yeni paket</span>
      </Link>
    </div>
  );
}
