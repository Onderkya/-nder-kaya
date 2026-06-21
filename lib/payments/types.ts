/**
 * Sağlayıcı-bağımsız ödeme arayüzü. Bugün Cryptomus uygulanıyor; yarın
 * NOWPayments / BTCPay / DIY-BTC eklemek için sadece bu arayüzü uygulayan yeni
 * bir dosya yazıp `index.ts`'te kaydetmek yeterli. Uygulamanın geri kalanı
 * (fatura, webhook, admin, sayfa) değişmez.
 */

export type CreatePaymentInput = {
  /** Bizim benzersiz referansımız (order_id). */
  ref: string;
  /** Ondalık string tutar, ör. "15.00". */
  amount: string;
  /** Fiat para birimi: USD, EUR... */
  currency: string;
  description: string;
  /** Müşteri ödeme sonrası döneceği sayfa. */
  returnUrl: string;
  /** Sağlayıcının durum bildireceği webhook. */
  callbackUrl: string;
  /** Saniye cinsinden geçerlilik (opsiyonel). */
  lifetimeSeconds?: number;
};

export type CreatePaymentResult = {
  providerId: string; // sağlayıcının ödeme kimliği
  payUrl: string; // müşteriye gönderilecek barındırılan ödeme sayfası
  expiresAt?: Date;
};

/** Sağlayıcıdan gelen normalize edilmiş durum. */
export type NormalizedStatus = {
  state: "pending" | "paid" | "underpaid" | "failed" | "expired";
  paidAmount?: string;
  payCurrency?: string;
  payNetwork?: string;
  txid?: string;
};

export interface PaymentProvider {
  readonly name: string;
  /** Yapılandırılmış mı (anahtarlar mevcut mu)? */
  isConfigured(): boolean;
  createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult>;
  /** Sağlayıcıdan ödemenin GÜNCEL durumunu otoriter biçimde sorgular. */
  getStatus(providerId: string, ref: string): Promise<NormalizedStatus>;
  /**
   * Webhook gövdesinin imzasını doğrular. Gövde, ham JSON nesnesi olarak verilir.
   * true → güvenilir; yine de getStatus ile teyit edilir (savunma derinliği).
   */
  verifyWebhook(payload: Record<string, unknown>): boolean;
  /** Webhook gövdesinden referansı (order_id) çıkarır. */
  refFromWebhook(payload: Record<string, unknown>): string | null;
}
