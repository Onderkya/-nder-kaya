import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getPageForAdmin } from "@/lib/cms";
import { routing, localeFlags, localeNames, type Locale } from "@/i18n/routing";
import { BLOCK_DEFS, blockDef, localizedFieldDefs, propDefs } from "@/lib/cms-blocks";
import { updatePageMeta, deletePage, addBlock, moveBlock, deleteBlock, updateBlock } from "../actions";
import { ImageField } from "./image-field";
import { BlockReorder } from "./block-reorder";

export const dynamic = "force-dynamic";

export default async function PageEditor({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ pl?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const { pl } = await searchParams;
  const page = await getPageForAdmin(id);
  if (!page) notFound();

  const previewLocale = (routing.locales as readonly string[]).includes(pl || "") ? pl! : "tr";
  const media = await prisma.media.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
  const mediaUrls = media.map((m) => m.url);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <Link href="/admin/pages" className="text-sm text-cyan-700">← Sayfalar</Link>
          <h1 className="mt-1 text-2xl font-bold">
            <span className="font-mono text-base text-slate-400">/{page.slug}</span> {page.title ? `· ${page.title}` : ""}
          </h1>
        </div>
      </div>

      {/* Sayfa ayarları */}
      <section className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
        <form action={updatePageMeta} className="flex flex-wrap items-end gap-4">
          <input type="hidden" name="id" value={page.id} />
          <label className="block">
            <span className="mb-1 block text-xs text-slate-500">Başlık (sekme/SEO)</span>
            <input name="title" defaultValue={page.title ?? ""} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="published" defaultChecked={page.published} /> Yayında
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
            <input type="checkbox" name="managed" defaultChecked={page.managed} /> CMS ile yayınla (bu rotayı bloklarla göster)
          </label>
          <button className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white">Kaydet</button>
        </form>
        {!page.managed && (
          <p className="mt-3 text-xs text-amber-700">
            “CMS ile yayınla” kapalı → <b>/{page.slug}</b> mevcut kodlu tasarımıyla görünür. Blokları
            hazırlayıp hazır olunca bu kutuyu işaretleyin.
          </p>
        )}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr,minmax(380px,560px)]">
        {/* Sol: bloklar */}
        <div className="space-y-5">
          <BlockReorder pageId={page.id} items={page.blocks.map((b, idx) => {
            const props = (b.props as Record<string, unknown>) ?? {};
            const fields = localizedFieldDefs(b.type, props);
            const pdefs = propDefs(b.type, props);
            // text[field][locale]
            const textMap: Record<string, Record<string, string>> = {};
            for (const tr of b.texts) (textMap[tr.field] ??= {})[tr.locale] = tr.value;
            const def = blockDef(b.type);

            return { id: b.id, node: (
              <section key={b.id} className="rounded-2xl bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-cyan-800">{def?.label ?? b.type} <span className="font-normal text-slate-400">#{idx + 1}</span></h3>
                  <div className="flex items-center gap-1">
                    <form action={moveBlock}><input type="hidden" name="blockId" value={b.id} /><input type="hidden" name="dir" value="up" /><button className="rounded border border-slate-300 px-2 py-1 text-xs" disabled={idx === 0}>↑</button></form>
                    <form action={moveBlock}><input type="hidden" name="blockId" value={b.id} /><input type="hidden" name="dir" value="down" /><button className="rounded border border-slate-300 px-2 py-1 text-xs" disabled={idx === page.blocks.length - 1}>↓</button></form>
                    <form action={deleteBlock}><input type="hidden" name="blockId" value={b.id} /><button className="rounded border border-red-200 px-2 py-1 text-xs text-red-600">Sil</button></form>
                  </div>
                </div>

                <form action={updateBlock} className="space-y-4">
                  <input type="hidden" name="blockId" value={b.id} />
                  <input type="hidden" name="type" value={b.type} />

                  {def?.custom && (
                    <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
                      ★ Hazır premium bölüm — görünümü mevcut sitedeki ile birebir aynıdır. İçindeki
                      metinler <b>Site İçeriği</b> sayfasından 5 dilde düzenlenir; burada sadece ekleyip
                      sıralarsın.
                    </p>
                  )}

                  {/* Yapılandırma (props) */}
                  {pdefs.length > 0 && (
                    <div className="flex flex-wrap gap-3 rounded-xl bg-slate-50 p-3">
                      {pdefs.map((p) => {
                        const val = props[p.name];
                        if (p.kind === "bool")
                          return (
                            <label key={p.name} className="flex items-center gap-2 text-xs text-slate-600">
                              <input type="checkbox" name={`p:${p.name}`} defaultChecked={!!val && val !== "false"} /> {p.label}
                            </label>
                          );
                        if (p.kind === "select")
                          return (
                            <label key={p.name} className="text-xs text-slate-600">
                              <span className="mr-1">{p.label}</span>
                              <select name={`p:${p.name}`} defaultValue={(val as string) ?? p.default ?? ""} className="rounded border border-slate-300 px-2 py-1 text-xs">
                                {(p.options ?? []).map((o) => <option key={o} value={o}>{o}</option>)}
                              </select>
                            </label>
                          );
                        if (p.kind === "image")
                          return (
                            <label key={p.name} className="text-xs text-slate-600">
                              <span className="mb-1 block">{p.label}</span>
                              <ImageField name={`p:${p.name}`} defaultValue={(val as string) ?? ""} media={mediaUrls} />
                            </label>
                          );
                        return (
                          <label key={p.name} className="text-xs text-slate-600">
                            <span className="mb-1 block">{p.label}</span>
                            <input
                              name={`p:${p.name}`}
                              type={p.kind === "number" ? "number" : "text"}
                              defaultValue={(val as string) ?? p.default ?? ""}
                              className="w-56 rounded border border-slate-300 px-2 py-1 text-xs"
                            />
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {/* Yerelleştirilen metin alanları */}
                  {fields.map((f) => (
                    <div key={f.name}>
                      <div className="mb-1 text-xs font-medium text-slate-500">{f.label}</div>
                      <div className="grid gap-2 lg:grid-cols-2">
                        {routing.locales.map((l: Locale) => (
                          <label key={l} className="block">
                            <span className="mb-0.5 block text-[11px] text-slate-400">{localeFlags[l]} {localeNames[l]}</span>
                            <textarea
                              name={`t:${f.name}:${l}`}
                              defaultValue={textMap[f.name]?.[l] ?? ""}
                              rows={f.kind === "textarea" ? 3 : 1}
                              className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2 text-sm"
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}

                  {!def?.custom && <button className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white">Bloğu kaydet</button>}
                </form>
              </section>
            ) };
          })} />

          {page.blocks.length === 0 && (
            <p className="rounded-2xl bg-white p-6 text-center text-sm text-slate-400 shadow-sm">Henüz blok yok. Aşağıdan ekleyin.</p>
          )}

          {/* Blok ekle */}
          <section className="rounded-2xl border-2 border-dashed border-slate-300 p-5">
            <form action={addBlock} className="flex flex-wrap items-end gap-3">
              <input type="hidden" name="pageId" value={page.id} />
              <label className="block">
                <span className="mb-1 block text-xs text-slate-500">Blok tipi</span>
                <select name="type" className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
                  {BLOCK_DEFS.map((d) => <option key={d.type} value={d.type}>{d.label}</option>)}
                </select>
              </label>
              <button className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white">+ Blok ekle</button>
            </form>
          </section>

          {/* Tehlikeli bölge */}
          <form action={deletePage} className="pt-2">
            <input type="hidden" name="id" value={page.id} />
            <button className="text-xs text-red-500 hover:underline">Bu sayfayı sil</button>
          </form>
        </div>

        {/* Sağ: canlı önizleme */}
        <div className="xl:sticky xl:top-4 xl:self-start">
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex gap-1">
                {routing.locales.map((l) => (
                  <Link key={l} href={`/admin/pages/${page.id}?pl=${l}`} className={`rounded px-2 py-1 text-xs font-medium ${previewLocale === l ? "bg-cyan-600 text-white" : "bg-slate-100 text-slate-600"}`}>{l}</Link>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/admin/pages/${page.id}?pl=${previewLocale}`} className="text-xs text-slate-500 hover:underline">↻ Yenile</Link>
                <a href={`/${previewLocale}/${page.slug}`} target="_blank" rel="noopener" className="text-xs text-cyan-700 hover:underline">Yeni sekme ↗</a>
              </div>
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-200" style={{ height: "70vh" }}>
              <iframe key={previewLocale} title="önizleme" src={`/${previewLocale}/${page.slug}`} className="h-full w-full" />
            </div>
            {!page.managed && <p className="mt-2 text-[11px] text-slate-400">Not: “CMS ile yayınla” kapalıyken önizleme mevcut kodlu tasarımı gösterir.</p>}
          </div>
        </div>
      </div>

      {/* Görsel URL otomatik tamamlama (yüklenen medya) */}
      <datalist id="cms-media">
        {mediaUrls.map((u) => <option key={u} value={u} />)}
      </datalist>
    </div>
  );
}
