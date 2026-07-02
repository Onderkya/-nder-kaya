import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { getMergedMessages, flatten } from "@/lib/messages";
import { getAssetMap } from "@/lib/assets";
import { getTourCfgs, CODED_TOURS, pickL10n, type TourCfg, type TourStepCfg, type L10n } from "@/lib/tours";
import { DEFAULT_STEPS, DEFAULT_INCLUDED } from "@/lib/tour-defaults";
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

  // Tüm locale'lerin düzleştirilmiş mesajları (prefill + placeholder için).
  const flatByLocale: Record<string, Record<string, string>> = {};
  for (const l of routing.locales) flatByLocale[l] = flatten((await getMergedMessages(l)) as never);

  // Bir i18n anahtarını 4 dilde toplayıp L10n döndürür.
  const l10nOf = (i18nKey: string): L10n =>
    Object.fromEntries(routing.locales.map((l) => [l, flatByLocale[l][i18nKey] ?? ""]));

  // Kodlu turun dil bazlı varsayılanları (placeholder'lar için).
  let defaults: TourDefaults | null = null;
  // Kodlu tur prefill: DEFAULT_STEPS + çeviriler → editöre hazır L10n adımları.
  let prefillSteps: TourStepCfg[] | null = null;
  let prefillIncluded: { icon: string; label: L10n; active?: boolean }[] | null = null;
  if (coded) {
    const name: Record<string, string> = {};
    const aud: Record<string, string> = {};
    let loc = "";
    let img = DEF_IMG[key];
    const assets = await getAssetMap();
    img = assets[`route.${key}.image`] || img;
    for (const l of routing.locales) {
      name[l] = flatByLocale[l][`routes.${key}_name`] ?? "";
      aud[l] = flatByLocale[l][`routes.${coded.audKey}`] ?? "";
      if (l === "tr") loc = flatByLocale[l][`hotelsd.${coded.hotelKey}_loc`] ?? "";
    }
    defaults = { name, aud, days: coded.days, stars: coded.stars, hotel: coded.hotel, loc, img };

    prefillSteps = (DEFAULT_STEPS[key] ?? []).map((s) => ({
      day: s.day,
      icon: s.icon,
      active: true,
      t: l10nOf(`routes.${s.tKey}`),
      d: l10nOf(`routes.${s.dKey}`),
    }));
    prefillIncluded = DEFAULT_INCLUDED.map((i) => ({
      icon: i.icon,
      active: true,
      label: l10nOf(`routes.${i.labelKey}`),
    }));
  }

  const initial: TourCfg = isNew
    ? { key: `c${Date.now().toString(36)}`, custom: true, active: true, steps: [] }
    : existing ?? { key, active: true };

  // ÖNEMLİ: prefill'i initial.steps/included İÇİNE yazmıyoruz — override sahipliği
  // olduğu gibi kalsın (dokunulmayan kodlu tur kaydedilince çeviri anlık görüntüsü
  // override olarak yazılmasın diye). Prefill editöre AYRI prop olarak geçer; editör
  // yalnız gösterim için kullanır, kullanıcı dokunmadıkça kaydetmez.
  // Özel turlar için "Pakete dahil" öneri listesi (kodlu değilse prefill yoktu).
  if (!coded && prefillIncluded === null) {
    prefillIncluded = DEFAULT_INCLUDED.map((i) => ({ icon: i.icon, active: true, label: l10nOf(`routes.${i.labelKey}`) }));
  }

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
      <TourEditor initial={initial} defaults={defaults} langs={langs} media={media} isNew={isNew} prefillSteps={prefillSteps} prefillIncluded={prefillIncluded} />
    </div>
  );
}
