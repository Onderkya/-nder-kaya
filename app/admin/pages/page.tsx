import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { listPages } from "@/lib/cms";
import { createPage } from "./actions";
import { PageHeader, Card, Section, Field, Badge, EmptyState } from "@/components/admin/ui";
import { Icon } from "@/components/admin/icons";

export const dynamic = "force-dynamic";

const KNOWN = ["home", "antalya", "lessons", "education", "about", "faq", "contact"];

export default async function AdminPagesList() {
  await requireAdmin();
  const pages = await listPages();
  const existing = new Set(pages.map((p) => p.slug));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sayfalar"
        description="Bloklarla sayfa kurun ve düzenleyin. Bir sayfayı yayına almadıkça (aşağıdaki “yayında” işareti) o rota mevcut tasarımıyla çalışmaya devam eder — yani burada hazırlık yaparken siteniz bozulmaz. Hazır olunca yayına alın; istediğinizde geri kapatabilirsiniz."
      />

      {/* Bilinen rotalar için hızlı oluştur */}
      <Card>
        <div className="mb-5">
          <h3 className="adm-section-title">Mevcut sayfa rotaları</h3>
          <p className="adm-help mt-1">Sitenizdeki hazır sayfalar. Var olana tıklayıp düzenleyin, olmayanı tek dokunuşla oluşturun.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {KNOWN.map((slug) =>
            existing.has(slug) ? (
              <Link
                key={slug}
                href={`/admin/pages/${pages.find((p) => p.slug === slug)!.id}`}
                className="adm-btn adm-btn-ghost adm-btn-sm"
              >
                {slug}
              </Link>
            ) : (
              <form key={slug} action={createPage}>
                <input type="hidden" name="slug" value={slug} />
                <input type="hidden" name="title" value={slug} />
                <button className="adm-btn adm-btn-ghost adm-btn-sm" style={{ borderStyle: "dashed" }}>
                  <Icon name="plus" size={14} /> {slug}
                </button>
              </form>
            )
          )}
        </div>
      </Card>

      {/* Yeni özel sayfa */}
      <Section icon="plus" title="Yeni özel sayfa" description="Kendi rotanızla yeni bir sayfa açın" defaultOpen={false}>
        <form action={createPage} className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <Field label="Slug (URL)" help="Adres çubuğunda görünür — örn. site.com/kampanya" htmlFor="new-slug">
            <input id="new-slug" name="slug" placeholder="kampanya" required className="adm-input" />
          </Field>
          <Field label="Başlık" help="Tarayıcı sekmesinde ve SEO'da görünür" htmlFor="new-title">
            <input id="new-title" name="title" placeholder="Kampanya" className="adm-input" />
          </Field>
          <button className="adm-btn adm-btn-primary">Oluştur</button>
        </form>
      </Section>

      {/* Tüm sayfalar */}
      <div>
        <div className="mb-4">
          <h3 className="adm-section-title">Tüm sayfalar</h3>
        </div>

        {pages.length === 0 ? (
          <EmptyState
            icon="pages"
            title="Henüz sayfa yok"
            description="Yukarıdaki hazır rotalardan birini oluşturun ya da kendi özel sayfanızı ekleyin."
          />
        ) : (
          <>
            {/* Mobil: kartlar */}
            <div className="space-y-3 sm:hidden">
              {pages.map((p) => (
                <Card key={p.id}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold" style={{ color: "rgb(var(--foreground))" }}>{p.title || "—"}</p>
                      <code className="text-xs" style={{ color: "rgb(var(--muted-foreground))" }}>/{p.slug}</code>
                    </div>
                    {p.managed ? <Badge tone="success">yayında</Badge> : <Badge tone="neutral">kodlu tasarım</Badge>}
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="adm-muted text-xs">{p._count.blocks} blok</span>
                    <Link href={`/admin/pages/${p.id}`} className="adm-btn adm-btn-ghost adm-btn-sm">Düzenle</Link>
                  </div>
                </Card>
              ))}
            </div>

            {/* Masaüstü: tablo */}
            <Card pad={false} className="hidden sm:block">
              <table className="hidden w-full text-sm sm:table">
                <thead>
                  <tr className="adm-muted text-left text-xs uppercase tracking-wide" style={{ borderBottom: "1px solid rgb(var(--border))" }}>
                    <th className="px-5 py-3 font-semibold">Slug</th>
                    <th className="px-5 py-3 font-semibold">Başlık</th>
                    <th className="px-5 py-3 font-semibold">Blok</th>
                    <th className="px-5 py-3 font-semibold">Durum</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {pages.map((p) => (
                    <tr key={p.id} style={{ borderTop: "1px solid rgb(var(--border))" }}>
                      <td className="px-5 py-3 font-mono text-xs" style={{ color: "rgb(var(--muted-foreground))" }}>{p.slug}</td>
                      <td className="px-5 py-3" style={{ color: "rgb(var(--foreground))" }}>{p.title || "—"}</td>
                      <td className="px-5 py-3" style={{ color: "rgb(var(--foreground))" }}>{p._count.blocks}</td>
                      <td className="px-5 py-3">
                        {p.managed ? <Badge tone="success">yayında</Badge> : <Badge tone="neutral">kodlu tasarım</Badge>}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Link href={`/admin/pages/${p.id}`} className="adm-btn adm-btn-ghost adm-btn-sm">Düzenle</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
