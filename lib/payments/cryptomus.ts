import { createHash } from "node:crypto";
import type {
  PaymentProvider,
  CreatePaymentInput,
  CreatePaymentResult,
  NormalizedStatus,
} from "./types";

/**
 * Cryptomus Merchant API entegrasyonu.
 * Belge: https://doc.cryptomus.com/
 *
 * Güvenlik tasarımı: Webhook gövdesine ASLA körü körüne güvenmeyiz. Webhook
 * yalnızca "şu sipariş değişti" sinyalidir; ödemenin GERÇEKTEN ödendiğini
 * doğrudan Cryptomus API'sinden (getStatus) teyit ederiz. Böylece imza
 * kodlama farkları bile güvenliği bozmaz.
 *
 * Gereken ortam değişkenleri:
 *   CRYPTOMUS_MERCHANT  — Merchant UUID (panelden)
 *   CRYPTOMUS_API_KEY   — Ödeme (payment) API anahtarı
 */

const API = "https://api.cryptomus.com/v1";

function md5(s: string): string {
  return createHash("md5").update(s).digest("hex");
}

function creds() {
  const merchant = process.env.CRYPTOMUS_MERCHANT;
  const apiKey = process.env.CRYPTOMUS_API_KEY;
  return { merchant, apiKey };
}

/** İmzalı POST. Cryptomus, GÖNDERDİĞİMİZ ham gövdeyi imzalar; o yüzden aynı
 *  string'i hem imzalar hem göndeririz. */
async function signedPost(path: string, payload: Record<string, unknown>) {
  const { merchant, apiKey } = creds();
  if (!merchant || !apiKey) throw new Error("Cryptomus yapılandırılmadı (CRYPTOMUS_MERCHANT / CRYPTOMUS_API_KEY).");

  const bodyStr = JSON.stringify(payload);
  const sign = md5(Buffer.from(bodyStr).toString("base64") + apiKey);

  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { merchant, sign, "Content-Type": "application/json" },
    body: bodyStr,
  });
  const json = (await res.json().catch(() => null)) as { state?: number; result?: Record<string, unknown>; message?: string } | null;
  if (!json || json.state !== 0 || !json.result) {
    throw new Error(`Cryptomus hatası: ${json?.message ?? res.status}`);
  }
  return json.result;
}

function mapStatus(s: unknown): NormalizedStatus["state"] {
  switch (String(s)) {
    case "paid":
    case "paid_over":
      return "paid";
    case "wrong_amount":
    case "wrong_amount_waiting":
      return "underpaid";
    case "cancel":
    case "fail":
    case "system_fail":
      return "failed";
    case "expired":
      return "expired";
    default:
      return "pending"; // process, check, confirm_check, '' ...
  }
}

export const cryptomus: PaymentProvider = {
  name: "cryptomus",

  isConfigured() {
    const { merchant, apiKey } = creds();
    return Boolean(merchant && apiKey);
  },

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    const result = await signedPost("/payment", {
      amount: input.amount,
      currency: input.currency,
      order_id: input.ref,
      url_return: input.returnUrl,
      url_success: input.returnUrl,
      url_callback: input.callbackUrl,
      lifetime: input.lifetimeSeconds ?? 3600,
      // Ağ/coin kısıtlamıyoruz: müşteri TRC20/SOL/ARB/ETH/BTC... arasından seçer.
    });

    const expired = result.expired_at ? new Date(Number(result.expired_at) * 1000) : undefined;
    return {
      providerId: String(result.uuid),
      payUrl: String(result.url),
      expiresAt: expired && !Number.isNaN(expired.getTime()) ? expired : undefined,
    };
  },

  async getStatus(providerId: string, ref: string): Promise<NormalizedStatus> {
    // uuid varsa onunla, yoksa order_id ile sorgula.
    const body = providerId ? { uuid: providerId } : { order_id: ref };
    const r = await signedPost("/payment/info", body);
    return {
      state: mapStatus(r.payment_status),
      paidAmount: r.payer_amount ? String(r.payer_amount) : r.payment_amount ? String(r.payment_amount) : undefined,
      payCurrency: r.payer_currency ? String(r.payer_currency) : undefined,
      payNetwork: r.network ? String(r.network) : undefined,
      txid: r.txid ? String(r.txid) : undefined,
    };
  },

  verifyWebhook(payload: Record<string, unknown>): boolean {
    const { apiKey } = creds();
    if (!apiKey) return false;
    const sign = payload["sign"];
    if (typeof sign !== "string" || !sign) return false;
    const clone: Record<string, unknown> = { ...payload };
    delete clone["sign"];
    const expected = md5(Buffer.from(JSON.stringify(clone)).toString("base64") + apiKey);
    // En kötü ihtimalle imza kodlama farkından eşleşmese bile, çağıran taraf
    // getStatus ile otoriter teyidi yapar; bu yüzden buradaki sonuç "ipucu".
    return expected === sign;
  },

  refFromWebhook(payload: Record<string, unknown>): string | null {
    const id = payload["order_id"];
    return typeof id === "string" && id ? id : null;
  },
};
