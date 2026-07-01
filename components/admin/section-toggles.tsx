"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setSectionVisible } from "@/lib/section-actions";
import type { SectionDef } from "@/lib/section-registry";

/**
 * Sayfa bölümlerini sitede göster/gizle. Her bölüm bir aç/kapa anahtarı.
 * Kapatınca o bölüm public sayfada render edilmez (anında, ISR revalidate).
 */
export function SectionToggles({ sections, hidden }: { sections: SectionDef[]; hidden: string[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const hiddenSet = new Set(hidden);

  const toggle = (id: string, visible: boolean) =>
    start(async () => {
      await setSectionVisible(id, visible);
      router.refresh();
    });

  if (!sections.length) return null;

  return (
    <div className="adm-card adm-card-pad">
      <div className="mb-4 flex items-center gap-3">
        <span className="h-7 w-1.5 rounded-full" style={{ background: "rgb(var(--gold))" }} />
        <h3 className="adm-section-title">Bölümler — göster / gizle</h3>
      </div>
      <p className="adm-help mb-4 mt-0">Bu sayfadaki bölümleri sitede aç/kapat. Kapattığın bölüm ziyaretçilere görünmez; istediğinde geri aç.</p>
      <div className="space-y-2">
        {sections.map((s) => {
          const vis = !hiddenSet.has(s.id);
          return (
            <label
              key={s.id}
              className="flex items-center justify-between gap-3 rounded-xl border px-4 py-3"
              style={{ borderColor: "rgb(var(--border))", cursor: "pointer" }}
            >
              <span className="text-[14px] font-medium" style={{ color: "rgb(var(--foreground))" }}>{s.label}</span>
              <span className="adm-switch">
                <input type="checkbox" checked={vis} disabled={pending} onChange={(e) => toggle(s.id, e.target.checked)} />
                <span className="adm-switch-track" />
                <span className="adm-switch-label" style={{ color: vis ? "rgb(var(--primary))" : "rgb(var(--muted-foreground))", minWidth: 42 }}>{vis ? "Açık" : "Kapalı"}</span>
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
