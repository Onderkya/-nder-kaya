import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { getMergedMessages, flatten } from "@/lib/messages";
import { getAssetMap } from "@/lib/assets";
import { getTourCfgs, CODED_TOURS, pickL10n, type TourCfg } from "@/lib/tours";
import { routing, localeNames, localeFlags } from "@/i18n/routing";
import { PageHeader } from "@/components/admin/ui";
import { TourEditor, type TourDefaults } from "@/components/admin/tour-editor";

export const dynamic = "force-dynamic";

const DEF_IMG: Record<string, string> = {
  r1: "/images/hotels/lara-barut.jpg",
  r2: "/images/hotels/cullinan-belek.jpg",
  r3: "/images/hotels/ng-phaselis-bay.jpg",
  r4: "/images/hotels/land-of-legends-kingdom.jpg",
  r5: "/images/hotels/maxx-royal-kemer.jpg",
};

export default async function TourEditPage({ params }: { params: Promise<{ key: string }> }) {
  await requireAdmin();
  const { key } = await params;

  const cfgs = await getTourCfgs();
  const coded = CODED_TOURS.find((c) => c.key === key);
  const existing = cfgs.find((c) => c.key === key);
  const isNew = key === "yeni";

  if (!isNew && !coded && !existing) notFound();

  // Kodlu turun dil bazlı varsayılanları (placeholder'lar için).
  let defaults: TourDefaults | null = null;
  if (coded) {
    const name: Record<string, string> = {};
    const aud: Record<string, string> = {};
    let loc = "";
    let img = DEF_IMG[key];
    const assets = await getAssetMap();
    img = assets[`route.${key}.image`] || img;
    for (const l of routing.locales) {
      const flat = flatten((await getMergedMessages(l)) as never);
      name[l] = flat[`routes.${key}_name`] ?? "";
      aud[l] = flat[`routes.${coded.audKey}`] ?? "";
      if (l === "tr") loc = flat[`hotelsd.${coded.hotelKey}_loc`] ?? "";
    }
    defaults = { name, aud, days: coded.days, stars: coded.stars, hotel: coded.hotel, loc, img };
  }

  const initial: TourCfg = isNew
    ? { key: `c${Date.now().toString(36)}`, custom: true, active: true, steps: [] }
    : existing ?? { key, active: true };

  const media = await prisma.media
    .findMany({ orderBy: { createdAt: "desc" }, take: 60, select: { url: true, alt: true } })
    .catch(() => []);

  const langs = routing.locales.map((l) => ({ code: l, flag: localeFlags[l], name: localeNames[l] }));
  const title = isNew ? "Yeni tur" : pickL10n(existing?.name, "tr") || defaults?.name.tr || key;

  return (
    <div>
      <PageHeader eyebrow="Sitem · Turlar" title={title} description={coded ? "Kodlu tur — boş bıraktığın alanlar varsayılan değerle görünür." : "Özel tur — tüm alanlar sana ait."}>
        <Link href="/admin/tours" className="adm-btn adm-btn-ghost adm-btn-sm">← Turlara dön</Link>
      </PageHeader>
      <TourEditor initial={initial} defaults={defaults} langs={langs} media={media} isNew={isNew} />
    </div>
  );
}
