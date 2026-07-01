"use client";

import { useEffect } from "react";

/**
 * Site geneli "yağ gibi akan" momentum scroll (Lenis) + GSAP ScrollTrigger
 * senkronizasyonu. Tek rAF döngüsü GSAP ticker'dan sürülür (autoRaf:false).
 * prefers-reduced-motion altında devre dışı — yerel/native scroll kullanılır.
 *
 * PERF: Lenis + GSAP + ScrollTrigger (~120KB) statik değil, mount sonrası
 * dinamik import edilir → başlangıç JS paketinden çıkar; ilk boyama hızlanır.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cleanup: (() => void) | undefined;
    let cancelled = false;

    Promise.all([import("lenis"), import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([{ default: Lenis }, { gsap }, { ScrollTrigger }]) => {
        if (cancelled) return;
        gsap.registerPlugin(ScrollTrigger);

        const lenis = new Lenis({
          duration: 1.15,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true,
          syncTouch: false,
          touchMultiplier: 1.6,
        });

        lenis.on("scroll", ScrollTrigger.update);

        const onTick = (time: number) => lenis.raf(time * 1000);
        gsap.ticker.add(onTick);
        gsap.ticker.lagSmoothing(0);

        // Görseller yüklendikçe pin/scrub ölçümlerini tazele
        const refresh = () => ScrollTrigger.refresh();
        window.addEventListener("load", refresh);
        const t = window.setTimeout(refresh, 600);

        cleanup = () => {
          window.removeEventListener("load", refresh);
          window.clearTimeout(t);
          gsap.ticker.remove(onTick);
          lenis.destroy();
        };
      },
    );

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return null;
}
