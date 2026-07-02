/** Sayfalardaki göster/gizle edilebilir bölümler. */
export type SectionDef = { page: string; id: string; label: string };

export const SECTIONS: SectionDef[] = [
  // Anasayfa (hero ve son CTA zorunlu → listede yok)
  { page: "home", id: "home.diffStrip", label: "Fark şeridi (hero altı kimlik cümlesi)" },
  { page: "home", id: "home.readyRoutes", label: "Hazır Rotalar (paket vitrini)" },
  { page: "home", id: "home.hotels", label: "Oteller" },
  { page: "home", id: "home.quickPlan", label: "Özel Plan formu" },
  { page: "home", id: "home.zipper", label: "Fermuar deneyimi (Antalya)" },
  { page: "home", id: "home.why", label: "Neden Antalya Bridge" },
  { page: "home", id: "home.lessons", label: "Türkçe Dersleri + PetLingo" },
  { page: "home", id: "home.education", label: "Türkiye'de Eğitim" },
  { page: "home", id: "home.guestVoices", label: "Misafir Sözleri" },
  { page: "home", id: "home.payment", label: "Ödeme & Güven" },
  { page: "home", id: "home.miniFaq", label: "Mini SSS" },

  // Antalya danışmanlık (hero ve son CTA zorunlu → listede yok)
  { page: "antalya", id: "antalya.readyRoutes", label: "Hazır Rotalar (paket vitrini)" },
  { page: "antalya", id: "antalya.intro", label: "Editoryal giriş + özellikler" },
  { page: "antalya", id: "antalya.regions", label: "Bölgeler (yatay gezi)" },

  // Türkçe Dersleri (hero zorunlu → listede yok)
  { page: "lessons", id: "lessons.conversionBar", label: "Kontenjan şeridi (hero altı)" },
  { page: "lessons", id: "lessons.process", label: "Süreç — nasıl öğreniyorsunuz" },
  { page: "lessons", id: "lessons.teacher", label: "Öğretmen kimlik bandı" },
  { page: "lessons", id: "lessons.levelPath", label: "0'dan C2'ye seviye yolu" },
  { page: "lessons", id: "lessons.lived", label: "Bunu biz de yaşadık (güven bandı)" },
  { page: "lessons", id: "lessons.petlingo", label: "PetLingo" },
  { page: "lessons", id: "lessons.durations", label: "Ders süreleri" },
  { page: "lessons", id: "lessons.guestVoices", label: "Misafir Sözleri" },
  { page: "lessons", id: "lessons.booking", label: "Randevu" },

  // Türkiye'de Eğitim (hero ve son CTA zorunlu → listede yok)
  { page: "education", id: "education.journey", label: "Yolculuk (6 adım)" },
  { page: "education", id: "education.lived", label: "Bunu biz de yaşadık (güven bandı)" },
  { page: "education", id: "education.deliverables", label: "Neyi hallediyoruz (teslimatlar)" },

  // Hakkımızda (hero ve kapanış bandı zorunlu → listede yok)
  { page: "about", id: "about.manifesto", label: "Manifesto" },
  { page: "about", id: "about.timeline", label: "Çift fotoğrafı + hayat çizelgesi" },
  { page: "about", id: "about.values", label: "Değerler" },
  { page: "about", id: "about.services", label: "Hizmet alanları" },
  { page: "about", id: "about.proof", label: "Kanıt şeridi" },

  // SSS (hero ve kapanış bandı zorunlu → listede yok)
  { page: "faq", id: "faq.list", label: "SSS listesi" },
  { page: "faq", id: "faq.trust", label: "Güven şeridi" },

  // İletişim (hero zorunlu → listede yok)
  { page: "contact", id: "contact.assurance", label: "Güvence şeridi" },
  { page: "contact", id: "contact.form", label: "Form + iletişim/ödeme" },
];

export const sectionsForPage = (page: string) => SECTIONS.filter((s) => s.page === page);
