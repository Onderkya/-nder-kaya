/** Sayfalardaki göster/gizle edilebilir bölümler. */
export type SectionDef = { page: string; id: string; label: string };

export const SECTIONS: SectionDef[] = [
  // Anasayfa (hero ve son CTA zorunlu → listede yok)
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
];

export const sectionsForPage = (page: string) => SECTIONS.filter((s) => s.page === page);
