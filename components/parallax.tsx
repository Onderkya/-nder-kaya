"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Hafif scroll-parallax: içerik (genelde hero görseli) kaydırmadan biraz daha
 * yavaş hareket eder → "yağ gibi akan" derinlik hissi. rAF ile pürüzsüz,
 * prefers-reduced-motion altında kapalı. Kenar boşluğu oluşmaması için içteki
 * görsel ölçeklenmeli (örn. scale-[1.4]); section overflow-hidden olmalı.
 */
export function Parallax({
  children,
  speed = 0.12,
  className = "",
}: {
  children: ReactNode;
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const parent = el.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const shift = (rect.top + rect.height / 2 - window.innerHeight / 2) * -speed;
      el.style.transform = `translate3d(0, ${shift.toFixed(1)}px, 0)`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [speed]);

  return (
    <div ref={ref} className={className} style={{ willChange: "transform" }}>
      {children}
    </div>
  );
}
