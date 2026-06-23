"use client";

import { useEffect, useRef, useState } from "react";
import lottie, { type AnimationItem } from "lottie-web";

/**
 * PetLingo CANLI mini-oyun — uygulamadaki gerçek Lottie pet animasyonları
 * (sunucudan: /lottie/*.json). Her pet'in kendi kelime seti var; şıkka tıkla:
 * doğru → puan + seri + konfeti, yanlış → sallanma + can. Pet'e tıkla → değiştir.
 */
type Q = { w: string; opts: [string, boolean][] };
type Pet = { key: string; emoji: string; name: string; q: Q[] };

const PETS: Pet[] = [
  {
    key: "cat", emoji: "🐱", name: "Pamuk",
    q: [
      { w: "Sea", opts: [["Deniz", true], ["Dağ", false], ["Çay", false]] },
      { w: "Cat", opts: [["Köpek", false], ["Kedi", true], ["Kuş", false]] },
      { w: "Sun", opts: [["Su", false], ["Güneş", true], ["Kale", false]] },
    ],
  },
  {
    key: "dog", emoji: "🐶", name: "Karabaş",
    q: [
      { w: "Dog", opts: [["Köpek", true], ["Kedi", false], ["Kuş", false]] },
      { w: "Water", opts: [["Çay", false], ["Su", true], ["Deniz", false]] },
      { w: "Friend", opts: [["Arkadaş", true], ["Aile", false], ["Komşu", false]] },
    ],
  },
  {
    key: "panda", emoji: "🐼", name: "Bambu",
    q: [
      { w: "Tea", opts: [["Çay", true], ["Kahve", false], ["Su", false]] },
      { w: "Mountain", opts: [["Deniz", false], ["Dağ", true], ["Orman", false]] },
      { w: "Green", opts: [["Mavi", false], ["Kırmızı", false], ["Yeşil", true]] },
    ],
  },
  {
    key: "fox", emoji: "🦊", name: "Tilki",
    q: [
      { w: "Castle", opts: [["Kale", true], ["Köprü", false], ["Kule", false]] },
      { w: "Harbor", opts: [["Sahil", false], ["Liman", true], ["Ada", false]] },
      { w: "Red", opts: [["Kırmızı", true], ["Sarı", false], ["Mavi", false]] },
    ],
  },
  {
    key: "bird", emoji: "🐦", name: "Maviş",
    q: [
      { w: "Sky", opts: [["Deniz", false], ["Gökyüzü", true], ["Bulut", false]] },
      { w: "Bird", opts: [["Balık", false], ["Kuş", true], ["Kedi", false]] },
      { w: "Blue", opts: [["Mavi", true], ["Yeşil", false], ["Mor", false]] },
    ],
  },
];

const SPARK_COLORS = ["#f9a826", "#12b8cc", "#f45e23", "#7be0ff", "#ffd76b"];

export function PetLingoLive() {
  const box = useRef<HTMLDivElement>(null);
  const anim = useRef<AnimationItem | null>(null);
  const [petIdx, setPetIdx] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [picked, setPicked] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [sparks, setSparks] = useState<{ id: number; x: number; y: number; c: string }[]>([]);
  const sparkId = useRef(0);

  const pet = PETS[petIdx];
  const q = pet.q[qIdx];

  // Aktif pet animasyonu (önceki imha edilir).
  useEffect(() => {
    if (!box.current) return;
    anim.current?.destroy();
    anim.current = lottie.loadAnimation({
      container: box.current,
      renderer: "svg",
      loop: true,
      autoplay: true,
      path: `/lottie/${pet.key}.json`,
    });
    return () => anim.current?.destroy();
  }, [petIdx, pet.key]);

  const pickPet = (i: number) => {
    setPetIdx(i);
    setQIdx(0);
    setPicked(null);
  };

  const answer = (label: string, ok: boolean) => {
    if (picked) return;
    setPicked(label);
    if (ok) {
      setScore((s) => s + 10 + streak * 2);
      setStreak((s) => s + 1);
      // konfeti
      const burst = Array.from({ length: 10 }, () => ({
        id: sparkId.current++,
        x: (Math.random() - 0.5) * 160,
        y: -(Math.random() * 120 + 30),
        c: SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)],
      }));
      setSparks((s) => [...s, ...burst]);
      window.setTimeout(() => setSparks((s) => s.slice(burst.length)), 900);
      window.setTimeout(() => {
        setPicked(null);
        setQIdx((i) => {
          if (i + 1 >= pet.q.length) {
            setPetIdx((p) => (p + 1) % PETS.length);
            return 0;
          }
          return i + 1;
        });
      }, 850);
    } else {
      setStreak(0);
      setHearts((h) => (h <= 1 ? 3 : h - 1));
      setShake(true);
      window.setTimeout(() => setShake(false), 450);
      window.setTimeout(() => setPicked(null), 650);
    }
  };

  return (
    <>
      {/* HUD */}
      <div className="flex items-center justify-between text-[13px] font-semibold" style={{ color: "#0b3a47" }}>
        <span>🔥 {streak}</span>
        <span>{"❤️".repeat(hearts)}</span>
        <span>⭐ {score}</span>
      </div>

      {/* Büyük canlı 3D pet + konfeti */}
      <div className="relative mt-2 text-center">
        <div ref={box} className={`mx-auto h-24 w-24 ${shake ? "puzzle-shake" : ""}`} role="img" aria-label={`PetLingo: ${pet.name}`} />
        <div className="pointer-events-none absolute left-1/2 top-12">
          {sparks.map((sp) => (
            <span
              key={sp.id}
              className="spark"
              style={{ background: sp.c, ["--sx" as string]: `${sp.x}px`, ["--sy" as string]: `${sp.y}px` } as React.CSSProperties}
            />
          ))}
        </div>
        <div className="mx-auto -mt-1 w-fit rounded-full bg-white/90 px-3 py-0.5 text-[11px] font-bold shadow" style={{ color: "#0b3a47" }}>
          {pet.name}
        </div>
        <div className="mx-auto mt-2 w-fit rounded-2xl bg-white px-4 py-2 text-sm font-semibold shadow" style={{ color: "#0b3a47" }}>
          &ldquo;{q.w}&rdquo; → Türkçe?
        </div>
      </div>

      {/* Şıklar — tıkla */}
      <div className="mt-3 space-y-2">
        {q.opts.map(([label, ok]) => {
          const isPicked = picked === label;
          const reveal = picked !== null;
          let bg = "#fff", color = "#0b3a47", shadow = "none";
          if (reveal && ok) { bg = "linear-gradient(135deg,#12b8cc,#0d94a8)"; color = "#fff"; shadow = "0 8px 18px -8px rgba(13,148,168,0.7)"; }
          else if (isPicked && !ok) { bg = "linear-gradient(135deg,#f87171,#ef4444)"; color = "#fff"; }
          return (
            <button
              key={label}
              type="button"
              disabled={reveal}
              onClick={() => answer(label, ok)}
              className="flex w-full items-center justify-between rounded-2xl px-4 py-2.5 text-sm font-semibold transition active:scale-[0.98]"
              style={{ background: bg, color, boxShadow: shadow }}
            >
              {label}
              {reveal && ok ? <span>✓</span> : isPicked && !ok ? <span>✕</span> : null}
            </button>
          );
        })}
      </div>

      {/* İlerleme */}
      <div className="mt-3 h-2.5 overflow-hidden rounded-full" style={{ background: "#cfeef3" }}>
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${((qIdx + (picked ? 1 : 0)) / pet.q.length) * 100}%`, background: "linear-gradient(90deg,#f9a826,#f45e23)" }} />
      </div>

      {/* Pet seçici */}
      <div className="mt-3 flex justify-center gap-1.5">
        {PETS.map((p, i) => (
          <button
            key={p.key}
            type="button"
            onClick={() => pickPet(i)}
            aria-label={p.name}
            aria-pressed={i === petIdx}
            className="grid h-9 w-9 place-items-center rounded-xl text-lg transition"
            style={
              i === petIdx
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
