import { prisma } from "./db";
import { routing } from "@/i18n/routing";

/**
 * CMS — genel blok motoru (opt-in). Bir Page `managed && published` ise o rota
 * bloklarla render edilir; aksi halde mevcut kodlu (premium) tasarım çalışır.
 * Bloklar doğrudan sayfaya bağlıdır; yerelleştirilen metin Translation'da,
 * yerelleştirilmeyen ayar (görsel url, href, hizalama, sayı) props'tadır.
 */

export type CmsBlock = {
  id: string;
  type: string;
  props: Record<string, unknown>;
  media: string | null;
  /** field -> istenen locale için çözülmüş değer (fallback: en → ilk) */
  text: Record<string, string>;
};

export type CmsPage = {
  id: string;
  slug: string;
  title: string | null;
  blocks: CmsBlock[];
};

type RawText = { field: string; locale: string; value: string };

function resolveTexts(texts: RawText[], locale: string): Record<string, string> {
  const byField: Record<string, Record<string, string>> = {};
  for (const t of texts) {
    (byField[t.field] ??= {})[t.locale] = t.value;
  }
  const out: Record<string, string> = {};
  for (const [field, locales] of Object.entries(byField)) {
    out[field] = locales[locale] ?? locales.en ?? Object.values(locales)[0] ?? "";
  }
  return out;
}

/** Public render: yalnızca yayınlanmış + yönetilen sayfayı döndürür, yoksa null. */
export async function getManagedPage(slug: string, locale: string): Promise<CmsPage | null> {
  try {
    const page = await prisma.page.findFirst({
      where: { slug, managed: true, published: true },
      include: { blocks: { orderBy: { order: "asc" }, include: { media: true, texts: true } } },
    });
    if (!page || page.blocks.length === 0) return null;
    return {
      id: page.id,
      slug: page.slug,
      title: page.title,
      blocks: page.blocks.map((b) => ({
        id: b.id,
        type: b.type,
        props: (b.props as Record<string, unknown>) ?? {},
        media: b.media?.url ?? null,
        text: resolveTexts(b.texts, locale),
      })),
    };
  } catch {
    // DB erişilemezse (örn. build anı) mevcut tasarıma düş.
    return null;
  }
}

/** Admin listesi: tüm sayfalar + blok sayısı. */
export async function listPages() {
  return prisma.page.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { blocks: true } } },
  });
}

/** Admin editörü: tek sayfa, blokları + TÜM dillerdeki ham çevirilerle. */
export async function getPageForAdmin(id: string) {
  return prisma.page.findUnique({
    where: { id },
    include: { blocks: { orderBy: { order: "asc" }, include: { media: true, texts: true } } },
  });
}

export const LOCALES = routing.locales;
