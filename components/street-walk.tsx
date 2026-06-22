"use client";

import { useState } from "react";

/**
 * "İçinde yürü" — Google Street View'ı ANAHTARSIZ gömer (svembed endpoint'i).
 * frame-src CSP'de google.com + maps.google.com'a açıktır; frame-ancestors 'none'
 * korunduğu için siteyi kimse iframe'leyemez. Her sekme bir lat/lng panoraması.
 *
 * cbll = kamera konumu (lat,lng) · cbp = 12,heading,0,0,0 (bakış yönü).
 * Koordinatlar curate edilmiştir; gerekirse Google Maps'te Street View'ı açıp
 * URL'deki !1d / @lat,lng değerinden ince ayar yapabilirsin.
 */
export type StreetSpot = {
  id: string;
  label: string;
  sub?: string;
  lat: number;
  lng: number;
  heading?: number;
};

function svUrl(s: StreetSpot) {
  const cbp = `12,${s.heading ?? 0},0,0,0`;
  return `https://maps.google.com/maps?layer=c&cbll=${s.lat},${s.lng}&cbp=${cbp}&source=embed&hl=tr&output=svembed`;
}

export function StreetWalk({
  spots,
  hint = "↻ Sürükleyerek 360° bak · yön oklarıyla sokakta yürü",
  ratioClass = "aspect-[16/10] sm:aspect-[2/1]",
}: {
  spots: StreetSpot[];
  hint?: string;
  ratioClass?: string;
}) {
  const [active, setActive] = useState(0);
  // iframe yalnız kullanıcı bir konum seçtiğinde / görünür olduğunda yüklenir
  const [loaded, setLoaded] = useState(false);
  const [ready, setReady] = useState(false);

  const spot = spots[active];

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-2.5" role="tablist" aria-label="Gezilecek sokaklar">
        {spots.map((s, i) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={i === active}
            className="street-tab"
            onClick={() => {
              setActive(i);
              setReady(false);
              setLoaded(true);
            }}
          >
            {s.label}
            {s.sub ? <span className="ml-1.5 opacity-60">· {s.sub}</span> : null}
          </button>
        ))}
      </div>

      <div
        className={`street-frame ${ratioClass}`}
        onMouseEnter={() => setLoaded(true)}
        onTouchStart={() => setLoaded(true)}
      >
        {loaded ? (
          <iframe
            key={spot.id}
            title={`${spot.label} — Street View`}
            src={svUrl(spot)}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            onLoad={() => setReady(true)}
          />
        ) : null}

        {(!loaded || !ready) && (
          <div className="street-loading">
            <span className="flex items-center gap-3">
              <span className="street-compass" />
              {loaded ? "Sokak yükleniyor…" : "Yürümek için dokun"}
            </span>
          </div>
        )}
      </div>

      <p className="mt-3 text-center text-xs" style={{ color: "rgb(var(--muted-foreground))" }}>
        {hint} — <span className="font-semibold">{spot.label}</span>
        {spot.sub ? `, ${spot.sub}` : ""}
      </p>
    </div>
  );
}
