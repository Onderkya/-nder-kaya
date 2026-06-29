import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { getManagedPage } from "@/lib/cms";
import { BlockRenderer } from "@/components/cms/block-renderer";

/**
 * CMS ile oluşturulmuş YENİ sayfalar için dinamik rota. Mevcut statik rotalar
 * (about, antalya, lessons...) bu dinamik segmentten önce gelir — yani burası
 * yalnızca eşleşmeyen slug'ları yakalar. Yönetilen+yayınlanmış bir sayfa yoksa 404.
 */
export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const page = await getManagedPage(slug, locale);
  if (!page) return {};
  return { title: page.title ?? undefined };
}

export default async function CmsDynamicPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const page = await getManagedPage(slug, locale);
  if (!page) notFound();
  return <BlockRenderer page={page} locale={locale} />;
}
