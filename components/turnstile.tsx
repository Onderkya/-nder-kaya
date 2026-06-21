"use client";

import { useEffect, useRef } from "react";
import { siteConfig } from "@/lib/config";

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, any>) => string;
      remove: (id: string) => void;
      reset: (id?: string) => void;
    };
  }
}

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

/**
 * Cloudflare Turnstile widget'ı. Site key tanımlı değilse hiçbir şey render
 * etmez (captcha devre dışı). onToken, çözüm tamamlanınca token ile, süre
 * dolunca/hatada boş string ile çağrılır. Token tek kullanımlıktır; gönderim
 * sonrası parent reset etmek için window.turnstile.reset() kullanabilir.
 */
export function Turnstile({
  onToken,
  locale,
}: {
  onToken: (token: string) => void;
  locale?: string;
}) {
  const siteKey = siteConfig.turnstileSiteKey;
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  // onToken'ı ref'te tut → effect yalnızca [siteKey, locale]'e bağlı kalsın.
  const onTokenRef = useRef(onToken);
  onTokenRef.current = onToken;

  useEffect(() => {
    if (!siteKey) return;

    function render() {
      if (!ref.current || !window.turnstile || widgetId.current) return;
      widgetId.current = window.turnstile.render(ref.current, {
        sitekey: siteKey,
        language: locale || "auto",
        theme: "auto",
        callback: (t: string) => onTokenRef.current(t),
        "expired-callback": () => onTokenRef.current(""),
        "error-callback": () => onTokenRef.current(""),
      });
    }

    if (window.turnstile) {
      render();
      return;
    }

    let script = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
    if (!script) {
      script = document.createElement("script");
      script.src = SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
    script.addEventListener("load", render);

    return () => {
      script?.removeEventListener("load", render);
      if (widgetId.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetId.current);
        } catch {
          /* yoksay */
        }
        widgetId.current = null;
      }
    };
  }, [siteKey, locale]);

  if (!siteKey) return null;
  return <div ref={ref} className="cf-turnstile" />;
}
