/**
 * GALERİ BÖLÜMLERİNİN VARSAYILANLARI — TEK KAYNAK.
 * Koddaki satır içi "medya + başlık" listelerinin BİREBİR karşılığı. Admin
 * (Task 3) bu tabanı override eder; override yoksa public render bu listeyi
 * kullanır ve çıktı eskisiyle aynı kalır.
 *
 * Anahtarlar `lib/section-registry.ts` bölüm id'leriyle aynıdır.
 *
 * Başlık/alt başlık çözümü (Task 2 render + Task 3 prefill):
 *   - `ns` VARSA `tKey`/`dKey` = ilgili i18n namespace'inde çeviri anahtarı
 *     (ör. anasayfa fermuarında ilk kartın adı `t("actScuba")`, ns "home").
 *   - `ns` YOKSA `tKey`/`dKey` = koddaki SABİT (i18n olmayan) düz metin —
 *     birebir korunur.
 *
 * `src`/`poster` = koddaki `pickAsset(...)` VARSAYILAN dosya yolu (override
 * anahtarları slot sistemine aittir; burada yalnız varsayılan tutulur).
 */
export type DefaultGalleryItem = {
  src: string;
  type: "image" | "video";
  poster?: string;
  tKey?: string; // başlık: ns varsa çeviri anahtarı, yoksa düz metin
  dKey?: string; // alt başlık: ns varsa çeviri anahtarı, yoksa düz metin
  ns?: string; // i18n namespace (yoksa tKey/dKey düz metindir)
};

export const GALLERY_DEFAULTS: Record<string, DefaultGalleryItem[]> = {
  // Anasayfa "Fermuar deneyimi" (ZipperReveal). Kaynak: app/[locale]/page.tsx.
  // Medya varsayılanları video (poster = img). İlk kartın adı i18n ("home"
  // namespace `actScuba`); kalanların ad/alt-başlığı koddaki düz metindir.
  "home.zipper": [
    { src: "/media/act-scuba2.mp4", type: "video", poster: "/images/kaputas-deep.jpg", tKey: "actScuba", ns: "home", dKey: "Akdeniz'in altı" },
    { src: "/media/kaputas-drone.mp4", type: "video", poster: "/images/kaputas.jpg", tKey: "Kaputaş Plajı", dKey: "Kaş" },
    { src: "/media/vid-kas.mp4", type: "video", poster: "/images/sunset.jpg", tKey: "Kaş", dKey: "Gün batımı" },
    { src: "/media/vid-suluada.mp4", type: "video", poster: "/images/suluada.jpg", tKey: "Suluada", dKey: "Adrasan" },
    { src: "/media/vid-olympos.mp4", type: "video", poster: "/images/olympos.jpg", tKey: "Olympos", dKey: "Çıralı" },
    { src: "/media/vid-kemer.mp4", type: "video", poster: "/images/kemer.jpg", tKey: "Kemer", dKey: "Marina" },
    { src: "/media/vid-alanya-castle.mp4", type: "video", poster: "/images/alanya.jpg", tKey: "Alanya Kalesi", dKey: "Kızıl Kule" },
    { src: "/media/vid-alanya-kleopatra.mp4", type: "video", poster: "/images/alanya.jpg", tKey: "Kleopatra", dKey: "Alanya sahili" },
    { src: "/media/lol-aqua.mp4", type: "video", poster: "/images/coaster.jpg", tKey: "Land of Legends", dKey: "Aqua park · Belek" },
  ],

  // Antalya "Bölgeler" (HorizontalPlaces). Kaynak: app/[locale]/antalya/page.tsx.
  // Videosu olan kartlar type "video" (poster = img); yalnız görselli kartlar
  // type "image". Tüm ad/alt-başlık koddaki düz metindir (i18n değil).
  "antalya.regions": [
    { src: "/media/kaputas-drone.mp4", type: "video", poster: "/images/kaputas.jpg", tKey: "Kaputaş", dKey: "Kaş" },
    { src: "/media/vid-suluada.mp4", type: "video", poster: "/images/suluada.jpg", tKey: "Suluada", dKey: "Adrasan" },
    { src: "/media/vid-kemer.mp4", type: "video", poster: "/images/kemer.jpg", tKey: "Kemer", dKey: "Marina" },
    { src: "/media/vid-olympos.mp4", type: "video", poster: "/images/olympos.jpg", tKey: "Olympos", dKey: "Çıralı" },
    { src: "/media/vid-alanya-castle.mp4", type: "video", poster: "/images/alanya.jpg", tKey: "Alanya", dKey: "Kızıl Kule" },
    { src: "/images/beachpark.jpg", type: "image", tKey: "Beach Park", dKey: "Konyaaltı" },
    { src: "/images/lara.jpg", type: "image", tKey: "Lara", dKey: "Falezler" },
    { src: "/media/vid-kaleici.mp4", type: "video", poster: "/images/kaleici-harbor.jpg", tKey: "Kaleiçi", dKey: "Yat Limanı" },
    { src: "/images/side.jpg", type: "image", tKey: "Side", dKey: "Antik kent" },
    { src: "/media/vid-duden.mp4", type: "video", poster: "/images/duden.jpg", tKey: "Düden", dKey: "Şelale" },
  ],
};
