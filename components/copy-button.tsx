"use client";

import { useState } from "react";

/** Adresi panoya kopyalar. Manuel yazım hatasını önler (kripto güvenliği). */
export function CopyButton({ value, label = "Kopyala" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // pano erişimi yoksa sessizce geç
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="shrink-0 rounded-lg border px-3 py-1.5 text-xs font-semibold transition"
      style={{ borderColor: "rgb(var(--border))", color: "rgb(var(--primary))" }}
      aria-label={label}
    >
      {copied ? "✓ Kopyalandı" : label}
    </button>
  );
}
