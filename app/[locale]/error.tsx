"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";

/**
 * Locale segmenti için nazik hata sınırı (error boundary).
 * Kullanıcıya çevrilmiş mesaj + "tekrar dene" sunar; çökmüş ekran göstermez.
 */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations("common");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <div className="card max-w-md">
        <div
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-2xl"
          style={{ backgroundColor: "rgb(var(--accent) / 0.15)", color: "rgb(var(--accent))" }}
        >
          ⚠️
        </div>
        <h1 className="mt-5 text-xl font-semibold">{t("errorTitle")}</h1>
        <p className="mt-2 text-sm" style={{ color: "rgb(var(--muted-foreground))" }}>
          {t("errorText")}
        </p>
        <button onClick={() => reset()} className="btn-primary mt-6">
          {t("errorRetry")}
        </button>
      </div>
    </div>
  );
}
