/**
 * Antalya / Akdeniz dekoratif sahne — el yapımı SVG (deniz, güneş, yelkenliler,
 * palmiyeler, kıyı silüeti). Hero degradesinin üzerine düşük opaklıkta bindirilir;
 * gerçek bir fotoğraf gerektirmeden "Antalya kartpostalı" hissi verir. İstenirse
 * `public/images/hero.jpg` eklenip bu sahne yerine fotoğraf kullanılabilir.
 * Tamamen sunucu tarafı (statik), erişilebilirlik için aria-hidden.
 */
export function AntalyaScene({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 800 500"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="sun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fde68a" stopOpacity="0.95" />
          <stop offset="45%" stopColor="#fb923c" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#fb923c" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.30" />
          <stop offset="100%" stopColor="#0e7490" stopOpacity="0.05" />
        </linearGradient>
      </defs>

      {/* Güneş + parıltı */}
      <circle cx="600" cy="150" r="170" fill="url(#sun)" />
      <circle cx="600" cy="150" r="58" fill="#fde68a" opacity="0.9" />

      {/* Uzak kıyı silüeti + Hıdırlık kulesi esintisi */}
      <g fill="#0c4a5c" opacity="0.55">
        <path d="M0 300 q120 -34 240 -8 t260 -6 300 4 V340 H0 Z" />
        <rect x="150" y="252" width="34" height="48" rx="3" />
        <rect x="146" y="244" width="42" height="12" rx="3" />
        <rect x="470" y="240" width="20" height="60" />
        <path d="M480 224 l12 18 h-24 Z" />
      </g>

      {/* Deniz */}
      <rect x="0" y="320" width="800" height="180" fill="url(#sea)" />
      <g stroke="#a5f3fc" strokeWidth="2" opacity="0.35" fill="none" strokeLinecap="round">
        <path d="M60 360 q14 -8 28 0 t28 0" />
        <path d="M520 380 q14 -8 28 0 t28 0" />
        <path d="M300 410 q14 -8 28 0 t28 0" />
        <path d="M640 350 q14 -8 28 0 t28 0" />
      </g>

      {/* Yelkenliler */}
      <g opacity="0.85">
        <g transform="translate(360 300)">
          <path d="M0 0 L0 -64" stroke="#e2f0f3" strokeWidth="2.5" />
          <path d="M2 -60 L40 -6 L2 -6 Z" fill="#f8fafc" opacity="0.92" />
          <path d="M-2 -52 L-30 -6 L-2 -6 Z" fill="#cffafe" opacity="0.8" />
          <path d="M-30 0 L34 0 L24 16 L-20 16 Z" fill="#0c4a5c" />
        </g>
        <g transform="translate(150 332) scale(0.62)">
          <path d="M0 0 L0 -64" stroke="#e2f0f3" strokeWidth="3" />
          <path d="M2 -60 L40 -6 L2 -6 Z" fill="#f8fafc" opacity="0.9" />
          <path d="M-30 0 L34 0 L24 16 L-20 16 Z" fill="#0c4a5c" />
        </g>
      </g>

      {/* Palmiyeler */}
      <g fill="#0c4a5c" opacity="0.85">
        <g transform="translate(720 360)">
          <path d="M-4 0 C-2 -40 2 -70 6 -96 L12 -96 C8 -68 6 -38 6 0 Z" />
          <g fill="none" stroke="#0c4a5c" strokeWidth="7" strokeLinecap="round" opacity="0.9">
            <path d="M8 -98 C-22 -118 -52 -116 -74 -104" />
            <path d="M8 -98 C-14 -130 -40 -142 -66 -146" />
            <path d="M8 -98 C8 -134 18 -160 34 -176" />
            <path d="M8 -98 C36 -126 64 -134 90 -132" />
            <path d="M8 -98 C34 -118 60 -118 82 -104" />
          </g>
        </g>
        <g transform="translate(70 372) scale(0.8)">
          <path d="M-4 0 C-2 -40 2 -70 6 -96 L12 -96 C8 -68 6 -38 6 0 Z" />
          <g fill="none" stroke="#0c4a5c" strokeWidth="8" strokeLinecap="round" opacity="0.9">
            <path d="M8 -98 C38 -118 68 -116 90 -104" />
            <path d="M8 -98 C30 -130 56 -142 82 -146" />
            <path d="M8 -98 C8 -134 -2 -160 -18 -176" />
            <path d="M8 -98 C-20 -126 -48 -134 -74 -132" />
            <path d="M8 -98 C-18 -118 -44 -118 -66 -104" />
          </g>
        </g>
      </g>

      {/* Uçan martılar */}
      <g stroke="#e2f0f3" strokeWidth="2.5" fill="none" opacity="0.6" strokeLinecap="round">
        <path d="M180 120 q12 -10 24 0 q12 -10 24 0" />
        <path d="M250 90 q9 -7 18 0 q9 -7 18 0" />
      </g>
    </svg>
  );
}
