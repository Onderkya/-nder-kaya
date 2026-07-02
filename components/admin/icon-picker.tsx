"use client";

import { useEffect, useMemo, useState } from "react";
import { RouteIcon } from "@/components/route-icons";
import { trAliasFragments } from "@/lib/icon-search-tr";
import { Icon } from "./icons";

/**
 * İKON SEÇİCİ (client) — modal. İki bölüm:
 *  1) "Site ikonları" — legacy route-icons seti (RouteIcon ile çizilir; eski
 *     adlar geçerli kalır, ör. "plane", "landmark").
 *  2) "Font Awesome" — /api/admin/icons'tan İLK AÇILIŞTA lazy fetch edilen düz
 *     JSON katalog (@fortawesome client bundle'a GİRMEZ). Arama: Türkçe takma-ad
 *     (tekne→ship...) VEYA FA adının/terimlerinin substring'i.
 *
 * Seçim: onPick(name) — legacy için düz ad ("plane"), FA için "fa:faXxx".
 */

/** Legacy route-icons seti — kullanıcıya anlamlı, sık kullanılan sırayla. */
const SITE_ICONS = [
  "plane", "car", "bed", "landmark", "sailboat", "anchor", "umbrella", "sunset",
  "waves", "droplet", "fish", "mountain", "flower", "flame", "cablecar", "ferris",
  "flag", "bag", "heart", "utensils", "headset",
];

type FaEntry = { name: string; viewBox: string; paths: string[]; terms: string[] };

export function IconPicker({
  value,
  onPick,
  onClose,
}: {
  value?: string;
  onPick: (name: string) => void;
  onClose: () => void;
}) {
  const [q, setQ] = useState("");
  const [fa, setFa] = useState<FaEntry[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // İlk açılışta FA kataloğunu lazy fetch et (bir kez).
  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetch("/api/admin/icons")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("İkonlar yüklenemedi"))))
      .then((d) => {
        if (alive) setFa(Array.isArray(d?.icons) ? d.icons : []);
      })
      .catch((e) => alive && setErr(e instanceof Error ? e.message : "İkonlar yüklenemedi"))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const siteMatches = useMemo(() => {
    const needle = q.trim().toLocaleLowerCase("tr");
    if (!needle) return SITE_ICONS;
    const frags = trAliasFragments(q);
    return SITE_ICONS.filter((n) => n.includes(needle) || frags.some((f) => n.includes(f)));
  }, [q]);

  const faMatches = useMemo(() => {
    if (!fa) return [];
    const needle = q.trim().toLocaleLowerCase("tr");
    if (!needle) return fa.slice(0, 120); // arama yokken ilk 120 (performans)
    const frags = trAliasFragments(q);
    const hit = (e: FaEntry) => {
      const bare = e.name.slice(3).toLowerCase(); // "faPersonSwimming"
      if (bare.toLowerCase().includes(needle)) return true;
      if (e.terms.some((t) => t.toLowerCase().includes(needle))) return true;
      if (frags.some((f) => bare.toLowerCase().includes(f) || e.terms.some((t) => t.includes(f)))) return true;
      return false;
    };
    return fa.filter(hit).slice(0, 240);
  }, [fa, q]);

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true">
      <button type="button" aria-label="Kapat" onClick={onClose} className="absolute inset-0" style={{ background: "rgb(7 26 33 / 0.55)" }} />
      <div className="adm-card relative z-10 flex max-h-[86vh] w-full flex-col overflow-hidden p-0 sm:max-w-2xl">
        <div className="flex items-center justify-between gap-3 border-b p-4" style={{ borderColor: "rgb(var(--border))" }}>
          <h4 className="font-semibold" style={{ color: "rgb(var(--foreground))" }}>İkon seç</h4>
          <button type="button" onClick={onClose} className="adm-btn adm-btn-ghost adm-btn-sm">✕</button>
        </div>
        <div className="p-4 pb-2">
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ara (tekne, müze, plaj, kalp, uçak…)"
            className="adm-input"
          />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
          {/* Site ikonları */}
          {siteMatches.length ? (
            <>
              <p className="adm-label mb-2 mt-1">Site ikonları</p>
              <div className="mb-4 grid grid-cols-6 gap-1.5 sm:grid-cols-8">
                {siteMatches.map((n) => (
                  <IconCell key={n} selected={value === n} onClick={() => onPick(n)} title={n}>
                    <RouteIcon name={n} className="h-5 w-5" />
                  </IconCell>
                ))}
              </div>
            </>
          ) : null}

          {/* Font Awesome */}
          <p className="adm-label mb-2">Font Awesome</p>
          {err ? <p className="adm-badge adm-badge-danger">{err}</p> : null}
          {loading && !fa ? <p className="adm-help mt-0">Yükleniyor…</p> : null}
          {fa && !faMatches.length ? <p className="adm-help mt-0">Eşleşen ikon yok.</p> : null}
          <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-8">
            {faMatches.map((e) => (
              <IconCell key={e.name} selected={value === e.name} onClick={() => onPick(e.name)} title={e.name.slice(3)}>
                <svg viewBox={e.viewBox} className="h-5 w-5" fill="currentColor" aria-hidden="true">
                  {e.paths.map((d, i) => (
                    <path key={i} d={d} />
                  ))}
                </svg>
              </IconCell>
            ))}
          </div>
          {fa && !q.trim() && fa.length > faMatches.length ? (
            <p className="adm-help">Aramak için yukarıya yaz — {fa.length} ikon mevcut.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function IconCell({
  children,
  selected,
  onClick,
  title,
}: {
  children: React.ReactNode;
  selected?: boolean;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="grid aspect-square place-items-center rounded-lg border transition"
      style={{
        borderColor: selected ? "rgb(var(--primary))" : "rgb(var(--border))",
        background: selected ? "rgb(var(--primary) / 0.08)" : "transparent",
        color: "rgb(var(--foreground))",
      }}
    >
      {children}
    </button>
  );
}

/** İkon butonu (satır kalıbında kullanılır) — mevcut ikonu gösterir, tıklayınca seçici. */
export function IconButton({
  name,
  onOpen,
}: {
  name: string;
  onOpen: () => void;
}) {
  const isFa = name.startsWith("fa:");
  return (
    <button
      type="button"
      onClick={onOpen}
      title="İkon değiştir"
      aria-label="İkon değiştir"
      className="grid h-[34px] w-[34px] flex-shrink-0 place-items-center rounded-lg border transition"
      style={{ borderColor: "rgb(var(--border))", color: "rgb(var(--primary))" }}
    >
      {isFa ? <FaInline name={name} /> : <RouteIcon name={name} className="h-[18px] w-[18px]" />}
    </button>
  );
}

/**
 * FA ikonunu buton içinde göstermek için: katalog client'ta yoksa (henüz fetch
 * edilmedi) nötr bir yer tutucu; katalog geldiğinde IconButton yeniden render
 * olur. Basitlik için sadece bir "yıldız/kutu" placeholder değil — grip ikonu.
 */
function FaInline({ name }: { name: string }) {
  const entry = useFaEntry(name);
  if (!entry) return <Icon name="bolt" size={18} />;
  return (
    <svg viewBox={entry.viewBox} className="h-[18px] w-[18px]" fill="currentColor" aria-hidden="true">
      {entry.paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}

/** Modül kapsamlı FA katalog önbelleği (buton önizlemeleri için tek fetch). */
let FA_CACHE: FaEntry[] | null = null;
let FA_PROMISE: Promise<FaEntry[]> | null = null;
const FA_LISTENERS = new Set<() => void>();

function loadFaCache(): Promise<FaEntry[]> {
  if (FA_CACHE) return Promise.resolve(FA_CACHE);
  if (!FA_PROMISE) {
    FA_PROMISE = fetch("/api/admin/icons")
      .then((r) => (r.ok ? r.json() : { icons: [] }))
      .then((d): FaEntry[] => {
        const list: FaEntry[] = Array.isArray(d?.icons) ? d.icons : [];
        FA_CACHE = list;
        FA_LISTENERS.forEach((fn) => fn());
        return list;
      })
      .catch((): FaEntry[] => {
        FA_CACHE = [];
        return [];
      });
  }
  return FA_PROMISE;
}

function useFaEntry(name: string): FaEntry | null {
  const [, force] = useState(0);
  useEffect(() => {
    if (FA_CACHE) return;
    const listener = () => force((n) => n + 1);
    FA_LISTENERS.add(listener);
    loadFaCache();
    return () => {
      FA_LISTENERS.delete(listener);
    };
  }, []);
  if (!FA_CACHE) return null;
  return FA_CACHE.find((e) => e.name === name) ?? null;
}
