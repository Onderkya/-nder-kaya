/**
 * CMS blok tip kayıt defteri — admin editörü ve public renderer'ın ÜZERİNDE
 * anlaştığı tek kaynak. Saf yapılandırma (prisma/sunucu importu yok) → hem
 * client editör hem server renderer kullanabilir.
 *
 * - `fields`: yerelleştirilen metin alanları (Translation satırı, 5 dil).
 * - `props`: yerelleştirilmeyen ayarlar (görsel url, href, hizalama, sayı...).
 * - cards/faq gibi tipler `count` prop'una göre dinamik öğe alanları üretir.
 */

export type FieldKind = "text" | "textarea";
export type PropKind = "text" | "image" | "select" | "number" | "bool";

export type FieldDef = { name: string; label: string; kind: FieldKind };
export type PropDef = { name: string; label: string; kind: PropKind; options?: string[]; default?: string };

export type BlockDef = {
  type: string;
  label: string;
  /** Statik (öğe sayısından bağımsız) metin alanları. */
  fields: FieldDef[];
  /** Statik yapılandırma. */
  props: PropDef[];
  /** cards/faq: her öğe için alan üreticisi. */
  item?: { fields: (i: number) => FieldDef[]; props: (i: number) => PropDef[] };
  /** Premium "özel tip": kendi çevirisini okur, admin'de alan yoktur (metin Site İçeriği'nden). */
  custom?: boolean;
};

export const BLOCK_DEFS: BlockDef[] = [
  {
    type: "hero",
    label: "Hero (büyük başlık + görsel)",
    fields: [
      { name: "eyebrow", label: "Üst etiket", kind: "text" },
      { name: "title", label: "Başlık", kind: "text" },
      { name: "subtitle", label: "Alt metin", kind: "textarea" },
      { name: "ctaText", label: "Buton metni", kind: "text" },
    ],
    props: [
      { name: "image", label: "Arka plan görseli", kind: "image" },
      { name: "ctaHref", label: "Buton bağlantısı (/contact, https://...)", kind: "text" },
    ],
  },
  {
    type: "heading",
    label: "Başlık bölümü",
    fields: [
      { name: "eyebrow", label: "Üst etiket", kind: "text" },
      { name: "title", label: "Başlık", kind: "text" },
      { name: "body", label: "Açıklama", kind: "textarea" },
    ],
    props: [{ name: "align", label: "Hizalama", kind: "select", options: ["center", "left"], default: "center" }],
  },
  {
    type: "richtext",
    label: "Metin (paragraflar)",
    fields: [{ name: "body", label: "Metin (boş satır = yeni paragraf)", kind: "textarea" }],
    props: [],
  },
  {
    type: "image",
    label: "Görsel",
    fields: [{ name: "caption", label: "Açıklama (alt yazı)", kind: "text" }],
    props: [{ name: "image", label: "Görsel", kind: "image" }],
  },
  {
    type: "imageText",
    label: "Görsel + Metin",
    fields: [
      { name: "title", label: "Başlık", kind: "text" },
      { name: "body", label: "Metin", kind: "textarea" },
    ],
    props: [
      { name: "image", label: "Görsel", kind: "image" },
      { name: "flip", label: "Görsel sağda", kind: "bool" },
    ],
  },
  {
    type: "cta",
    label: "Çağrı bandı (CTA)",
    fields: [
      { name: "title", label: "Başlık", kind: "text" },
      { name: "body", label: "Metin", kind: "textarea" },
      { name: "ctaText", label: "Buton metni", kind: "text" },
    ],
    props: [{ name: "ctaHref", label: "Buton bağlantısı", kind: "text" }],
  },
  {
    type: "quote",
    label: "Alıntı",
    fields: [
      { name: "body", label: "Alıntı metni", kind: "textarea" },
      { name: "by", label: "Kim söyledi", kind: "text" },
    ],
    props: [],
  },
  {
    type: "cards",
    label: "Kart ızgarası",
    fields: [{ name: "title", label: "Bölüm başlığı", kind: "text" }],
    props: [{ name: "count", label: "Kart sayısı", kind: "number", default: "3" }],
    item: {
      fields: (i) => [
        { name: `c${i}Title`, label: `Kart ${i + 1} — başlık`, kind: "text" },
        { name: `c${i}Body`, label: `Kart ${i + 1} — metin`, kind: "textarea" },
      ],
      props: (i) => [
        { name: `c${i}Img`, label: `Kart ${i + 1} — görsel`, kind: "image" },
        { name: `c${i}Href`, label: `Kart ${i + 1} — bağlantı`, kind: "text" },
      ],
    },
  },
  {
    type: "faq",
    label: "Sık sorulanlar (S.S.S.)",
    fields: [{ name: "title", label: "Bölüm başlığı", kind: "text" }],
    props: [{ name: "count", label: "Soru sayısı", kind: "number", default: "4" }],
    item: {
      fields: (i) => [
        { name: `q${i}`, label: `Soru ${i + 1}`, kind: "text" },
        { name: `a${i}`, label: `Cevap ${i + 1}`, kind: "textarea" },
      ],
      props: () => [],
    },
  },
  // ★ Premium özel tipler — mevcut sinematik bileşenler. Alan yok; metin Site
  // İçeriği'nden düzenlenir. Render: components/cms/premium-blocks.tsx.
  { type: "routeGallery", label: "★ Hazır Rotalar (sinematik galeri)", fields: [], props: [], custom: true },
  { type: "studyJourney", label: "★ Eğitim Yolculuğu (scroll sahne)", fields: [], props: [], custom: true },
  { type: "hotels", label: "★ Otel Kartları", fields: [], props: [], custom: true },
  { type: "petlingo", label: "★ PetLingo Vitrini", fields: [], props: [], custom: true },
  { type: "guestVoices", label: "★ Misafir Sözleri", fields: [], props: [], custom: true },
  { type: "quickPlan", label: "★ Hızlı Plan Formu", fields: [], props: [], custom: true },
];

export function blockDef(type: string): BlockDef | undefined {
  return BLOCK_DEFS.find((b) => b.type === type);
}

export function itemCount(props: Record<string, unknown>, fallback = 3): number {
  const n = Number(props?.count);
  return Number.isFinite(n) && n > 0 && n <= 12 ? Math.floor(n) : fallback;
}

/** Bir blok örneği için TÜM yerelleştirilen alan adları (öğe sayısına göre). */
export function localizedFieldDefs(type: string, props: Record<string, unknown>): FieldDef[] {
  const def = blockDef(type);
  if (!def) return [];
  const out = [...def.fields];
  if (def.item) {
    const n = itemCount(props);
    for (let i = 0; i < n; i++) out.push(...def.item.fields(i));
  }
  return out;
}

/** Bir blok örneği için TÜM yapılandırma (props) tanımları. */
export function propDefs(type: string, props: Record<string, unknown>): PropDef[] {
  const def = blockDef(type);
  if (!def) return [];
  const out = [...def.props];
  if (def.item) {
    const n = itemCount(props);
    for (let i = 0; i < n; i++) out.push(...def.item.props(i));
  }
  return out;
}
