"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

/**
 * Türkçe kelime yapbozu — harf taşlarını yuvalara sürükle (veya dokun) ve
 * kelimeyi kur. Mouse + dokunmatik (Pointer Events). Doğru harf yuvaya
 * kilitlenir, yanlış taş titreyip geri döner. Tüm kelime tamamlanınca
 * konfeti + bir sonraki kelime. Türkçe öğrenmeyi "oyun" hâline getirir.
 */
export type PuzzleItem = { word: string; meaning: string; img?: string };

type Tile = { id: number; ch: string; used: boolean };

type Labels = {
  eyebrow: string;
  title: string;
  desc: string;
  prompt: string; // "Harfleri sürükleyip kelimeyi kur"
  meaning: string; // "anlamı"
  next: string;
  shuffle: string;
  done: string; // "Aferin! 🎉"
  allDone: string; // "Hepsini tamamladın! 🎉"
  restart: string;
  progress: string; // "{n} / {total}"
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeTiles(word: string): Tile[] {
  const letters = Array.from(word);
  let scrambled = shuffle(letters);
  // Aynı sıraya düşmesin (mümkünse)
  if (letters.length > 1 && scrambled.join("") === word) scrambled = shuffle(letters);
  return scrambled.map((ch, i) => ({ id: i, ch, used: false }));
}

export function AlphabetPuzzle({ items, labels }: { items: PuzzleItem[]; labels: Labels }) {
  const [idx, setIdx] = useState(0);
  const item = items[idx];
  const letters = useMemo(() => Array.from(item.word), [item.word]);

  const [tiles, setTiles] = useState<Tile[]>(() => makeTiles(item.word));
  const [slots, setSlots] = useState<(string | null)[]>(() => letters.map(() => null));
  const [drag, setDrag] = useState<{ id: number; ch: string; x: number; y: number } | null>(null);
  const [overSlot, setOverSlot] = useState<number | null>(null);
  const [shakeId, setShakeId] = useState<number | null>(null);
  const [won, setWon] = useState(false);
  const [allDone, setAllDone] = useState(false);
  const [showMeaning, setShowMeaning] = useState(false);

  const slotRefs = useRef<Array<HTMLDivElement | null>>([]);
  const stageRef = useRef<HTMLDivElement>(null);
  const startPt = useRef<{ x: number; y: number; moved: boolean }>({ x: 0, y: 0, moved: false });

  const resetWord = useCallback((word: string) => {
    setTiles(makeTiles(word));
    setSlots(Array.from(word).map(() => null));
    setWon(false);
    setShowMeaning(false);
    setOverSlot(null);
  }, []);

  // Kelime değişince yenile
  useEffect(() => {
    resetWord(item.word);
  }, [item.word, resetWord]);

  const solved = slots.every((s) => s !== null);

  // Kazanma efekti
  useEffect(() => {
    if (!solved || won) return;
    setWon(true);
    fireConfetti(stageRef.current);
    const last = idx >= items.length - 1;
    const t = setTimeout(() => {
      if (last) setAllDone(true);
      else setIdx((v) => v + 1);
    }, 1500);
    return () => clearTimeout(t);
  }, [solved, won, idx, items.length]);

  const placeInSlot = useCallback(
    (slotIndex: number, tile: Tile) => {
      if (slots[slotIndex] !== null) return false;
      if (letters[slotIndex] !== tile.ch) return false;
      setSlots((prev) => {
        const next = [...prev];
        next[slotIndex] = tile.ch;
        return next;
      });
      setTiles((prev) => prev.map((t) => (t.id === tile.id ? { ...t, used: true } : t)));
      return true;
    },
    [slots, letters],
  );

  const autoPlace = useCallback(
    (tile: Tile) => {
      const target = letters.findIndex((ch, i) => ch === tile.ch && slots[i] === null);
      if (target >= 0) placeInSlot(target, tile);
      else {
        setShakeId(tile.id);
        setTimeout(() => setShakeId(null), 420);
      }
    },
    [letters, slots, placeInSlot],
  );

  // Sürükleme — global pointer dinleyicileri
  useEffect(() => {
    if (!drag) return;
    const onMove = (e: PointerEvent) => {
      const dx = e.clientX - startPt.current.x;
      const dy = e.clientY - startPt.current.y;
      if (Math.hypot(dx, dy) > 6) startPt.current.moved = true;
      setDrag((d) => (d ? { ...d, x: e.clientX, y: e.clientY } : d));
      // Hangi yuvanın üzerindeyiz?
      let found: number | null = null;
      slotRefs.current.forEach((el, i) => {
        if (!el || slots[i] !== null) return;
        const r = el.getBoundingClientRect();
        if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) found = i;
      });
      setOverSlot(found);
    };
    const onUp = () => {
      const tile = tiles.find((t) => t.id === drag.id);
      if (tile) {
        if (overSlot !== null) {
          const ok = placeInSlot(overSlot, tile);
          if (!ok) {
            setShakeId(tile.id);
            setTimeout(() => setShakeId(null), 420);
          }
        } else if (!startPt.current.moved) {
          autoPlace(tile);
        }
      }
      setDrag(null);
      setOverSlot(null);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [drag, tiles, slots, overSlot, placeInSlot, autoPlace]);

  const onTilePointerDown = (e: React.PointerEvent, tile: Tile) => {
    if (tile.used || won) return;
    startPt.current = { x: e.clientX, y: e.clientY, moved: false };
    setDrag({ id: tile.id, ch: tile.ch, x: e.clientX, y: e.clientY });
  };

  return (
    <div className="puzzle-stage" ref={stageRef}>
      <div className="mx-auto max-w-3xl text-center">
        <p className="eyebrow justify-center" style={{ color: "rgb(var(--accent))" }}>{labels.eyebrow}</p>
        <h2 className="h-section mt-4" style={{ color: "rgb(var(--foreground))" }}>{labels.title}</h2>
        <p className="mt-4 text-lg leading-relaxed" style={{ color: "rgb(var(--muted-foreground))" }}>{labels.desc}</p>
      </div>

      {allDone ? (
        <div className="mx-auto mt-12 max-w-md text-center">
          <p className="font-display text-3xl" style={{ color: "rgb(var(--primary))" }}>{labels.allDone}</p>
          <button
            type="button"
            className="btn-primary mt-7"
            onClick={() => {
              setAllDone(false);
              setIdx(0);
            }}
          >
            {labels.restart}
          </button>
        </div>
      ) : (
        <div className="mx-auto mt-12 max-w-2xl">
          {/* İpucu görseli + anlam */}
          <div className="mb-8 flex flex-col items-center gap-4">
            {item.img ? (
              <figure className="img-zoom relative h-40 w-full max-w-sm overflow-hidden rounded-3xl shadow-lg sm:h-48">
                <Image src={item.img} alt={item.meaning} fill sizes="(max-width:640px) 90vw, 384px" className="object-cover" />
                <figcaption className="img-scrim-soft absolute inset-x-0 bottom-0 p-4 text-left text-white">
                  <span className="tracking-widest2 text-[10px] uppercase text-white/70">{labels.meaning}</span>
                  <p className="font-display text-xl leading-none">{item.meaning}</p>
                </figcaption>
              </figure>
            ) : (
              <button
                type="button"
                onClick={() => setShowMeaning((v) => !v)}
                className="rounded-full border px-5 py-2 text-sm font-semibold"
                style={{ borderColor: "rgb(var(--border))", color: "rgb(var(--muted-foreground))" }}
              >
                {showMeaning ? `${labels.meaning}: ${item.meaning}` : `${labels.meaning} →`}
              </button>
            )}
          </div>

          {/* Yuvalar */}
          <div className={`flex flex-wrap items-center justify-center gap-2 sm:gap-3 ${won ? "puzzle-win" : ""}`}>
            {letters.map((_, i) => (
              <div
                key={i}
                ref={(el) => {
                  slotRefs.current[i] = el;
                }}
                className="puzzle-slot"
                data-filled={slots[i] !== null}
                data-over={overSlot === i}
              >
                {slots[i] ?? ""}
              </div>
            ))}
          </div>

          {won && <p className="mt-6 text-center font-display text-2xl" style={{ color: "rgb(var(--primary))" }}>{labels.done}</p>}

          {/* Taş tepsisi */}
          <div className="mt-9 flex min-h-[5rem] flex-wrap items-center justify-center gap-2 sm:gap-3">
            {tiles.map((tile) => (
              <button
                key={tile.id}
                type="button"
                className={`puzzle-tile ${shakeId === tile.id ? "puzzle-shake" : ""}`}
                data-used={tile.used}
                data-dragging={drag?.id === tile.id}
                style={
                  drag?.id === tile.id
                    ? { left: drag.x, top: drag.y, transform: "translate(-50%, -50%) scale(1.1) rotate(-3deg)" }
                    : undefined
                }
                onPointerDown={(e) => onTilePointerDown(e, tile)}
                aria-label={tile.ch}
              >
                {tile.ch}
              </button>
            ))}
            {/* Sürüklenen taşın boş yeri görünmesin diye placeholder yok; tepsi sabit yükseklikte */}
          </div>

          {/* Kontroller */}
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <button type="button" className="btn-outline" onClick={() => resetWord(item.word)}>
              ↻ {labels.shuffle}
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                if (idx >= items.length - 1) setAllDone(true);
                else setIdx((v) => v + 1);
              }}
            >
              {labels.next} →
            </button>
          </div>

          {/* İlerleme */}
          <div className="mt-8">
            <div className="mx-auto h-1.5 max-w-xs overflow-hidden rounded-full" style={{ backgroundColor: "rgb(var(--border))" }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${((idx + (won ? 1 : 0)) / items.length) * 100}%`, backgroundImage: "linear-gradient(90deg, rgb(var(--lagoon)), rgb(var(--primary)))" }}
              />
            </div>
            <p className="mt-3 text-center text-xs tracking-widest2 uppercase" style={{ color: "rgb(var(--muted-foreground))" }}>
              {labels.progress.replace("{n}", String(idx + 1)).replace("{total}", String(items.length))}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/** Yuvaların etrafına kısa ömürlü konfeti parıltıları saçar. */
function fireConfetti(host: HTMLElement | null) {
  if (!host) return;
  if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const colors = ["#12b8cc", "#0d94a8", "#f45e23", "#f9a826", "#fde68a"];
  const rect = host.getBoundingClientRect();
  const cx = rect.width / 2;
  const cy = rect.height * 0.42;
  for (let i = 0; i < 26; i++) {
    const s = document.createElement("span");
    s.className = "spark";
    const ang = (Math.PI * 2 * i) / 26 + Math.random() * 0.4;
    const dist = 90 + Math.random() * 150;
    s.style.left = `${cx}px`;
    s.style.top = `${cy}px`;
    s.style.background = colors[i % colors.length];
    s.style.setProperty("--sx", `${Math.cos(ang) * dist}px`);
    s.style.setProperty("--sy", `${Math.sin(ang) * dist - 40}px`);
    host.appendChild(s);
    setTimeout(() => s.remove(), 950);
  }
}
