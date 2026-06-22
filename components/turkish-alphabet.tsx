"use client";

import { useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/routing";
import { IconArrow } from "@/components/icons";

type Props = {
  eyebrow: string;
  title: string;
  desc: string;
  cta: string;
};

const LETTERS = "A B C Ç D E F G Ğ H I İ J K L M N O Ö P R S Ş T U Ü V Y Z".split(" ");
const TR_SPECIAL = new Set(["Ç", "Ğ", "İ", "I", "Ö", "Ş", "Ü"]);

// Her harf için ekran dışından deterministik başlangıç konumu (vw/vh) + dönüş.
function startTransform(i: number) {
  const r = (s: number) => {
    const x = Math.sin((i + 1) * s) * 10000;
    return x - Math.floor(x);
  };
  const edge = i % 4;
  const dist = 65 + r(12.9898) * 45;
  let x = 0;
  let y = 0;
  if (edge === 0) {
    x = -dist;
    y = r(3.1) * 140 - 70;
  } else if (edge === 1) {
    x = dist;
    y = r(7.7) * 140 - 70;
  } else if (edge === 2) {
    y = -dist;
    x = r(9.3) * 140 - 70;
  } else {
    y = dist;
    x = r(11.1) * 140 - 70;
  }
  const rot = r(5.5) * 160 - 80;
  return `translate3d(${x.toFixed(1)}vw, ${y.toFixed(1)}vh, 0) rotate(${rot.toFixed(0)}deg) scale(0.4)`;
}

export function TurkishAlphabet({ eyebrow, title, desc, cta }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setInView(true);
            obs.disconnect();
            break;
          }
        }
      },
      { threshold: 0.25 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden py-24 sm:py-32"
      style={{ backgroundColor: "#08222b" }}
    >
      {/* harf alanı */}
      <div className="container-wide relative">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-3 gap-y-1 sm:gap-x-5">
          {LETTERS.map((l, i) => (
            <span
              key={i}
              className="tletter font-display font-semibold leading-none"
              style={{
                fontSize: "clamp(2rem, 6vw, 5.5rem)",
                color: TR_SPECIAL.has(l) ? "rgb(var(--accent))" : "rgba(233,240,240,0.92)",
                transform: inView ? "none" : startTransform(i),
                opacity: inView ? 1 : 0,
                transitionDelay: `${i * 28}ms`,
              }}
            >
              {l}
            </span>
          ))}
        </div>

        {/* başlık */}
        <div
          className="mx-auto mt-14 max-w-2xl text-center text-white transition-all duration-700"
          style={{ opacity: inView ? 1 : 0, transform: inView ? "none" : "translateY(24px)", transitionDelay: "900ms" }}
        >
          <p className="eyebrow justify-center" style={{ color: "rgb(var(--accent))" }}>{eyebrow}</p>
          <h2 className="h-section mt-5">{title}</h2>
          <p className="mx-auto mt-4 max-w-lg text-white/75">{desc}</p>
          <Link href="/lessons" className="btn-accent mt-8">
            {cta} <IconArrow />
          </Link>
        </div>
      </div>
    </section>
  );
}
