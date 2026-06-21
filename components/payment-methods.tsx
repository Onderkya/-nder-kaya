import QRCode from "qrcode";
import { prisma } from "@/lib/db";
import { CopyButton } from "./copy-button";

/**
 * Public ödeme gösterimi — DB'deki AKTİF yöntemleri gösterir.
 * Güvenlik: QR, harici bir servisten değil, gösterilen adresin TA KENDİSİNDEN
 * sunucuda üretilir; böylece QR ile metin adresi her zaman birebir aynıdır
 * (sahte/uyumsuz QR riski ortadan kalkar). Müşteriye doğrulama uyarısı gösterilir.
 */
export async function PaymentMethods({
  labels,
}: {
  labels: { title: string; verifyWarning: string; networkLabel: string; empty: string; txidNote: string };
}) {
  const methods = await prisma.paymentMethod
    .findMany({ where: { active: true }, orderBy: { order: "asc" } })
    .catch(() => []);

  if (methods.length === 0) {
    return null;
  }

  // Kripto adresleri için QR'ları sunucuda üret.
  const qrMap = new Map<string, string>();
  for (const m of methods) {
    if (m.type === "CRYPTO" && m.address) {
      try {
        qrMap.set(m.id, await QRCode.toDataURL(m.address, { margin: 1, width: 160 }));
      } catch {
        /* QR üretilemezse adres yine metin olarak gösterilir */
      }
    }
  }

  const kaspi = methods.filter((m) => m.type === "KASPI");
  const crypto = methods.filter((m) => m.type === "CRYPTO");

  return (
    <div className="card">
      <h2 className="text-lg font-semibold">{labels.title}</h2>

      {kaspi.length > 0 && (
        <div className="mt-4 space-y-3">
          {kaspi.map((m) => (
            <div key={m.id} className="rounded-xl border p-3" style={{ borderColor: "rgb(var(--border))" }}>
              <p className="text-sm font-semibold">🇰🇿 Kaspi</p>
              {m.address && (
                <div className="mt-1 flex items-center gap-2">
                  <code className="flex-1 break-all text-sm">{m.address}</code>
                  <CopyButton value={m.address} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {crypto.length > 0 && (
        <div className="mt-4 space-y-4">
          {crypto.map((m) => (
            <div key={m.id} className="rounded-xl border p-4" style={{ borderColor: "rgb(var(--border))" }}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">
                  {m.coin}
                  {m.network ? (
                    <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:bg-amber-400/15 dark:text-amber-200">
                      {labels.networkLabel}: {m.network}
                    </span>
                  ) : null}
                </p>
              </div>
              {m.address && (
                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                  {qrMap.get(m.id) && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={qrMap.get(m.id)}
                      alt={`${m.coin} ${m.network ?? ""} QR`}
                      width={120}
                      height={120}
                      className="shrink-0 rounded-lg bg-white p-1"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <code className="flex-1 break-all text-xs">{m.address}</code>
                      <CopyButton value={m.address} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {crypto.length > 0 && (
        <p className="mt-3 rounded-lg bg-cyan-50 px-3 py-2 text-xs text-cyan-800 dark:bg-cyan-400/10 dark:text-cyan-200">
          🧾 {labels.txidNote}
        </p>
      )}

      <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-400/10 dark:text-amber-200">
        ⚠️ {labels.verifyWarning}
      </p>
    </div>
  );
}
