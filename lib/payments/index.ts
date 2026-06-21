import type { PaymentProvider } from "./types";
import { cryptomus } from "./cryptomus";

/**
 * Aktif ödeme sağlayıcısını seçer. Varsayılan: cryptomus.
 * Yeni sağlayıcı eklemek için: dosyasını yaz, buraya kaydet, PAYMENTS_PROVIDER ayarla.
 */
const PROVIDERS: Record<string, PaymentProvider> = {
  cryptomus,
};

export function getProvider(): PaymentProvider {
  const name = (process.env.PAYMENTS_PROVIDER || "cryptomus").toLowerCase();
  return PROVIDERS[name] ?? cryptomus;
}

/** Otomatik ödeme yapılandırılmış mı (admin'e fatura oluşturma butonu için)? */
export function paymentsEnabled(): boolean {
  return getProvider().isConfigured();
}

export type { PaymentProvider } from "./types";
