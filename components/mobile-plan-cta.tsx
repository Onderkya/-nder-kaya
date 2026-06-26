"use client";

import { useEffect, useState } from "react";

/**
 * Mobil sabit "Tatil planı iste" pili — hero geçildikten sonra görünür.
 * Sol altta durur (sağ alttaki WhatsApp/Telegram kümesiyle çakışmaz). Yalnız mobil.
 */
export function MobilePlanCta({ label }: { label: string }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      // Hero geçildi mi + sayfa sonuna çok yakın değil mi
      const nearEnd = y + window.innerHeight > document.body.scrollHeight - 700;
      setShow(y > window.innerHeight * 0.85 && !nearEnd);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <a
      href="#hazir-rotalar"
      className={`fixed bottom-5 left-4 z-40 flex items-center gap-2 rounded-full py-3 pl-4 pr-5 text-sm font-bold text-white shadow-xl transition-all duration-300 lg:hidden ${
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
      style={{ backgroundImage: "linear-gradient(135deg, rgb(var(--accent2)), rgb(var(--accent)))" }}
    >
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14.5 21.7a.5.5 0 0 0 .94-.02l6.5-19a.5.5 0 0 0-.64-.64l-19 6.5a.5.5 0 0 0-.02.94l7.9 3.18a2 2 0 0 1 1.12 1.11z" />
        <path d="m21.85 2.15-10.94 10.94" />
      </svg>
      {label}
    </a>
  );
}
