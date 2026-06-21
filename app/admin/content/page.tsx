import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getEditableTexts, loadBaseFlat } from "@/lib/messages";
import { routing, localeNames, localeFlags, type Locale } from "@/i18n/routing";

export const dynamic = "force-dynamic";

const SEP = "|||";

async function saveTexts(formData: FormData) {
  "use server";
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
  revalidatePath("/admin/content");
  revalidatePath("/", "layout");
}

export default async function ContentPage() {
  const texts = await getEditableTexts();

  // Namespace'e (ilk segment) göre grupla.
  const groups = new Map<string, typeof texts>();
  for (const t of texts) {
    const ns = t.key.split(".")[0];
    if (!groups.has(ns)) groups.set(ns, []);
    groups.get(ns)!.push(t);
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Site İçeriği</h1>
        <p className="mt-1 text-sm text-slate-500">
          Sitedeki tüm metinleri 5 dilde buradan düzenleyin. Boş bıraktığınız ya
          da varsayılana eşit alanlar için orijinal metin kullanılır. Kaydedince
          değişiklikler sitede anında yayınlanır.
        </p>
      </div>

      <form action={saveTexts} className="space-y-8">
        <div className="sticky top-0 z-10 -mx-8 mb-2 border-b border-slate-200 bg-slate-100 px-8 py-3">
          <button className="rounded-lg bg-cyan-600 px-5 py-2 text-sm font-semibold text-white">
            Tümünü kaydet
          </button>
        </div>

        {[...groups.entries()].map(([ns, items]) => (
          <section key={ns} className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold capitalize text-cyan-800">{ns}</h2>
            <div className="space-y-6">
              {items.map((t) => (
                <div key={t.key} className="border-b border-slate-100 pb-5 last:border-0 last:pb-0">
                  <div className="mb-2 flex items-center gap-2">
                    <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">{t.key}</code>
                    {t.overridden && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                        düzenlendi
                      </span>
                    )}
                  </div>
                  <div className="grid gap-2 lg:grid-cols-2">
                    {routing.locales.map((l: Locale) => (
                      <label key={l} className="block">
                        <span className="mb-1 flex items-center gap-1 text-xs text-slate-500">
                          {localeFlags[l]} {localeNames[l]}
                        </span>
                        <textarea
                          name={`${t.key}${SEP}${l}`}
                          defaultValue={t.values[l]}
                          rows={t.values[l] && t.values[l].length > 60 ? 3 : 1}
                          className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        <div className="pb-10">
          <button className="rounded-lg bg-cyan-600 px-5 py-2 text-sm font-semibold text-white">
            Tümünü kaydet
          </button>
        </div>
      </form>
    </div>
  );
}
