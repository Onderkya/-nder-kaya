"use client";

import { RouteIcon } from "@/components/route-icons";
import type { FaIconData } from "@/components/fa-icon";

/**
 * TUR İKONU (client) — tek geçit. Server (ready-routes) ikonu SERİLEŞTİRİLEBİLİR
 * biçime çözer: ya legacy `{name}` (RouteIcon çizer) ya da `{fa:{viewBox,paths}}`
 * (server-side @fortawesome verisinden çıkarılmış inline svg). Böylece FA paketi
 * client bundle'a girmez ama admin `fa:faXxx` ikonları da render edilebilir.
 *
 * NO-OVERRIDE EŞDEĞERLİĞİ: cfg yokken her ikon legacy addır → `{name}` → çıktı
 * `<RouteIcon name={name} className={className}/>` ile birebir aynı.
 */
export type TourIconData = { name: string } | { fa: FaIconData };

export function TourIcon({ icon, className }: { icon: TourIconData; className?: string }) {
  if ("fa" in icon) {
    return (
      <svg viewBox={icon.fa.viewBox} className={className} fill="currentColor" aria-hidden="true">
        {icon.fa.paths.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </svg>
    );
  }
  return <RouteIcon name={icon.name} className={className} />;
}
