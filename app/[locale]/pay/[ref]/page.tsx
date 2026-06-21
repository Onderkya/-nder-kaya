import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/db";
import { formatAmount } from "@/lib/money";
import { PayStatus } from "./pay-status";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Payment", robots: { index: false } };

export default async function PayPage({
  params,
}: {
  params: Promise<{ locale: string; ref: string }>;
}) {
  const { locale, ref } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("checkout");

  const invoice = await prisma.invoice.findUnique({ where: { ref } }).catch(() => null);

  if (!invoice) {
    return (
      <div className="container-page py-20">
        <div className="card mx-auto max-w-md text-center">
          <p className="text-lg font-semibold">{t("notFound")}</p>
        </div>
      </div>
    );
  }

  const gross = invoice.amount + invoice.discountAmount;

  return (
    <div className="container-page py-16">
      <div className="mx-auto max-w-md space-y-6">
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">{t("title")}</h1>
            <span className="font-mono text-xs" style={{ color: "rgb(var(--muted-foreground))" }}>
              {t("ref")}: {invoice.ref}
            </span>
          </div>

          <p className="text-sm" style={{ color: "rgb(var(--muted-foreground))" }}>
            {invoice.description}
          </p>

          <div className="space-y-1 border-t pt-3 text-sm" style={{ borderColor: "rgb(var(--border))" }}>
            {invoice.discountAmount > 0 && (
              <>
                <div className="flex justify-between">
                  <span>{t("amount")}</span>
                  <span>{formatAmount(gross, invoice.currency)}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>{t("discount")}{invoice.promoCode ? ` (${invoice.promoCode})` : ""}</span>
                  <span>−{formatAmount(invoice.discountAmount, invoice.currency)}</span>
                </div>
              </>
            )}
            <div className="flex justify-between text-base font-bold">
              <span>{t("toPay")}</span>
              <span>{formatAmount(invoice.amount, invoice.currency)}</span>
            </div>
          </div>

          <PayStatus
            ref_={invoice.ref}
            initialStatus={invoice.status}
            payUrl={invoice.payUrl}
            labels={{
              payButton: t("payButton"),
              networks: t("networks"),
              waiting: t("waiting"),
              paidTitle: t("paidTitle"),
              paidBody: t("paidBody"),
              expiredTitle: t("expiredTitle"),
              expiredBody: t("expiredBody"),
              cancelledTitle: t("cancelledTitle"),
              failedTitle: t("failedTitle"),
              failedBody: t("failedBody"),
              underpaidTitle: t("underpaidTitle"),
              underpaidBody: t("underpaidBody"),
              secured: t("secured"),
            }}
          />
        </div>
      </div>
    </div>
  );
}
