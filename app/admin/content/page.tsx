import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getEditableTexts, loadBaseFlat, getMergedMessages, flatten } from "@/lib/messages";
import { routing, localeNames, localeFlags, type Locale } from "@/i18n/routing";
import { requireAdmin } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { PageHeader } from "@/components/admin/ui";
import { ContentEditor, type EditorPageData } from "@/components/admin/content-editor";
import type { EditorCard, CardField, GalleryData } from "@/components/admin/editor-section-card";
import { editorSectionsForPage, EDITOR_PAGES } from "@/lib/editor-map";
import { ASSET_SLOTS, type AssetSlot } from "@/lib/asset-slots";
import { getAssetMap, getHiddenAssetSet } from "@/lib/assets";
import { getFaqExtras } from "@/lib/faq";
import { FaqManager } from "@/components/admin/faq-manager";
import { getHiddenSections, getSectionOrders, applySectionOrder } from "@/lib/sections";
import { getGalleries, type GalleryItemCfg } from "@/lib/gallery";
import { GALLERY_DEFAULTS } from "@/lib/gallery-defaults";
import type { L10n } from "@/lib/tours";

export const dynamic = "force-dynamic";

const SEP = "|||";

/** Public sayfa rotaları — "Sitede gör →" bağlantısı için (localePrefix: always). */
const PAGE_ROUTES: Record<string, string> = {
  home: "",
  antalya: "/antalya",
  lessons: "/lessons",
  education: "/education",
  about: "/about",
  faq: "/faq",
  contact: "/contact",
};

async function saveTexts(formData: FormData) {
  "use server";
  const session = await requireAdmin();
  const bases: Record<string, Record<string, string>> = {};
  for (const l of routing.locales) bases[l] = await loadBaseFlat(l);

  for (const [field, raw] of formData.entries()) {
    if (!field.includes(SEP)) continue;
    const [key, locale] = field.split(SEP);
    const value = String(raw);
    const base = bases[locale]?.[key] ?? "";
    if (value.trim() === "" || value === base) {
      await prisma.siteText.deleteMany({ where: { key, locale } });
    } else {
      await prisma.siteText.upsert({
        where: { key_locale: { key, locale } },
        update: { value },
        create: { key, locale, value },
      });
    }
  }
  await audit(session.email, "update", "SiteText", null, "Site metinleri güncellendi");
  revalidatePath("/admin/content");
  revalidatePath("/", "layout");
}

export default async function ContentPage({ searchParams }: { searchParams: Promise<{ lang?: string; sayfa?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const locale = (routing.locales as readonly string[]).includes(sp.lang ?? "") ? (sp.lang as Locale) : ("tr" as Locale);

  const [texts, baseLoc, baseTr, assetOverrides, mediaRows] = await Promise.all([
    getEditableTexts(),
    loadBaseFlat(locale),
    loadBaseFlat("tr"),
    getAssetMap(),
    prisma.media.findMany({ orderBy: { createdAt: "desc" }, take: 60, select: { id: true, url: true, alt: true } }).catch(() => []),
  ]);
  const faqExtras = await getFaqExtras();
  const [hiddenSet, orders, galleries, hiddenAssetSet] = await Promise.all([getHiddenSections(), getSectionOrders(), getGalleries(), getHiddenAssetSet()]);
  const hiddenSections = [...hiddenSet];
  const hiddenAssets = [...hiddenAssetSet];

  // Galeri prefill: tüm dillerin düzleştirilmiş mesajları (ns'li başlıkları
  // 4 dile çevirmek için). Kayıtlı override varsa satırlar birebir; yoksa
  // varsayılanlar L10n'e materyalize edilir (tur editörü kalıbı).
  const galFlatByLocale: Record<string, Record<string, string>> = {};
  for (const l of routing.locales) galFlatByLocale[l] = flatten((await getMergedMessages(l)) as never);
  // Bir başlık/alt başlık alanını 4 dilde L10n'e çevirir. ns VARSA `${ns}.${key}`
  // i18n anahtarıdır; ns YOKSA key koddaki DÜZ metindir (tüm dillerde aynı).
  const captionL10n = (key: string | undefined, ns: string | undefined): L10n => {
    if (!key) return {};
    if (!ns) return Object.fromEntries(routing.locales.map((l) => [l, key]));
    return Object.fromEntries(routing.locales.map((l) => [l, galFlatByLocale[l][`${ns}.${key}`] ?? key]));
  };

  /** Bir galeri bölümü için editör verisi (prefill + override sahipliği). */
  const galleryDataFor = (sectionId: string): GalleryData => {
    const override = galleries[sectionId];
    if (override?.length) {
      // Kayıtlı override → satırlar birebir; eksik başlık alanları için {} bırak.
      const items: GalleryItemCfg[] = override.map((it) => ({
        src: it.src,
        type: it.type,
        ...(it.poster ? { poster: it.poster } : {}),
        title: it.title ?? {},
        desc: it.desc ?? {},
        active: it.active !== false,
      }));
      return { sectionId, items, hasOverride: true };
    }
    // Override yok → varsayılanlar 4 dile materyalize.
    const items: GalleryItemCfg[] = (GALLERY_DEFAULTS[sectionId] ?? []).map((d) => ({
      src: d.src,
      type: d.type,
      ...(d.poster ? { poster: d.poster } : {}),
      title: captionL10n(d.tKey, d.ns),
      desc: captionL10n(d.dKey, d.ns),
      active: true,
    }));
    return { sectionId, items, hasOverride: false };
  };

  const map = new Map(texts.map((t) => [t.key, t]));
  const slotMap = new Map(ASSET_SLOTS.map((s) => [s.id, s]));
  const mappedKeys = new Set<string>();

  const fieldFor = (key: string): CardField | null => {
    const t = map.get(key);
    if (!t) return null;
    mappedKeys.add(key);
    const value = t.values[locale] ?? "";
    return { key, value, ref: baseTr[key] ?? "", overridden: value !== (baseLoc[key] ?? "") && value.trim() !== "" };
  };

  /**
   * Kartları gerçek site sırasında sıralar: locked/other kartlar konumlarında
   * SABİT kalır; registryId'li (sıralanabilir) kartlar KENDİ aralarında,
   * kayıtlı sıraya (applySectionOrder) göre yeniden dizilir.
   */
  const orderCards = (page: string, cards: ReturnType<typeof editorSectionsForPage>) => {
    const registryDefault = cards.filter((c) => c.registryId && !c.locked).map((c) => c.registryId!);
    const applied = applySectionOrder(registryDefault, orders[page]);
    const byRegistry = new Map(cards.filter((c) => c.registryId && !c.locked).map((c) => [c.registryId!, c]));
    let ptr = 0;
    return cards.map((c) => {
      if (c.registryId && !c.locked) {
        const id = applied[ptr++];
        return byRegistry.get(id) ?? c;
      }
      return c;
    });
  };

  const pages: EditorPageData[] = EDITOR_PAGES.map((pg) => {
    const raw = editorSectionsForPage(pg.key);
    const ordered = orderCards(pg.key, raw);
    const cards: EditorCard[] = ordered.map((sec) => {
      const fields = sec.contentKeys.map(fieldFor).filter((f): f is CardField => f !== null);
      const slots = sec.assetSlots.map((id) => slotMap.get(id)).filter((s): s is AssetSlot => Boolean(s));
      const card: EditorCard = { key: sec.key, title: sec.title, fields, slots };
      if (sec.registryId) card.registryId = sec.registryId;
      if (sec.locked) card.locked = true;
      // registryId bir GALLERY_DEFAULTS anahtarıysa → galeri yöneticisi verisi
      // (bu bölümün slotları galeriye taşınır, AssetSlotGrid gösterilmez).
      if (sec.registryId && Object.prototype.hasOwnProperty.call(GALLERY_DEFAULTS, sec.registryId)) {
        card.gallery = galleryDataFor(sec.registryId);
      }
      return card;
    });
    const route = PAGE_ROUTES[pg.key];
    return {
      id: pg.key,
      label: pg.label,
      cards,
      publicHref: route !== undefined ? `/${locale}${route}` : null,
    };
  });

  // Hiçbir düzenlenebilir metin kaybolmasın: editör haritasında yer almayan
  // (menü/teknik) anahtarlar tek "Diğer" sayfasında sabit bir kartta toplanır.
  const others = texts.filter((t) => !mappedKeys.has(t.key));
  if (others.length) {
    pages.push({
      id: "diger",
      label: "Diğer",
      description: "Otomatik sınıflandırılmamış yazılar (menü, teknik alanlar).",
      publicHref: null,
      cards: [
        {
          key: "other:unmapped",
          title: "Sınıflandırılmamış",
          locked: true,
          slots: [],
          fields: others.map((t) => {
            const value = t.values[locale] ?? "";
            return { key: t.key, value, ref: baseTr[t.key] ?? "", overridden: value !== (baseLoc[t.key] ?? "") && value.trim() !== "" };
          }),
        },
      ],
    });
  }

  const langs = routing.locales.map((l) => ({ code: l, flag: localeFlags[l], name: localeNames[l] }));
  const initialPageId = pages.some((p) => p.id === sp.sayfa) ? (sp.sayfa as string) : pages[0]?.id ?? "home";

  return (
    <div>
      <PageHeader
        eyebrow="Sitem"
        title="Site Editörü"
        description="Sitenin her bölümünü tek yerden düzenle: metin, görsel, sıra ve görünürlük bir arada. Üstten sayfa ve dil seç; bölüm kartlarını yukarıdan aşağıya gerçek site sırasında gör. Kaydedince sitede anında yayınlanır."
      />
      <ContentEditor
        pages={pages}
        locale={locale}
        langs={langs}
        initialPageId={initialPageId}
        saveAction={saveTexts}
        assetOverrides={assetOverrides}
        media={mediaRows}
        hiddenSections={hiddenSections}
        hiddenAssets={hiddenAssets}
        faqPanel={<FaqManager initial={faqExtras} locale={locale} langName={localeNames[locale]} />}
      />
    </div>
  );
}
