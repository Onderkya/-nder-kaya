import { requireAdmin } from "@/lib/auth";
import { getMergedMessages, flatten } from "@/lib/messages";
import { getAssetMap } from "@/lib/assets";
import { getTourCfgs, CODED_TOURS, pickL10n, tourOrder } from "@/lib/tours";
import { PageHeader } from "@/components/admin/ui";
import { ToursList, type TourRow } from "@/components/admin/tours-list";

export const dynamic = "force-dynamic";

// Kodlu turların varsayılan görselleri (asset override yoksa).
const DEF_IMG: Record<string, string> = {
  r1: "/images/hotels/lara-barut.jpg",
  r2: "/images/hotels/cullinan-belek.jpg",
  r3: "/images/hotels/ng-phaselis-bay.jpg",
  r4: "/images/hotels/land-of-legends-kingdom.jpg",
  r5: "/images/hotels/maxx-royal-kemer.jpg",
};

export default async function ToursPage() {
  await requireAdmin();
  const [cfgs, msgs, assets] = await Promise.all([getTourCfgs(), getMergedMessages("tr"), getAssetMap()]);
  const flat = flatten(msgs as never);
  const cfgOf = new Map(cfgs.map((c) => [c.key, c]));

  const coded: TourRow[] = CODED_TOURS.map((c) => {
    const cfg = cfgOf.get(c.key);
    return {
      key: c.key,
      name: pickL10n(cfg?.name, "tr") || flat[`routes.${c.key}_name`] || c.key,
      img: cfg?.img?.trim() || assets[`route.${c.key}.image`] || DEF_IMG[c.key],
      days: cfg?.days ?? c.days,
      stars: cfg?.stars ?? c.stars,
      aud: pickL10n(cfg?.aud, "tr") || flat[`routes.${c.audKey}`] || "",
      active: cfg?.active !== false,
      custom: false,
    };
  });

  const customs: TourRow[] = cfgs
    .filter((c) => c.custom)
    .map((c) => ({
      key: c.key,
      name: pickL10n(c.name, "tr") || "(isimsiz tur)",
      img: c.img?.trim() || "/images/kaputas.jpg",
      days: c.days ?? 5,
      stars: c.stars ?? 5,
      aud: pickL10n(c.aud, "tr"),
      active: c.active !== false,
      custom: true,
    }));

  const tours = [...coded, ...customs].sort((a, b) => tourOrder(cfgOf.get(a.key), a.key) - tourOrder(cfgOf.get(b.key), b.key));

  return (
    <div>
      <PageHeader
        eyebrow="Sitem"
        title="Turlar"
        description="Anasayfa ve Antalya Danışmanlık'taki tur paketleri. Sürükle yerine ← → ile sırala, anahtar ile aç/kapat, karta tıklayıp her şeyini düzenle — foto, isim, gün, otel. Yeni tur da ekleyebilirsin."
      />
      <ToursList tours={tours} />
    </div>
  );
}
