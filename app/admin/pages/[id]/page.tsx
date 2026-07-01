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
import { Card, Field, Badge } from "@/components/admin/ui";
import { Icon } from "@/components/admin/icons";

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
    <div className="space-y-6">
      {/* Başlık şeridi */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link href="/admin/pages" className="adm-muted inline-flex items-center gap-1 text-sm hover:opacity-80">
            <Icon name="chevron" size={16} className="rotate-90" /> Sayfalar
          </Link>
          <h1 className="adm-title mt-1 text-[1.9rem] sm:text-[2.3rem]">
            <span className="font-mono text-base" style={{ color: "rgb(var(--muted-foreground))" }}>/{page.slug}</span>{" "}
            {page.title ? `· ${page.title}` : ""}
          </h1>
        </div>
        <a
          href={`/${previewLocale}/${page.slug}`}
          target="_blank"
          rel="noopener"
          className="adm-btn adm-btn-ghost adm-btn-sm"
        >
          <Icon name="external" size={15} /> Değişikliği sitede gör
        </a>
      </div>

      {/* Sayfa ayarları */}
      <Card>
        <div className="mb-4 flex items-center gap-2">
          <Icon name="settings" size={18} style={{ color: "rgb(var(--primary))" }} />
          <h2 className="font-semibold text-[15px]" style={{ color: "rgb(var(--foreground))" }}>Sayfa ayarları</h2>
        </div>
        <form action={updatePageMeta} className="grid gap-4 sm:grid-cols-2 sm:items-start">
          <input type="hidden" name="id" value={page.id} />
          <Field label="Başlık (sekme/SEO)" help="Tarayıcı sekmesinde ve arama sonuçlarında görünür." htmlFor="page-title" className="sm:col-span-2">
            <input id="page-title" name="title" defaultValue={page.title ?? ""} className="adm-input" />
          </Field>
          <label className="flex items-center gap-2.5 text-sm" style={{ color: "rgb(var(--foreground))" }}>
            <input type="checkbox" name="published" defaultChecked={page.published} /> Yayında
          </label>
          <label className="flex items-center gap-2.5 text-sm font-semibold" style={{ color: "rgb(var(--primary))" }}>
            <input type="checkbox" name="managed" defaultChecked={page.managed} /> CMS ile yayınla (bu rotayı bloklarla göster)
          </label>
          <div className="sm:col-span-2">
            <button className="adm-btn adm-btn-primary">Kaydet</button>
          </div>
        </form>
        {!page.managed && (
          <p className="adm-help mt-4 rounded-xl p-3" style={{ background: "rgb(var(--gold) / 0.10)", color: "rgb(var(--gold))" }}>
            “CMS ile yayınla” kapalı → <b>/{page.slug}</b> mevcut kodlu tasarımıyla görünür. Blokları hazırlayıp hazır olunca bu kutuyu işaretleyin.
          </p>
        )}
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1fr,minmax(380px,560px)]">
        {/* Sol: bloklar */}
        <div className="space-y-5">
          <h2 className="adm-eyebrow">Bölümler</h2>
          <BlockReorder pageId={page.id} items={page.blocks.map((b, idx) => {
            const props = (b.props as Record<string, unknown>) ?? {};
            const fields = localizedFieldDefs(b.type, props);
            const pdefs = propDefs(b.type, props);
            // text[field][locale]
            const textMap: Record<string, Record<string, string>> = {};
            for (const tr of b.texts) (textMap[tr.field] ??= {})[tr.locale] = tr.value;
            const def = blockDef(b.type);

            return { id: b.id, node: (
              <Card key={b.id}>
                <div className="mb-4 flex items-center justify-between gap-2">
                  <h3 className="flex items-center gap-2 text-sm font-bold" style={{ color: "rgb(var(--foreground))" }}>
                    {def?.label ?? b.type}
                    <span className="font-normal" style={{ color: "rgb(var(--muted-foreground))" }}>#{idx + 1}</span>
                  </h3>
                  <div className="flex items-center gap-1">
                    <form action={moveBlock}><input type="hidden" name="blockId" value={b.id} /><input type="hidden" name="dir" value="up" /><button className="adm-btn adm-btn-ghost adm-btn-sm" disabled={idx === 0} title="Yukarı">↑</button></form>
                    <form action={moveBlock}><input type="hidden" name="blockId" value={b.id} /><input type="hidden" name="dir" value="down" /><button className="adm-btn adm-btn-ghost adm-btn-sm" disabled={idx === page.blocks.length - 1} title="Aşağı">↓</button></form>
                    <form action={deleteBlock}><input type="hidden" name="blockId" value={b.id} /><button className="adm-btn adm-btn-danger adm-btn-sm">Sil</button></form>
                  </div>
                </div>

                <form action={updateBlock} className="space-y-4">
                  <input type="hidden" name="blockId" value={b.id} />
                  <input type="hidden" name="type" value={b.type} />

                  {def?.custom && (
                    <p className="adm-help rounded-xl p-3" style={{ background: "rgb(var(--gold) / 0.10)", color: "rgb(var(--gold))" }}>
                      ★ Hazır premium bölüm — görünümü mevcut sitedeki ile birebir aynıdır. İçindeki metinler <b>Site İçeriği</b> sayfasından 5 dilde düzenlenir; burada sadece ekleyip sıralarsın.
                    </p>
                  )}

                  {/* Yapılandırma (props) */}
                  {pdefs.length > 0 && (
                    <div className="flex flex-wrap gap-3 rounded-xl p-3" style={{ background: "rgb(var(--muted))" }}>
                      {pdefs.map((p) => {
                        const val = props[p.name];
                        if (p.kind === "bool")
                          return (
                            <label key={p.name} className="flex items-center gap-2 text-xs" style={{ color: "rgb(var(--foreground))" }}>
                              <input type="checkbox" name={`p:${p.name}`} defaultChecked={!!val && val !== "false"} /> {p.label}
                            </label>
                          );
                        if (p.kind === "select")
                          return (
                            <label key={p.name} className="text-xs" style={{ color: "rgb(var(--muted-foreground))" }}>
                              <span className="adm-label">{p.label}</span>
                              <select name={`p:${p.name}`} defaultValue={(val as string) ?? p.default ?? ""} className="adm-select">
                                {(p.options ?? []).map((o) => <option key={o} value={o}>{o}</option>)}
                              </select>
                            </label>
                          );
                        if (p.kind === "image")
                          return (
                            <label key={p.name} className="w-full text-xs" style={{ color: "rgb(var(--muted-foreground))" }}>
                              <span className="adm-label">{p.label}</span>
                              <ImageField name={`p:${p.name}`} defaultValue={(val as string) ?? ""} media={mediaUrls} />
                            </label>
                          );
                        return (
                          <label key={p.name} className="text-xs" style={{ color: "rgb(var(--muted-foreground))" }}>
                            <span className="adm-label">{p.label}</span>
                            <input
                              name={`p:${p.name}`}
                              type={p.kind === "number" ? "number" : "text"}
                              defaultValue={(val as string) ?? p.default ?? ""}
                              className="adm-input"
                            />
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {/* Yerelleştirilen metin alanları */}
                  {fields.map((f) => (
                    <div key={f.name}>
                      <div className="adm-label">{f.label}</div>
                      <div className="grid gap-2 lg:grid-cols-2">
                        {routing.locales.map((l: Locale) => (
                          <label key={l} className="block">
                            <span className="adm-muted mb-0.5 block text-[11px]">{localeFlags[l]} {localeNames[l]}</span>
                            <textarea
                              name={`t:${f.name}:${l}`}
                              defaultValue={textMap[f.name]?.[l] ?? ""}
                              rows={f.kind === "textarea" ? 3 : 1}
                              className="adm-textarea"
                              style={{ minHeight: "44px" }}
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}

                  {!def?.custom && <button className="adm-btn adm-btn-primary">Bloğu kaydet</button>}
                </form>
              </Card>
            ) };
          })} />

          {page.blocks.length === 0 && (
            <Card>
              <p className="adm-muted py-6 text-center text-sm">Henüz blok yok. Aşağıdan ekleyin.</p>
            </Card>
          )}

          {/* Blok ekle */}
          <div className="rounded-[1.25rem] border-2 border-dashed p-5" style={{ borderColor: "rgb(var(--border))" }}>
            <form action={addBlock} className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <input type="hidden" name="pageId" value={page.id} />
              <Field label="Blok tipi" className="flex-1">
                <select name="type" className="adm-select">
                  {BLOCK_DEFS.map((d) => <option key={d.type} value={d.type}>{d.label}</option>)}
                </select>
              </Field>
              <button className="adm-btn adm-btn-primary">
                <Icon name="plus" size={15} /> Blok ekle
              </button>
            </form>
          </div>

          {/* Tehlikeli bölge */}
          <form action={deletePage} className="pt-2">
            <input type="hidden" name="id" value={page.id} />
            <button className="text-xs hover:underline" style={{ color: "rgb(var(--accent))" }}>Bu sayfayı sil</button>
          </form>
        </div>

        {/* Sağ: canlı önizleme */}
        <div className="xl:sticky xl:top-4 xl:self-start">
          <Card pad={false} className="p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex flex-wrap gap-1">
                {routing.locales.map((l) => (
                  <Link
                    key={l}
                    href={`/admin/pages/${page.id}?pl=${l}`}
                    className={`adm-btn adm-btn-sm ${previewLocale === l ? "adm-btn-primary" : "adm-btn-ghost"}`}
                  >
                    {l}
                  </Link>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/admin/pages/${page.id}?pl=${previewLocale}`} className="adm-muted text-xs hover:underline">↻ Yenile</Link>
                <a href={`/${previewLocale}/${page.slug}`} target="_blank" rel="noopener" className="text-xs hover:underline" style={{ color: "rgb(var(--primary))" }}>Yeni sekmede aç ↗</a>
              </div>
            </div>
            <div className="overflow-hidden rounded-xl" style={{ height: "70vh", border: "1px solid rgb(var(--border))" }}>
              <iframe key={previewLocale} title="önizleme" src={`/${previewLocale}/${page.slug}`} className="h-full w-full" />
            </div>
            {!page.managed && <p className="adm-muted mt-2 text-[11px]">Not: “CMS ile yayınla” kapalıyken önizleme mevcut kodlu tasarımı gösterir.</p>}
          </Card>
        </div>
      </div>

      {/* Görsel URL otomatik tamamlama (yüklenen medya) */}
      <datalist id="cms-media">
        {mediaUrls.map((u) => <option key={u} value={u} />)}
      </datalist>
    </div>
  );
}
