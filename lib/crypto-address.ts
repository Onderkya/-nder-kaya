import { createHash } from "node:crypto";

/**
 * Kripto cüzdan adresi doğrulama — güvenliğin kalbi.
 *
 * Amaç: admin panele yanlış/eksik/uyumsuz bir adres girilip müşterinin parasının
 * kaybolmasını ÖNLEMEK. Sadece format değil, mümkün olan yerlerde CHECKSUM
 * doğrulaması yapılır (base58check / bech32), böylece tek harf hatası bile yakalanır.
 *
 * Harici bağımlılık yok — yalnızca node:crypto (sha256).
 */

const B58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

function sha256(buf: Buffer): Buffer {
  return createHash("sha256").update(buf).digest();
}

/** base58 çöz; geçersiz karakterde null. */
function base58Decode(str: string): Buffer | null {
  let num = 0n;
  for (const ch of str) {
    const idx = B58_ALPHABET.indexOf(ch);
    if (idx < 0) return null;
    num = num * 58n + BigInt(idx);
  }
  let hex = num.toString(16);
  if (hex.length % 2) hex = "0" + hex;
  const bytes = hex === "0" ? [] : [...Buffer.from(hex, "hex")];
  // baştaki '1'ler -> 0x00
  for (const ch of str) {
    if (ch === "1") bytes.unshift(0);
    else break;
  }
  return Buffer.from(bytes);
}

/** base58check: son 4 bayt = sha256(sha256(payload))[:4]. */
function base58CheckValid(str: string, expectedVersion?: number): boolean {
  const data = base58Decode(str);
  if (!data || data.length < 5) return false;
  const payload = data.subarray(0, data.length - 4);
  const checksum = data.subarray(data.length - 4);
  const hash = sha256(sha256(payload));
  if (!checksum.equals(hash.subarray(0, 4))) return false;
  if (expectedVersion !== undefined && payload[0] !== expectedVersion) return false;
  return true;
}

// --- bech32 (BTC segwit: bc1...) ---
const BECH32_CHARSET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";

function bech32Polymod(values: number[]): number {
  const GEN = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
  let chk = 1;
  for (const v of values) {
    const top = chk >> 25;
    chk = ((chk & 0x1ffffff) << 5) ^ v;
    for (let i = 0; i < 5; i++) if ((top >> i) & 1) chk ^= GEN[i];
  }
  return chk;
}

function bech32HrpExpand(hrp: string): number[] {
  const out: number[] = [];
  for (let i = 0; i < hrp.length; i++) out.push(hrp.charCodeAt(i) >> 5);
  out.push(0);
  for (let i = 0; i < hrp.length; i++) out.push(hrp.charCodeAt(i) & 31);
  return out;
}

function bech32Valid(addr: string, expectedHrp: string): boolean {
  const lower = addr.toLowerCase();
  if (addr !== lower && addr !== addr.toUpperCase()) return false; // karışık büyük/küçük yasak
  const pos = lower.lastIndexOf("1");
  if (pos < 1 || pos + 7 > lower.length) return false;
  const hrp = lower.slice(0, pos);
  if (hrp !== expectedHrp) return false;
  const data: number[] = [];
  for (const ch of lower.slice(pos + 1)) {
    const d = BECH32_CHARSET.indexOf(ch);
    if (d < 0) return false;
    data.push(d);
  }
  const polymod = bech32Polymod([...bech32HrpExpand(hrp), ...data]);
  return polymod === 1 || polymod === 0x2bc830a3; // bech32 veya bech32m
}

// --- Ağ -> doğrulayıcı eşlemesi ---
const EVM_NETWORKS = ["ERC20", "BEP20", "BSC", "ETH", "POLYGON", "ARBITRUM", "AVALANCHE", "ARB", "MATIC"];

function isEvm(addr: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(addr);
}

function isTron(addr: string): boolean {
  // TRON: base58check, sürüm 0x41, 'T' ile başlar, 34 karakter.
  return addr.length === 34 && addr.startsWith("T") && base58CheckValid(addr, 0x41);
}

function isBtc(addr: string): boolean {
  if (addr.startsWith("bc1")) return bech32Valid(addr, "bc");
  // legacy / p2sh: base58check sürüm 0x00 veya 0x05
  return base58CheckValid(addr, 0x00) || base58CheckValid(addr, 0x05);
}

export type AddressCheck = { ok: true } | { ok: false; reason: string };

/**
 * coin + network bağlamında adresi doğrula. Bilinmeyen ağlarda format temel
 * kontrolü yapılır ve uyumluluk için uyarı döndürülür (engellemez ama işaretler).
 */
export function validateCryptoAddress(
  coin: string | null,
  network: string | null,
  address: string
): AddressCheck {
  const a = address.trim();
  if (!a) return { ok: false, reason: "Adres boş olamaz." };
  if (/\s/.test(a)) return { ok: false, reason: "Adreste boşluk olamaz." };

  const net = (network || "").toUpperCase().replace(/[^A-Z0-9]/g, "");

  if (net.includes("TRC20") || net === "TRON" || net === "TRX") {
    return isTron(a) ? { ok: true } : { ok: false, reason: "Geçersiz TRON (TRC20) adresi — 'T' ile başlamalı ve checksum doğru olmalı." };
  }
  if (EVM_NETWORKS.some((n) => net.includes(n))) {
    return isEvm(a) ? { ok: true } : { ok: false, reason: "Geçersiz EVM adresi — '0x' + 40 hex karakter olmalı." };
  }
  if (net === "BTC" || net === "BITCOIN") {
    return isBtc(a) ? { ok: true } : { ok: false, reason: "Geçersiz Bitcoin adresi — checksum doğrulanamadı." };
  }

  // Ağ belirtilmemiş/bilinmiyor: en azından bir bilinen biçime uysun.
  if (isEvm(a) || isTron(a) || isBtc(a)) return { ok: true };
  return {
    ok: false,
    reason: "Adres bilinen bir kripto formatına (EVM/TRON/BTC) uymuyor. Ağ alanını doldurun ve adresi kontrol edin.",
  };
}
