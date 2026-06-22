"use client";

import { useState } from "react";

/**
 * Hafif YouTube "facade" — performans için önce sadece kapak görseli + oynat
 * butonu yüklenir; kullanıcı tıklayınca youtube-nocookie iframe'i gelir.
 * (CSP'de frame-src youtube-nocookie + img-src i.ytimg.com açık.)
 */
export function YouTubeEmbed({ id, title }: { id: string; title: string }) {
  const [play, setPlay] = useState(false);
  const thumb = `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;

  return (
    <div className="street-frame aspect-video">
      {play ? (
        <iframe
          title={title}
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`}
          allow="accelerated-rotation; autoplay; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
          loading="lazy"
          style={{ width: "100%", height: "100%", border: 0 }}
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlay(true)}
          aria-label={title}
          className="group absolute inset-0 h-full w-full"
          style={{ backgroundImage: `url(${thumb})`, backgroundSize: "cover", backgroundPosition: "center" }}
        >
          <span className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgb(8 6 20 / 0.15), rgb(8 6 20 / 0.55))" }} />
          <span className="absolute left-1/2 top-1/2 flex h-[68px] w-[96px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl shadow-2xl transition-transform duration-300 group-hover:scale-110" style={{ backgroundColor: "rgb(237 28 36 / 0.92)" }}>
            <svg viewBox="0 0 24 24" width="34" height="34" fill="#fff" aria-hidden><path d="M8 5v14l11-7z" /></svg>
          </span>
        </button>
      )}
    </div>
  );
}
