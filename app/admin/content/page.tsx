import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getEditableTexts, loadBaseFlat } from "@/lib/messages";
import { routing, localeNames, localeFlags, type Locale } from "@/i18n/routing";
import { requireAdmin } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { PageHeader, Section, Badge, LocationHint } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

const SEP = "|||";

async function saveTexts(formData: FormData) {
  "use server";
  const session = await requireAdmin();
  // Tüm locale'lerin varsayılanlarını yükle (karşılaştırma için).
  const bases: Record<string, Record<string, string>> = {};
  for (const l of routing.locales) bases[l] = await loadBaseFlat(l);

  for (const [field, raw] of formData.entries()) {
    if (!field.includes(SEP)) continue;
    const [key, locale] = field.split(SEP);
    const value = String(raw);
    const base = bases[locale]?.[key] ?? "";

    if (value.trim() === "" || value === base) {
      // Varsayılana eşit ya da boş -> override'ı kaldır.
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

export default async function ContentPage() {
  await requireAdmin();
  const texts = await getEditableTexts();

  // Namespace'e (ilk segment) göre grupla.
  const groups = new Map<string, typeof texts>();
  for (const t of texts) {
    const ns = t.key.split(".")[0];
    if (!groups.has(ns)) groups.set(ns, []);
    groups.get(ns)!.push(t);
  }

  const entries = [...groups.entries()];

  return (
    <div>
      <PageHeader
        eyebrow="İçerik & Sayfalar"
        title="Site Yazıları"
        description="Sitenin tüm yazıları — 5 dilde düzenle. Boş bıraktığın ya da varsayılana eşit alanlar için orijinal metin kullanılır. Kaydedince değişiklikler sitede anında yayınlanır."
      />

      <form action={saveTexts}>
        <LocationHint>
          Buradaki her yazı, sitenizin ilgili sayfasında ziyaretçilere görünür. Aşağıdaki başlıklar (menü, giriş, hakkında…) sitenin bölümlerini temsil eder.
        </LocationHint>

        <div className="mt-5 space-y-4">
          {entries.map(([ns, items]) => {
            const editedCount = items.filter((t) => t.overridden).length;
            return (
              <Section
                key={ns}
                icon="content"
                defaultOpen={false}
                title={ns}
                description={`${items.length} yazı${editedCount ? ` · ${editedCount} düzenlenmiş` : ""}`}
              >
                <div className="space-y-6">
                  {items.map((t) => (
                    <div
                      key={t.key}
                      className="border-b pb-5 last:border-0 last:pb-0"
                      style={{ borderColor: "rgb(var(--border))" }}
                    >
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <code
                          className="rounded px-1.5 py-0.5 text-xs"
                          style={{ background: "rgb(var(--muted))", color: "rgb(var(--muted-foreground))" }}
                        >
                          {t.key}
                        </code>
                        {t.overridden && <Badge tone="warn">düzenlendi</Badge>}
                      </div>
                      <div className="grid gap-2 lg:grid-cols-2">
                        {routing.locales.map((l: Locale) => (
                          <label key={l} className="block">
                            <span className="adm-muted mb-1 flex items-center gap-1 text-xs">
                              {localeFlags[l]} {localeNames[l]}
                            </span>
                            <textarea
                              name={`${t.key}${SEP}${l}`}
                              defaultValue={t.values[l]}
                              rows={t.values[l] && t.values[l].length > 60 ? 3 : 1}
                              className="adm-textarea"
                              style={{ minHeight: "44px" }}
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            );
          })}
        </div>

        {/* Yapışkan kaydet çubuğu — telefonda her zaman ulaşılabilir */}
        <div className="adm-sticky-save mt-6">
          <div className="flex items-center justify-between gap-3">
            <p className="adm-muted hidden text-[13px] sm:block">
              Değişiklikler kaydedince sitede anında görünür.
            </p>
            <button className="adm-btn adm-btn-primary w-full sm:w-auto">Tümünü kaydet</button>
          </div>
        </div>
      </form>
    </div>
  );
}
