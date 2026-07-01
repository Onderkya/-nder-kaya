// Public site image/video asset registry.
//
// This is the source of truth for every editable IMAGE and VIDEO rendered on the
// 7 public pages (home, antalya, lessons, education, about, faq, contact) and
// their shared components. Each entry has a stable dotted `id`, a friendly Turkish
// `label`, a `type`, the `page` it appears on, and the current default path (`def`).
//
// A later pass will swap the hardcoded `src`/`poster`/`image`/`video`/`img` literals
// in the components for an override lookup keyed on `id`. See the WIRING MAP handed to
// the maintainer for exact file:line locations of every literal.
//
// NOT included (dynamic / not owner-editable):
//   - components/youtube-embed.tsx thumbnail — built from a YouTube video id at runtime.
//   - components/dive-hero.tsx "/media/waves.mp3" — audio, not image/video.
//   - CMS BlockRenderer media (components/cms/**) — already DB-backed / admin-editable.
//   - /og/antalya-bridge.jpg (app/[locale]/layout.tsx) — OpenGraph share image (metadata, not on-page).
//   - components/page-hero.tsx default "/images/yivli.jpg" — component is not used by any public page.
//   - components/antalya-scene.tsx — procedural <canvas> scene, no image/video asset.

export type AssetSlot = { id: string; label: string; type: "image" | "video"; page: string; def: string };

export const ASSET_SLOTS: AssetSlot[] = [
  // ============ HOME (app/[locale]/page.tsx + components) ============
  // Dive hero (components/dive-hero.tsx) — aerial video passed from page, poster + fallback + underwater are hardcoded in the component.
  { id: "home.hero.aerialVideo", label: "Anasayfa · Hero havadan video (Kaputaş dron)", type: "video", page: "home", def: "/media/kaputas-drone.mp4" },
  { id: "home.hero.poster", label: "Anasayfa · Hero poster / fallback görseli (Kaputaş)", type: "image", page: "home", def: "/images/kaputas.jpg" },
  { id: "home.diveFish.video", label: "Anasayfa · Sualtı balık videosu", type: "video", page: "home", def: "/media/dive-fish.mp4" },

  // Fermuar deneyimi (ZipperReveal items — app/[locale]/page.tsx)
  { id: "home.zipper.scuba.video", label: "Anasayfa · Fermuar · Scuba videosu", type: "video", page: "home", def: "/media/act-scuba2.mp4" },
  { id: "home.zipper.scuba.image", label: "Anasayfa · Fermuar · Scuba görseli", type: "image", page: "home", def: "/images/kaputas-deep.jpg" },
  { id: "home.zipper.kaputas.video", label: "Anasayfa · Fermuar · Kaputaş videosu", type: "video", page: "home", def: "/media/kaputas-drone.mp4" },
  { id: "home.zipper.kaputas.image", label: "Anasayfa · Fermuar · Kaputaş görseli", type: "image", page: "home", def: "/images/kaputas.jpg" },
  { id: "home.zipper.kas.video", label: "Anasayfa · Fermuar · Kaş videosu", type: "video", page: "home", def: "/media/vid-kas.mp4" },
  { id: "home.zipper.kas.image", label: "Anasayfa · Fermuar · Kaş görseli", type: "image", page: "home", def: "/images/sunset.jpg" },
  { id: "home.zipper.suluada.video", label: "Anasayfa · Fermuar · Suluada videosu", type: "video", page: "home", def: "/media/vid-suluada.mp4" },
  { id: "home.zipper.suluada.image", label: "Anasayfa · Fermuar · Suluada görseli", type: "image", page: "home", def: "/images/suluada.jpg" },
  { id: "home.zipper.olympos.video", label: "Anasayfa · Fermuar · Olympos videosu", type: "video", page: "home", def: "/media/vid-olympos.mp4" },
  { id: "home.zipper.olympos.image", label: "Anasayfa · Fermuar · Olympos görseli", type: "image", page: "home", def: "/images/olympos.jpg" },
  { id: "home.zipper.kemer.video", label: "Anasayfa · Fermuar · Kemer videosu", type: "video", page: "home", def: "/media/vid-kemer.mp4" },
  { id: "home.zipper.kemer.image", label: "Anasayfa · Fermuar · Kemer görseli", type: "image", page: "home", def: "/images/kemer.jpg" },
  { id: "home.zipper.alanyaCastle.video", label: "Anasayfa · Fermuar · Alanya Kalesi videosu", type: "video", page: "home", def: "/media/vid-alanya-castle.mp4" },
  { id: "home.zipper.alanyaCastle.image", label: "Anasayfa · Fermuar · Alanya Kalesi görseli", type: "image", page: "home", def: "/images/alanya.jpg" },
  { id: "home.zipper.kleopatra.video", label: "Anasayfa · Fermuar · Kleopatra videosu", type: "video", page: "home", def: "/media/vid-alanya-kleopatra.mp4" },
  { id: "home.zipper.kleopatra.image", label: "Anasayfa · Fermuar · Kleopatra görseli", type: "image", page: "home", def: "/images/alanya.jpg" },
  { id: "home.zipper.legends.video", label: "Anasayfa · Fermuar · Land of Legends videosu", type: "video", page: "home", def: "/media/lol-aqua.mp4" },
  { id: "home.zipper.legends.image", label: "Anasayfa · Fermuar · Land of Legends görseli", type: "image", page: "home", def: "/images/coaster.jpg" },

  // Neden Antalya bridge (koyu deniz bandı — app/[locale]/page.tsx)
  { id: "home.whyBand.image", label: "Anasayfa · Neden Antalya bandı görseli (gün batımı)", type: "image", page: "home", def: "/images/sunset.jpg" },

  // Türkiye'de eğitim (ikincil bölüm — app/[locale]/page.tsx, AutoVideo)
  { id: "home.study.video", label: "Anasayfa · Eğitim bölümü videosu (bayraklı tekne)", type: "video", page: "home", def: "/media/turkish-flag-boat.mp4" },
  { id: "home.study.poster", label: "Anasayfa · Eğitim bölümü poster (Türk bayrağı)", type: "image", page: "home", def: "/images/turkish-flag.jpg" },

  // Son CTA (app/[locale]/page.tsx)
  { id: "home.finalCta.image", label: "Anasayfa · Son CTA arka plan (Ölüdeniz lagün)", type: "image", page: "home", def: "/images/lagoon.jpg" },

  // Öne çıkan oteller (app/[locale]/page.tsx allHotels array — bir kart/otel = bir slot)
  { id: "hotel.cullinan.image", label: "Otel · Cullinan Belek fotoğrafı", type: "image", page: "home", def: "/images/hotels/cullinan-belek.jpg" },
  { id: "hotel.maxxbelek.image", label: "Otel · Maxx Royal Belek fotoğrafı", type: "image", page: "home", def: "/images/hotels/maxx-royal-belek.jpg" },
  { id: "hotel.regnum.image", label: "Otel · Regnum Carya fotoğrafı", type: "image", page: "home", def: "/images/hotels/regnum-carya.jpg" },
  { id: "hotel.maxxkemer.image", label: "Otel · Maxx Royal Kemer fotoğrafı", type: "image", page: "home", def: "/images/hotels/maxx-royal-kemer.jpg" },
  { id: "hotel.ngphaselis.image", label: "Otel · NG Phaselis Bay fotoğrafı", type: "image", page: "home", def: "/images/hotels/ng-phaselis-bay.jpg" },
  { id: "hotel.larabarut.image", label: "Otel · Lara Barut Collection fotoğrafı", type: "image", page: "home", def: "/images/hotels/lara-barut.jpg" },
  { id: "hotel.bayou.image", label: "Otel · Bayou Villas fotoğrafı", type: "image", page: "home", def: "/images/hotels/bayou-villas.jpg" },
  { id: "hotel.legends.image", label: "Otel · Land of Legends Kingdom fotoğrafı", type: "image", page: "home", def: "/images/hotels/land-of-legends-kingdom.jpg" },

  // ============ HAZIR ROTALAR (components/ready-routes.tsx) ============
  // Paylaşılan ReadyRoutes bileşeni home + antalya sayfalarında görünür; rota fotoğrafları burada tanımlı.
  { id: "route.r1.image", label: "Rota · Balayı (Lara Barut) fotoğrafı", type: "image", page: "home", def: "/images/hotels/lara-barut.jpg" },
  { id: "route.r2.image", label: "Rota · Cullinan Belek fotoğrafı", type: "image", page: "home", def: "/images/hotels/cullinan-belek.jpg" },
  { id: "route.r3.image", label: "Rota · NG Phaselis Bay fotoğrafı", type: "image", page: "home", def: "/images/hotels/ng-phaselis-bay.jpg" },
  { id: "route.r4.image", label: "Rota · Land of Legends Kingdom fotoğrafı", type: "image", page: "home", def: "/images/hotels/land-of-legends-kingdom.jpg" },
  { id: "route.r5.image", label: "Rota · Maxx Royal Kemer fotoğrafı", type: "image", page: "home", def: "/images/hotels/maxx-royal-kemer.jpg" },

  // ============ ANTALYA (app/[locale]/antalya/page.tsx) ============
  { id: "antalya.hero.image", label: "Antalya · Hero poster görseli (Kaputaş)", type: "image", page: "antalya", def: "/images/kaputas.jpg" },
  { id: "antalya.hero.video1", label: "Antalya · Hero videosu 1 (Kaputaş dron)", type: "video", page: "antalya", def: "/media/kaputas-drone.mp4" },
  { id: "antalya.hero.video2", label: "Antalya · Hero videosu 2 (Suluada)", type: "video", page: "antalya", def: "/media/vid-suluada.mp4" },
  { id: "antalya.hero.video3", label: "Antalya · Hero videosu 3 (Kemer)", type: "video", page: "antalya", def: "/media/vid-kemer.mp4" },
  { id: "antalya.hero.video4", label: "Antalya · Hero videosu 4 (Kaş)", type: "video", page: "antalya", def: "/media/vid-kas.mp4" },
  // Bölgeler — yatay gezi (HorizontalPlaces places array)
  { id: "antalya.place.kaputas.image", label: "Antalya · Bölge · Kaputaş görseli", type: "image", page: "antalya", def: "/images/kaputas.jpg" },
  { id: "antalya.place.kaputas.video", label: "Antalya · Bölge · Kaputaş videosu", type: "video", page: "antalya", def: "/media/kaputas-drone.mp4" },
  { id: "antalya.place.suluada.image", label: "Antalya · Bölge · Suluada görseli", type: "image", page: "antalya", def: "/images/suluada.jpg" },
  { id: "antalya.place.suluada.video", label: "Antalya · Bölge · Suluada videosu", type: "video", page: "antalya", def: "/media/vid-suluada.mp4" },
  { id: "antalya.place.kemer.image", label: "Antalya · Bölge · Kemer görseli", type: "image", page: "antalya", def: "/images/kemer.jpg" },
  { id: "antalya.place.kemer.video", label: "Antalya · Bölge · Kemer videosu", type: "video", page: "antalya", def: "/media/vid-kemer.mp4" },
  { id: "antalya.place.olympos.image", label: "Antalya · Bölge · Olympos görseli", type: "image", page: "antalya", def: "/images/olympos.jpg" },
  { id: "antalya.place.olympos.video", label: "Antalya · Bölge · Olympos videosu", type: "video", page: "antalya", def: "/media/vid-olympos.mp4" },
  { id: "antalya.place.alanya.image", label: "Antalya · Bölge · Alanya görseli", type: "image", page: "antalya", def: "/images/alanya.jpg" },
  { id: "antalya.place.alanya.video", label: "Antalya · Bölge · Alanya videosu", type: "video", page: "antalya", def: "/media/vid-alanya-castle.mp4" },
  { id: "antalya.place.beachpark.image", label: "Antalya · Bölge · Beach Park görseli", type: "image", page: "antalya", def: "/images/beachpark.jpg" },
  { id: "antalya.place.lara.image", label: "Antalya · Bölge · Lara görseli", type: "image", page: "antalya", def: "/images/lara.jpg" },
  { id: "antalya.place.kaleici.image", label: "Antalya · Bölge · Kaleiçi görseli", type: "image", page: "antalya", def: "/images/kaleici-harbor.jpg" },
  { id: "antalya.place.kaleici.video", label: "Antalya · Bölge · Kaleiçi videosu", type: "video", page: "antalya", def: "/media/vid-kaleici.mp4" },
  { id: "antalya.place.side.image", label: "Antalya · Bölge · Side görseli", type: "image", page: "antalya", def: "/images/side.jpg" },
  { id: "antalya.place.duden.image", label: "Antalya · Bölge · Düden görseli", type: "image", page: "antalya", def: "/images/duden.jpg" },
  { id: "antalya.place.duden.video", label: "Antalya · Bölge · Düden videosu", type: "video", page: "antalya", def: "/media/vid-duden.mp4" },
  // CTA
  { id: "antalya.cta.image", label: "Antalya · Son CTA arka plan (Kaputaş)", type: "image", page: "antalya", def: "/images/kaputas.jpg" },

  // ============ LESSONS (app/[locale]/lessons/page.tsx) ============
  { id: "lessons.hero.image", label: "Dersler · Hero poster görseli", type: "image", page: "lessons", def: "/images/lessons-meaning.jpg" },
  { id: "lessons.hero.video1", label: "Dersler · Hero videosu 1 (defter)", type: "video", page: "lessons", def: "/media/les-notebook.mp4" },
  { id: "lessons.hero.video2", label: "Dersler · Hero videosu 2 (öğretmen)", type: "video", page: "lessons", def: "/media/les-teacher.mp4" },
  { id: "lessons.hero.video3", label: "Dersler · Hero videosu 3 (online)", type: "video", page: "lessons", def: "/media/les-online.mp4" },
  { id: "lessons.hero.video4", label: "Dersler · Hero videosu 4 (harf/spell)", type: "video", page: "lessons", def: "/media/les-spell.mp4" },
  // Süreç adımları (steps array)
  { id: "lessons.step1.video", label: "Dersler · Adım 01 videosu (harf)", type: "video", page: "lessons", def: "/media/les-spell.mp4" },
  { id: "lessons.step2.video", label: "Dersler · Adım 02 videosu (öğretmen)", type: "video", page: "lessons", def: "/media/les-teacher.mp4" },
  { id: "lessons.step3.video", label: "Dersler · Adım 03 videosu (online)", type: "video", page: "lessons", def: "/media/les-online.mp4" },
  { id: "lessons.step4.video", label: "Dersler · Adım 04 videosu (online)", type: "video", page: "lessons", def: "/media/les-online.mp4" },
  // Öğretmen kimlik bandı
  { id: "lessons.teacher.video", label: "Dersler · Öğretmen bandı videosu", type: "video", page: "lessons", def: "/media/les-teacher.mp4" },

  // ============ EDUCATION (app/[locale]/education/page.tsx) ============
  { id: "education.hero.image", label: "Eğitim · Hero poster görseli (bayraklı gökyüzü)", type: "image", page: "education", def: "/images/turkish-flag-sky.jpg" },
  // Kampüs görseli (existsSync ile campus-wide → campus fallback; ana editlenebilir olan campus-wide)
  { id: "education.campus.image", label: "Eğitim · Akdeniz Üniversitesi kampüs görseli", type: "image", page: "education", def: "/images/akdeniz-campus-wide.jpg" },
  { id: "education.campus.imageFallback", label: "Eğitim · Kampüs görseli (fallback)", type: "image", page: "education", def: "/images/campus.jpg" },
  // Study journey adımları (StudyJourney steps array)
  { id: "education.step1.video", label: "Eğitim · Adım 01 videosu (kampüs havadan)", type: "video", page: "education", def: "/media/campus-aerial.mp4" },
  { id: "education.step2.image", label: "Eğitim · Adım 02 görseli (kampüs)", type: "image", page: "education", def: "/images/campus.jpg" },
  { id: "education.step2.video", label: "Eğitim · Adım 02 videosu (ofis danışma)", type: "video", page: "education", def: "/media/office-consult.mp4" },
  { id: "education.step3.image", label: "Eğitim · Adım 03 görseli (Kaleiçi iç)", type: "image", page: "education", def: "/images/kaleici-inside.jpg" },
  { id: "education.step3.video", label: "Eğitim · Adım 03 videosu (sokak)", type: "video", page: "education", def: "/media/edu-street.mp4" },
  { id: "education.step4.image", label: "Eğitim · Adım 04 görseli (yurt)", type: "image", page: "education", def: "/images/dorm.jpg" },

  // ============ ABOUT (app/[locale]/about/page.tsx) ============
  { id: "about.hero.image", label: "Hakkımızda · Hero poster görseli (Kaleiçi liman)", type: "image", page: "about", def: "/images/kaleici-harbor.jpg" },
  { id: "about.hero.video", label: "Hakkımızda · Hero videosu (Kaleiçi)", type: "video", page: "about", def: "/media/vid-kaleici.mp4" },
  { id: "about.founders.image", label: "Hakkımızda · Kurucular fotoğrafı", type: "image", page: "about", def: "/images/founders.jpg" },

  // ============ FAQ (app/[locale]/faq/page.tsx) ============
  { id: "faq.hero.image", label: "SSS · Hero poster görseli (Kemer)", type: "image", page: "faq", def: "/images/kemer.jpg" },
  { id: "faq.hero.video", label: "SSS · Hero videosu (Kemer)", type: "video", page: "faq", def: "/media/vid-kemer.mp4" },

  // ============ CONTACT (app/[locale]/contact/page.tsx) ============
  { id: "contact.hero.image", label: "İletişim · Hero poster görseli (gün batımı)", type: "image", page: "contact", def: "/images/sunset.jpg" },
  { id: "contact.hero.video", label: "İletişim · Hero videosu (Kaş)", type: "video", page: "contact", def: "/media/vid-kas.mp4" },
];
