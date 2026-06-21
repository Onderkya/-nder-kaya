"use client";

import { useEffect, useState } from "react";

type Status = "PENDING" | "PAID" | "UNDERPAID" | "EXPIRED" | "CANCELLED" | "FAILED";

type Labels = {
  payButton: string;
  networks: string;
  waiting: string;
  paidTitle: string;
  paidBody: string;
  expiredTitle: string;
  expiredBody: string;
  cancelledTitle: string;
  failedTitle: string;
  failedBody: string;
  underpaidTitle: string;
  underpaidBody: string;
  secured: string;
};

/**
 * Ödeme durumunu canlı yoklar. Webhook gelmese bile bu uç sağlayıcıdan otoriter
 * teyit alır; durum terminal (PAID/EXPIRED/...) olunca yoklamayı durdurur.
 */
export function PayStatus({
  ref_,
  initialStatus,
  payUrl,
  labels,
}: {
  ref_: string;
  initialStatus: Status;
  payUrl: string | null;
  labels: Labels;
}) {
  const [status, setStatus] = useState<Status>(initialStatus);

  useEffect(() => {
    if (status !== "PENDING") return;
    let active = true;
    const tick = async () => {
      try {
        const res = await fetch(`/api/payments/${ref_}/status`, { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { status: Status };
        if (active && data.status) setStatus(data.status);
      } catch {
        /* geçici hata: bir sonraki turda tekrar dener */
      }
    };
    const id = setInterval(tick, 6000);
    tick();
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [ref_, status]);

  if (status === "PAID") {
    return (
      <Result tone="success" title={labels.paidTitle} body={labels.paidBody} />
    );
  }
  if (status === "EXPIRED") {
    return <Result tone="muted" title={labels.expiredTitle} body={labels.expiredBody} />;
  }
  if (status === "CANCELLED") {
    return <Result tone="muted" title={labels.cancelledTitle} body={labels.expiredBody} />;
  }
  if (status === "FAILED") {
    return <Result tone="error" title={labels.failedTitle} body={labels.failedBody} />;
  }
  if (status === "UNDERPAID") {
    return <Result tone="error" title={labels.underpaidTitle} body={labels.underpaidBody} />;
  }

  // PENDING
  return (
    <div className="space-y-3">
      {payUrl ? (
        <a href={payUrl} target="_blank" rel="noopener noreferrer" className="btn-primary block w-full text-center">
          {labels.payButton}
        </a>
      ) : null}
      <p className="text-center text-xs" style={{ color: "rgb(var(--muted-foreground))" }}>
        {labels.networks}
      </p>
      <div className="flex items-center justify-center gap-2 text-sm" style={{ color: "rgb(var(--muted-foreground))" }}>
        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-amber-500" />
        {labels.waiting}
      </div>
      <p className="text-center text-[11px]" style={{ color: "rgb(var(--muted-foreground))" }}>
        🔒 {labels.secured}
      </p>
    </div>
  );
}

function Result({ tone, title, body }: { tone: "success" | "error" | "muted"; title: string; body: string }) {
  const color =
    tone === "success" ? "text-green-600" : tone === "error" ? "text-red-600" : "text-slate-500";
  const icon = tone === "success" ? "✅" : tone === "error" ? "⚠️" : "⌛";
  return (
    <div className="space-y-1 py-2 text-center">
      <p className={`text-lg font-bold ${color}`}>{icon} {title}</p>
      <p className="text-sm" style={{ color: "rgb(var(--muted-foreground))" }}>{body}</p>
    </div>
  );
}
