"use client";

import { useEffect, useRef, useState } from "react";
import lottie, { type AnimationItem } from "lottie-web";

/**
 * PetLingo CANLI demo — uygulamadaki gerçek Lottie pet animasyonları (sunucudan
 * alındı: /lottie/*.json). Alttaki pet'e tıkla → büyük 3D pet değişir; ayrıca
 * otomatik döngüde gezinir. Soru kartı da canlı döner. Sadece görünürken oynar.
 */
const PETS = [
  { key: "cat", emoji: "🐱", name: "Pamuk" },
  { key: "dog", emoji: "🐶", name: "Karabaş" },
  { key: "panda", emoji: "🐼", name: "Bambu" },
  { key: "fox", emoji: "🦊", name: "Tilki" },
  { key: "bird", emoji: "🐦", name: "Maviş" },
];

const QUIZ = [
  { q: "Sea", opts: [["Deniz", true], ["Güneş", false], ["Çay", false]] },
  { q: "Sun", opts: [["Güneş", true], ["Kale", false], ["Liman", false]] },
  { q: "Castle", opts: [["Kale", true], ["Deniz", false], ["Kahve", false]] },
  { q: "Tea", opts: [["Çay", true], ["Güneş", false], ["Deniz", false]] },
] as const;

export function PetLingoLive() {
  const box = useRef<HTMLDivElement>(null);
  const anim = useRef<AnimationItem | null>(null);
  const [pet, setPet] = useState(0);
  const [quiz, setQuiz] = useState(0);
  const [autoPet, setAutoPet] = useState(true);

  // Aktif pet animasyonunu yükle (önceki imha edilir).
  useEffect(() => {
    if (!box.current) return;
    anim.current?.destroy();
    anim.current = lottie.loadAnimation({
      container: box.current,
      renderer: "svg",
      loop: true,
      autoplay: true,
      path: `/lottie/${PETS[pet].key}.json`,
    });
    return () => anim.current?.destroy();
  }, [pet]);

  // Otomatik pet + soru döngüsü (kullanıcı tıklayınca pet otomatiği kısa süre durur).
  useEffect(() => {
    const id = setInterval(() => {
      if (autoPet) setPet((p) => (p + 1) % PETS.length);
      setQuiz((q) => (q + 1) % QUIZ.length);
    }, 4200);
    return () => clearInterval(id);
  }, [autoPet]);

  const onPick = (i: number) => {
    setPet(i);
    setAutoPet(false);
    window.setTimeout(() => setAutoPet(true), 9000);
  };

  const cur = QUIZ[quiz];

  return (
    <>
      {/* HUD */}
      <div className="flex items-center justify-between text-[13px] font-semibold" style={{ color: "#0b3a47" }}>
        <span>🔥 7</span>
        <span>❤️ ❤️ ❤️</span>
        <span>⭐ 240</span>
      </div>

      {/* Büyük canlı 3D pet */}
      <div className="mt-3 text-center">
        <div ref={box} className="mx-auto h-32 w-32" role="img" aria-label={`PetLingo 3D pet: ${PETS[pet].name}`} />
        <div className="mx-auto -mt-1 w-fit rounded-full bg-white/90 px-3 py-0.5 text-[11px] font-bold shadow" style={{ color: "#0b3a47" }}>
          {PETS[pet].name}
        </div>
        <div className="mx-auto mt-2 w-fit rounded-2xl bg-white px-4 py-2 text-sm font-semibold shadow" style={{ color: "#0b3a47" }}>
          &ldquo;{cur.q}&rdquo; → Türkçe?
        </div>
      </div>

      {/* Şıklar */}
      <div className="mt-4 space-y-2.5">
        {cur.opts.map(([t, ok]) => (
          <div
            key={t}
            className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition"
            style={
              ok
                ? { background: "linear-gradient(135deg,#12b8cc,#0d94a8)", color: "#fff", boxShadow: "0 8px 18px -8px rgba(13,148,168,0.7)" }
                : { background: "#fff", color: "#0b3a47" }
            }
          >
            {t}
            {ok ? <span>✓</span> : null}
          </div>
        ))}
      </div>

      {/* İlerleme */}
      <div className="mt-4 h-2.5 overflow-hidden rounded-full" style={{ background: "#cfeef3" }}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${40 + pet * 12}%`, background: "linear-gradient(90deg,#f9a826,#f45e23)" }} />
      </div>

      {/* Pet seçici (tıkla → büyük pet değişir) */}
      <div className="mt-3 flex justify-center gap-1.5">
        {PETS.map((p, i) => (
          <button
            key={p.key}
            type="button"
            onClick={() => onPick(i)}
            aria-label={p.name}
            aria-pressed={i === pet}
            className="grid h-9 w-9 place-items-center rounded-xl text-lg transition"
            style={
              i === pet
                ? { background: "linear-gradient(135deg,#12b8cc,#0d94a8)", transform: "scale(1.12)", boxShadow: "0 8px 16px -8px rgba(13,148,168,0.8)" }
                : { background: "#eafaff" }
            }
          >
            {p.emoji}
          </button>
        ))}
      </div>
    </>
  );
}
