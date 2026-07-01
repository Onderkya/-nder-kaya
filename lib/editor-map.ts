/**
 * Editör haritası — üç veri kaynağını (metin / bölüm / görsel) TEK editör
 * modelinde birleştirir. "Site Editörü" (Faz 3) her public sayfa için, gerçek
 * site sırasında, KART'lar üretir; her kart o bölümün METİNLERİNİ ve
 * GÖRSEL/VİDEO SLOTLARINI birlikte taşır, ayrıca (varsa) sıralama/gizleme
 * kontrolü için bir `registryId` tutar.
 *
 * Kaynaklar:
 *   - lib/content-map.ts   → CONTENT_PAGES (sayfa × bölüm → metin anahtarları)
 *   - lib/section-registry → SECTIONS (sıralanabilir/gizlenebilir bölümler)
 *   - lib/asset-slots.ts   → ASSET_SLOTS (adlandırılmış görsel/video slotları)
 *
 * Eşleme AÇIK ve STATİK'tir (tahmin algoritması yok): aşağıdaki CARD_MAP
 * tablosu elle, iki dosya okunarak yazılmıştır. Değişmezler (editorSectionsForPage
 * içinde çalışma zamanında doğrulanır):
 *   1. Her registry id, sayfasında TAM BİR kartta görünür.
 *   2. Hiçbir metin anahtarı kaybolmaz: bir sayfanın kartlarındaki
 *      contentKeys birleşimi == content-map'teki o sayfanın anahtar kümesi.
 *   3. Bir sayfanın slotları en fazla bir karta bağlanır; bağlanmayanlar
 *      `other` kartına düşer.
 *
 * Saf/senkron modül — DB yok, React yok, deterministik.
 */

import { CONTENT_PAGES } from "./content-map";
import { SECTIONS } from "./section-registry";
import { ASSET_SLOTS } from "./asset-slots";

export type EditorSection = {
  key: string; // benzersiz kart anahtarı (registryId veya "fixed:<ad>" / "other")
  registryId?: string; // varsa sıralanabilir/gizlenebilir
  title: string; // Türkçe kart başlığı
  locked?: boolean; // hero/CTA (metin düzenlenir; sıra/gizle yok)
  contentKeys: string[]; // content-map'ten bu bölüme ait metin anahtarları (görünüm sırasıyla)
  assetSlots: string[]; // asset-slots'tan bu bölüme ait slot adları
};

/**
 * Editörde görünecek sayfalar — content-map sayfalarıyla birebir (SSS/faq
 * dahil, "genel" ortak metinler dahil). Etiketler bugünkü içerik editörü
 * sekmeleriyle uyumludur (content-map `label` alanından türetilir).
 */
export const EDITOR_PAGES: { key: string; label: string }[] = CONTENT_PAGES.map((p) => ({
  key: p.id,
  label: p.label,
}));

/**
 * Bir kart tanımı (statik). `content` = content-map bölüm İNDEKSLERİ
 * (görünüm sırasında). `slots` = asset-slots id'leri.
 */
type CardSpec = {
  key: string;
  registryId?: string;
  title: string;
  locked?: boolean;
  content: number[]; // CONTENT_PAGES[page].sections indeksleri
  slots?: string[];
};

/**
 * ELLE YAZILMIŞ EŞLEME TABLOSU (sayfa → kartlar, site sırasında).
 * Her sayfa için: content-map'teki HER bölüm indeksi tam bir karta,
 * registry'deki HER id tam bir karta, asset slotları uygun karta bağlanır.
 * Bağlanmayan slotlar otomatik olarak `other` kartına eklenir (aşağıda).
 */
const CARD_MAP: Record<string, CardSpec[]> = {
  // ── ANASAYFA ──────────────────────────────────────────────────────────────
  home: [
    {
      key: "fixed:home.hero",
      title: "Hero / üst bölüm",
      locked: true,
      content: [0], // Hero / üst bölüm
      slots: ["home.hero.aerialVideo", "home.hero.poster", "home.diveFish.video"],
    },
    {
      key: "home.readyRoutes",
      registryId: "home.readyRoutes",
      title: "Hazır Rotalar (paket vitrini)",
      content: [1], // Hizmetler / nasıl yardımcı oluyoruz (rota vitrini girişi)
      slots: ["route.r1.image", "route.r2.image", "route.r3.image", "route.r4.image", "route.r5.image"],
    },
    {
      key: "home.zipper",
      registryId: "home.zipper",
      title: "Fermuar deneyimi (Antalya aktiviteleri)",
      content: [2, 3], // aktiviteler + Land of Legends
      slots: [
        "home.zipper.scuba.video", "home.zipper.scuba.image",
        "home.zipper.kaputas.video", "home.zipper.kaputas.image",
        "home.zipper.kas.video", "home.zipper.kas.image",
        "home.zipper.suluada.video", "home.zipper.suluada.image",
        "home.zipper.olympos.video", "home.zipper.olympos.image",
        "home.zipper.kemer.video", "home.zipper.kemer.image",
        "home.zipper.alanyaCastle.video", "home.zipper.alanyaCastle.image",
        "home.zipper.kleopatra.video", "home.zipper.kleopatra.image",
        "home.zipper.legends.video", "home.zipper.legends.image",
      ],
    },
    {
      key: "home.hotels",
      registryId: "home.hotels",
      title: "Oteller",
      content: [4],
      slots: [
        "hotel.cullinan.image", "hotel.maxxbelek.image", "hotel.regnum.image", "hotel.maxxkemer.image",
        "hotel.ngphaselis.image", "hotel.larabarut.image", "hotel.bayou.image", "hotel.legends.image",
      ],
    },
    {
      key: "home.quickPlan",
      registryId: "home.quickPlan",
      title: "Özel Plan formu",
      content: [6], // Sana özel plan formu (son CTA alanı)
      slots: ["home.finalCta.image"],
    },
    {
      key: "home.why",
      registryId: "home.why",
      title: "Neden Antalya Bridge",
      content: [5],
      slots: ["home.whyBand.image"],
    },
    {
      key: "home.lessons",
      registryId: "home.lessons",
      title: "Türkçe Dersleri + PetLingo",
      content: [7],
    },
    {
      key: "home.education",
      registryId: "home.education",
      title: "Türkiye'de Eğitim",
      content: [8],
      slots: ["home.study.video", "home.study.poster"],
    },
    {
      key: "home.guestVoices",
      registryId: "home.guestVoices",
      title: "Misafir Sözleri",
      content: [9],
    },
    {
      key: "home.payment",
      registryId: "home.payment",
      title: "Ödeme & Güven",
      content: [10],
    },
    {
      key: "home.miniFaq",
      registryId: "home.miniFaq",
      title: "Mini SSS",
      content: [11],
    },
  ],

  // ── ANTALYA DANIŞMANLIK ────────────────────────────────────────────────────
  antalya: [
    {
      key: "fixed:antalya.hero",
      title: "Hero / üst bölüm",
      locked: true,
      content: [0],
      slots: ["antalya.hero.image", "antalya.hero.video1", "antalya.hero.video2", "antalya.hero.video3", "antalya.hero.video4"],
    },
    {
      key: "antalya.readyRoutes",
      registryId: "antalya.readyRoutes",
      title: "Hazır Rotalar (paket vitrini)",
      // Rota vitrininin başlık/etiketleri + tüm rota içerikleri + dahiller + itiraz.
      // (Rota kart fotoğrafları route.r*.image asset-slots'ta "home" sayfasına
      //  kayıtlı — paylaşılan ReadyRoutes bileşeni — bu yüzden Anasayfa kartında.)
      content: [3, 4, 5, 6, 7, 8, 9, 10, 11],
    },
    {
      key: "antalya.intro",
      registryId: "antalya.intro",
      title: "Editoryal giriş + özellikler",
      content: [1, 2], // Öne çıkanlar + Antalya tanıtım bölümleri
    },
    {
      key: "antalya.regions",
      registryId: "antalya.regions",
      title: "Bölgeler (yatay gezi)",
      content: [], // bölge metinleri i18n dışı (kod içi isim/alt) — sadece slotlar
      slots: [
        "antalya.place.kaputas.image", "antalya.place.kaputas.video",
        "antalya.place.suluada.image", "antalya.place.suluada.video",
        "antalya.place.kemer.image", "antalya.place.kemer.video",
        "antalya.place.olympos.image", "antalya.place.olympos.video",
        "antalya.place.alanya.image", "antalya.place.alanya.video",
        "antalya.place.beachpark.image",
        "antalya.place.lara.image",
        "antalya.place.kaleici.image", "antalya.place.kaleici.video",
        "antalya.place.side.image",
        "antalya.place.duden.image", "antalya.place.duden.video",
      ],
    },
    {
      key: "fixed:antalya.hotels",
      title: "Oteller",
      content: [12], // Oteller (öne çıkan otel metinleri — kod içi vitrin, kayıt yok)
    },
    {
      key: "fixed:antalya.cta",
      title: "Kapanış CTA",
      locked: true,
      content: [],
      slots: ["antalya.cta.image"],
    },
  ],

  // ── TÜRKÇE DERS ─────────────────────────────────────────────────────────────
  lessons: [
    {
      key: "fixed:lessons.hero",
      title: "Hero / üst bölüm",
      locked: true,
      content: [0],
      slots: ["lessons.hero.image", "lessons.hero.video1", "lessons.hero.video2", "lessons.hero.video3", "lessons.hero.video4"],
    },
    {
      key: "lessons.conversionBar",
      registryId: "lessons.conversionBar",
      title: "Kontenjan şeridi (hero altı)",
      content: [4], // Ders dönüşüm bölümü (rezervasyon çağrısı)
    },
    {
      key: "lessons.process",
      registryId: "lessons.process",
      title: "Süreç — nasıl öğreniyorsunuz",
      content: [1], // Öğrenme süreci
      slots: ["lessons.step1.video", "lessons.step2.video", "lessons.step3.video", "lessons.step4.video"],
    },
    {
      key: "lessons.teacher",
      registryId: "lessons.teacher",
      title: "Öğretmen kimlik bandı",
      content: [2], // Öğretmen tanıtımı
      slots: ["lessons.teacher.video"],
    },
    {
      key: "lessons.lived",
      registryId: "lessons.lived",
      title: "Bunu biz de yaşadık (güven bandı)",
      content: [], // metinleri i18n dışı/ortak — kart sıra/gizle kontrolü için
    },
    {
      key: "lessons.petlingo",
      registryId: "lessons.petlingo",
      title: "PetLingo",
      content: [5, 6], // PetLingo uygulaması + Türkçe kelime yapbozu (oyun)
    },
    {
      key: "lessons.durations",
      registryId: "lessons.durations",
      title: "Ders süreleri",
      content: [3],
    },
    {
      key: "lessons.guestVoices",
      registryId: "lessons.guestVoices",
      title: "Misafir Sözleri",
      content: [],
    },
    {
      key: "lessons.booking",
      registryId: "lessons.booking",
      title: "Randevu",
      content: [7], // Randevu / rezervasyon formu
    },
  ],

  // ── EĞİTİM ──────────────────────────────────────────────────────────────────
  education: [
    {
      key: "fixed:education.hero",
      title: "Hero / üst bölüm",
      locked: true,
      content: [0, 1], // Hero + Öne çıkanlar (özellikler)
      slots: ["education.hero.image"],
    },
    {
      key: "education.journey",
      registryId: "education.journey",
      title: "Yolculuk (4 adım)",
      content: [2, 3], // Eğitim yolculuğu adımlar + Kampüste yürü (360°)
      slots: [
        "education.campus.image", "education.campus.imageFallback",
        "education.step1.video", "education.step2.image", "education.step2.video",
        "education.step3.image", "education.step3.video", "education.step4.image",
      ],
    },
    {
      key: "education.lived",
      registryId: "education.lived",
      title: "Bunu biz de yaşadık (güven bandı)",
      content: [],
    },
    {
      key: "education.deliverables",
      registryId: "education.deliverables",
      title: "Neyi hallediyoruz (teslimatlar)",
      content: [4], // Eğitim dönüşüm bölümü (ne hallediyoruz)
    },
  ],

  // ── HAKKIMIZDA ──────────────────────────────────────────────────────────────
  about: [
    {
      key: "fixed:about.hero",
      title: "Hero / giriş",
      locked: true,
      content: [0], // Hero / giriş
      slots: ["about.hero.image", "about.hero.video"],
    },
    {
      key: "about.manifesto",
      registryId: "about.manifesto",
      title: "Manifesto",
      content: [1], // Hikayemiz
    },
    {
      key: "about.timeline",
      registryId: "about.timeline",
      title: "Çift fotoğrafı + hayat çizelgesi",
      content: [2], // Zaman çizelgesi
      slots: ["about.founders.image"],
    },
    {
      key: "about.values",
      registryId: "about.values",
      title: "Değerler",
      content: [3], // Bizi farklı kılan (değerler)
    },
    {
      key: "about.proof",
      registryId: "about.proof",
      title: "Kanıt şeridi",
      content: [4], // Yaşanmış tecrübe / kanıt
    },
    {
      key: "about.services",
      registryId: "about.services",
      title: "Hizmet alanları",
      content: [5],
    },
    {
      key: "fixed:about.next",
      title: "Kapanış / sıradaki adım",
      locked: true,
      content: [6], // Kapanış / sıradaki adım
    },
  ],

  // ── SSS ─────────────────────────────────────────────────────────────────────
  faq: [
    {
      key: "fixed:faq.hero",
      title: "Hero / başlık",
      locked: true,
      content: [0],
      slots: ["faq.hero.image", "faq.hero.video"],
    },
    {
      key: "faq.list",
      registryId: "faq.list",
      title: "SSS listesi",
      content: [1], // Sorular & cevaplar
    },
    {
      key: "faq.trust",
      registryId: "faq.trust",
      title: "Güven şeridi",
      content: [2], // Kapanış CTA
    },
  ],

  // ── İLETİŞİM ────────────────────────────────────────────────────────────────
  contact: [
    {
      key: "fixed:contact.hero",
      title: "Hero / üst bölüm",
      locked: true,
      content: [0],
      slots: ["contact.hero.image", "contact.hero.video"],
    },
    {
      key: "contact.assurance",
      registryId: "contact.assurance",
      title: "Güvence şeridi",
      content: [1], // Güvence şeridi
    },
    {
      key: "contact.form",
      registryId: "contact.form",
      title: "Form + iletişim/ödeme",
      content: [2, 3, 4], // İletişim formu + Ödeme yöntemleri + Bizi Antalya'da bul (konum)
    },
  ],

  // ── GENEL (menü & ortak) — registry/slot yok; tümü sabit kartlar ─────────────
  genel: [
    { key: "fixed:genel.identity", title: "Site kimliği / SEO", locked: true, content: [0] },
    { key: "fixed:genel.nav", title: "Menü (navigasyon)", content: [1] },
    { key: "fixed:genel.footer", title: "Alt bilgi (footer)", content: [2] },
    { key: "fixed:genel.common", title: "Ortak butonlar & etiketler", content: [3] },
    { key: "fixed:genel.sell", title: "Genel satış mesajı (sana özel)", content: [4] },
    { key: "fixed:genel.checkout", title: "Kripto ödeme sayfası (checkout)", content: [5] },
  ],
};

/**
 * Bir sayfanın editör kartlarını (site sırasında) döndürür.
 * Bilinmeyen sayfa için boş dizi. Bağlanmamış content bölümleri veya asset
 * slotları varsa sona bir `other` kartı eklenir (hiçbir şey kaybolmaz).
 */
export function editorSectionsForPage(page: string): EditorSection[] {
  const pageDef = CONTENT_PAGES.find((p) => p.id === page);
  if (!pageDef) return [];

  const specs = CARD_MAP[page] ?? [];
  const usedContent = new Set<number>();
  const usedSlots = new Set<string>();
  const pageSlots = ASSET_SLOTS.filter((a) => a.page === page).map((a) => a.id);

  const cards: EditorSection[] = specs.map((spec) => {
    const contentKeys: string[] = [];
    const seenKeys = new Set<string>();
    for (const idx of spec.content) {
      usedContent.add(idx);
      const sec = pageDef.sections[idx];
      if (!sec) continue;
      for (const k of sec.keys) {
        // content-map bazı anahtarları iki bölümde tekrarlayabilir (örn.
        // routes.allInLabel) — kart içinde tekilleştir, ilk sırayı koru.
        if (seenKeys.has(k)) continue;
        seenKeys.add(k);
        contentKeys.push(k);
      }
    }
    const assetSlots: string[] = [];
    for (const s of spec.slots ?? []) {
      usedSlots.add(s);
      assetSlots.push(s);
    }
    const card: EditorSection = {
      key: spec.key,
      title: spec.title,
      contentKeys,
      assetSlots,
    };
    if (spec.registryId) card.registryId = spec.registryId;
    if (spec.locked) card.locked = true;
    return card;
  });

  // Bağlanmamış content bölümleri + slotlar → tek "other" kartı (kayıp yok).
  const leftoverKeys: string[] = [];
  pageDef.sections.forEach((sec, idx) => {
    if (!usedContent.has(idx)) leftoverKeys.push(...sec.keys);
  });
  const leftoverSlots = pageSlots.filter((s) => !usedSlots.has(s));

  if (leftoverKeys.length || leftoverSlots.length) {
    cards.push({
      key: "other",
      title: "Diğer",
      contentKeys: leftoverKeys,
      assetSlots: leftoverSlots,
    });
  }

  return cards;
}
