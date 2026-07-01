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
import { PageHeader, Card, Field, Badge } from "@/components/admin/ui";
import { Icon } from "@/components/admin/icons";

export const dynamic = "force-dynamic";

/** Altın dikey çubuk + editoryal başlık — bölüm başlığı deseni. */
function SectionHead({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-3">
        <span className="h-7 w-1.5 rounded-full" style={{ background: "rgb(var(--gold))" }} />
        <h3 className="adm-section-title">{title}</h3>
      </div>
      {hint ? <p className="adm-help ml-[18px] mt-1">{hint}</p> : null}
    </div>
  );
}

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
      <PageHeader
        eyebrow="İçerik & Sayfalar"
        title={page.title ? page.title : `/${page.slug}`}
        description={`Bu sayfayı bölüm bölüm düzenleyin. Rota: /${page.slug}`}
      >
        <Link href="/admin/pages" className="adm-btn adm-btn-ghost adm-btn-sm">
          <Icon name="chevron" size={15} className="rotate-90" /> Sayfalar
        </Link>
        <a
          href={`/${previewLocale}/${page.slug}`}
          target="_blank"
          rel="noopener"
          className="adm-btn adm-btn-ghost adm-btn-sm"
        >
          <Icon name="external" size={15} /> Değişikliği sitede gör
        </a>
      </PageHeader>

      {/* Sayfa ayarları */}
      <Card>
        <SectionHead title="Sayfa ayarları" hint="Başlık, yayın durumu ve CMS modu bu bölümden yönetilir." />
        <form action={updatePageMeta} className="grid gap-5 sm:grid-cols-2 sm:items-start">
          <input type="hidden" name="id" value={page.id} />
          <Field label="Başlık (sekme/SEO)" help="Tarayıcı sekmesinde ve arama sonuçlarında görünür." htmlFor="page-title" className="sm:col-span-2">
            <input id="page-title" name="title" defaultValue={page.title ?? ""} className="adm-input" />
          </Field>

          <div className="rounded-xl p-4" style={{ background: "rgb(var(--muted) / 0.5)", border: "1px solid rgb(var(--border))" }}>
            <label className="adm-switch">
              <input type="checkbox" name="published" defaultChecked={page.published} />
              <span className="adm-switch-track" />
              <span className="adm-switch-label">Yayında</span>
            </label>
            <p className="adm-help mt-2">Kapalıyken sayfa ziyaretçilere görünmez.</p>
          </div>

          <div className="rounded-xl p-4" style={{ background: "rgb(var(--gold) / 0.08)", border: "1px solid rgb(var(--gold) / 0.3)" }}>
            <label className="adm-switch">
              <input type="checkbox" name="managed" defaultChecked={page.managed} />
              <span className="adm-switch-track" />
              <span className="adm-switch-label">CMS ile yayınla</span>
            </label>
            <p className="adm-help mt-2">Açıkken bu rota bloklarla gösterilir. Kapalıyken mevcut kodlu tasarım kullanılır.</p>
          </div>

          <div className="sm:col-span-2">
            <button className="adm-btn adm-btn-primary">Kaydet</button>
          </div>
        </form>
        {!page.managed && (
          <p className="adm-help mt-4 rounded-xl p-3" style={{ background: "rgb(var(--gold) / 0.10)", color: "rgb(var(--gold))" }}>
            “CMS ile yayınla” kapalı → <b>/{page.slug}</b> mevcut kodlu tasarımıyla görünür. Blokları hazırlayıp hazır olunca bu anahtarı açın.
          </p>
        )}
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr),minmax(400px,1fr)]">
        {/* Sol: bloklar */}
        <div className="space-y-5">
          <SectionHead title="Bölümler" hint="Her bölüm ayrı bir karttır. Sürükleyerek ya da oklarla sıralayın." />

          <BlockReorder pageId={page.id} items={page.blocks.map((b, idx) => {
            const props = (b.props as Record<string, unknown>) ?? {};
            const fields = localizedFieldDefs(b.type, props);
            const pdefs = propDefs(b.type, props);
            // text[field][locale]
            const textMap: Record<string, Record<string, string>> = {};
            for (const tr of b.texts) (textMap[tr.field] ??= {})[tr.locale] = tr.value;
            const def = blockDef(b.type);

            return { id: b.id, node: (
              <div key={b.id} className={`adm-card adm-card-pad ${def?.custom ? "adm-card-featured" : ""}`}>
                <div className="mb-4 flex items-center justify-between gap-2">
                  <h3 className="flex items-center gap-2.5 text-[15px] font-bold" style={{ color: "rgb(var(--foreground))" }}>
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[13px] font-mono" style={{ background: "rgb(var(--muted))", color: "rgb(var(--muted-foreground))" }}>{idx + 1}</span>
                    {def?.label ?? b.type}
                    {def?.custom && <Badge tone="warn">premium</Badge>}
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
                    <div className="flex flex-wrap gap-3 rounded-xl p-4" style={{ background: "rgb(var(--muted))" }}>
                      {pdefs.map((p) => {
                        const val = props[p.name];
                        if (p.kind === "bool")
                          return (
                            <label key={p.name} className="adm-switch">
                              <input type="checkbox" name={`p:${p.name}`} defaultChecked={!!val && val !== "false"} />
                              <span className="adm-switch-track" />
                              <span className="adm-switch-label text-[13px]">{p.label}</span>
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
              </div>
            ) };
          })} />

          {page.blocks.length === 0 && (
            <Card>
              <p className="adm-muted py-6 text-center text-sm">Henüz blok yok. Aşağıdan ekleyin.</p>
            </Card>
          )}

          {/* Blok ekle */}
          <Card>
            <SectionHead title="Blok ekle" hint="Sayfanıza yeni bir bölüm eklemek için tip seçin." />
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
          </Card>

          {/* Tehlikeli bölge */}
          <Card>
            <SectionHead title="Tehlikeli bölge" hint="Bu işlem geri alınamaz." />
            <form action={deletePage}>
              <input type="hidden" name="id" value={page.id} />
              <button className="adm-btn adm-btn-danger">
                <Icon name="alert" size={15} /> Bu sayfayı sil
              </button>
            </form>
          </Card>
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
              <div className="flex items-center gap-1.5">
                <Link href={`/admin/pages/${page.id}?pl=${previewLocale}`} className="adm-btn adm-btn-ghost adm-btn-sm">↻ Yenile</Link>
                <a href={`/${previewLocale}/${page.slug}`} target="_blank" rel="noopener" className="adm-btn adm-btn-ghost adm-btn-sm">Yeni sekmede aç ↗</a>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-xl" style={{ minHeight: "70vh", border: "1px solid rgb(var(--border))" }}>
              <iframe key={previewLocale} title="önizleme" src={`/${previewLocale}/${page.slug}`} className="h-full min-h-[70vh] w-full" />
              {page.blocks.length === 0 && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
                  <p className="adm-muted rounded-xl px-4 py-3 text-center text-sm" style={{ background: "rgb(var(--card) / 0.92)", border: "1px solid rgb(var(--border))" }}>
                    Henüz blok yok — ekledikçe burada görünür.
                  </p>
                </div>
              )}
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
