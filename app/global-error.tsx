"use client";

import { useEffect } from "react";

/**
 * Kök seviye son-çare hata sınırı. Root layout dahil her şey çökerse devreye
 * girer; bu yüzden kendi <html>/<body>'sini render eder ve i18n bağlamına
 * güvenmez (sade, çok dilli güvenli metin).
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#083344",
          color: "#e2f0f3",
          padding: "24px",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 420 }}>
          <div style={{ fontSize: 40 }}>⚠️</div>
          <h1 style={{ fontSize: 22, margin: "16px 0 8px" }}>Something went wrong</h1>
          <p style={{ fontSize: 14, opacity: 0.8, margin: "0 0 24px" }}>
            An unexpected error occurred. Please try again.
          </p>
          <button
            onClick={() => reset()}
            style={{
              border: "none",
              borderRadius: 999,
              padding: "12px 24px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              background: "#f97316",
              color: "#fff",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
