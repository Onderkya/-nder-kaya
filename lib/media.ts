/**
 * Medya yükleme yardımcıları (saf fonksiyonlar — test edilebilir).
 * Sadece raster görseller; SVG bilinçli olarak HARİÇ (XSS riski).
 */

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB

// İzinli MIME -> dosya uzantısı
export const ALLOWED_IMAGE_MIME: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

export function extForMime(mime: string): string | null {
  return ALLOWED_IMAGE_MIME[mime] ?? null;
}

export type UploadCheck = { ok: true; ext: string } | { ok: false; error: string };

/** MIME ve boyutu doğrular; güvenli uzantıyı döndürür. */
export function validateUpload(mime: string, size: number): UploadCheck {
  const ext = extForMime(mime);
  if (!ext) return { ok: false, error: "Desteklenmeyen dosya türü (yalnızca PNG, JPG, WEBP, GIF)." };
  if (size <= 0) return { ok: false, error: "Boş dosya." };
  if (size > MAX_UPLOAD_BYTES) return { ok: false, error: "Dosya 5 MB sınırını aşıyor." };
  return { ok: true, ext };
}

/** Güvenli, çakışmasız dosya adı (kullanıcı girdisi kullanılmaz → path traversal yok). */
export function safeFileName(ext: string): string {
  return `${crypto.randomUUID()}.${ext}`;
}
