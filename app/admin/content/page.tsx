import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getEditableTexts, loadBaseFlat } from "@/lib/messages";
import { routing, localeNames, localeFlags, type Locale } from "@/i18n/routing";
import { requireAdmin } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { PageHeader } from "@/components/admin/ui";
import { ContentEditor, type EditPage } from "@/components/admin/content-editor";
import { CONTENT_PAGES } from "@/lib/content-map";
import { ASSET_SLOTS, type AssetSlot } from "@/lib/asset-slots";
import { getAssetMap } from "@/lib/assets";
import { getFaqExtras } from "@/lib/faq";
import { FaqManager } from "@/components/admin/faq-manager";
import { getHiddenSections } from "@/lib/sections";
import { SECTIONS, type SectionDef } from "@/lib/section-registry";

export const dynamic = "force-dynamic";

const SEP = "|||";

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
  const hiddenSet = await getHiddenSections();
  const hiddenSections = [...hiddenSet];
  const sectionsByPage: Record<string, SectionDef[]> = {};
  for (const s of SECTIONS) (sectionsByPage[s.page] ??= []).push(s);
  const map = new Map(texts.map((t) => [t.key, t]));

  // Görsel/video slotlarını sayfaya göre grupla.
  const assetsByPage: Record<string, AssetSlot[]> = {};
  for (const s of ASSET_SLOTS) (assetsByPage[s.page] ??= []).push(s);

  const mapped = new Set<string>();
  const pages: EditPage[] = CONTENT_PAGES.map((pg) => ({
    id: pg.id,
    label: pg.label,
    description: pg.description,
    sections: pg.sections.map((sec) => ({
      title: sec.title,
      help: sec.help,
      fields: sec.keys
        .filter((k) => map.has(k))
        .map((k) => {
          mapped.add(k);
          const t = map.get(k)!;
          const value = t.values[locale] ?? "";
          return { key: k, value, ref: baseTr[k] ?? "", overridden: value !== (baseLoc[k] ?? "") && value.trim() !== "" };
        }),
    })),
  }));

  const others = texts.filter((t) => !mapped.has(t.key));
  if (others.length) {
    pages.push({
      id: "diger",
      label: "Diğer",
      description: "Otomatik sınıflandırılmamış yazılar (menü, teknik alanlar).",
      sections: [
        {
          title: "Sınıflandırılmamış",
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
        title="Site İçeriği"
        description="Sitenin yazılarını gerçek sayfalara göre düzenle. Üstten bir sayfa ve bir dil seç; o sayfanın bölümlerini yukarıdan aşağıya gör. Kaydedince sitede anında yayınlanır."
      />
      <ContentEditor
        pages={pages}
        locale={locale}
        langs={langs}
        initialPageId={initialPageId}
        saveAction={saveTexts}
        assetsByPage={assetsByPage}
        assetOverrides={assetOverrides}
        media={mediaRows}
        faqPanel={<FaqManager initial={faqExtras} locale={locale} langName={localeNames[locale]} />}
        sectionsByPage={sectionsByPage}
        hiddenSections={hiddenSections}
      />
    </div>
  );
}
