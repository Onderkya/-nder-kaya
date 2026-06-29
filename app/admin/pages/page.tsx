import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { listPages } from "@/lib/cms";
import { createPage } from "./actions";

export const dynamic = "force-dynamic";

const KNOWN = ["home", "antalya", "lessons", "education", "about", "faq", "contact"];

export default async function AdminPagesList() {
  await requireAdmin();
  const pages = await listPages();
  const existing = new Set(pages.map((p) => p.slug));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Sayfalar (CMS)</h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-500">
          Bloklarla sayfa kurun/düzenleyin. Bir sayfa <b>“CMS ile yayınla”</b> açık değilse, o
          rota mevcut tasarımıyla çalışmaya devam eder — yani burada hazırlık yaparken site
          bozulmaz. Hazır olunca yayına alın; istediğinizde geri kapatabilirsiniz.
        </p>
      </div>

      {/* Bilinen rotalar için hızlı oluştur */}
      <section className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Mevcut sayfa rotaları</h2>
        <div className="flex flex-wrap gap-2">
          {KNOWN.map((slug) =>
            existing.has(slug) ? (
              <Link
                key={slug}
                href={`/admin/pages/${pages.find((p) => p.slug === slug)!.id}`}
                className="rounded-lg border border-cyan-300 bg-cyan-50 px-3 py-1.5 text-sm font-medium text-cyan-800"
              >
                {slug}
              </Link>
            ) : (
              <form key={slug} action={createPage}>
                <input type="hidden" name="slug" value={slug} />
                <input type="hidden" name="title" value={slug} />
                <button className="rounded-lg border border-dashed border-slate-300 px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-50">
                  + {slug}
                </button>
              </form>
            )
          )}
        </div>
      </section>

      {/* Yeni özel sayfa */}
      <section className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Yeni özel sayfa</h2>
        <form action={createPage} className="flex flex-wrap items-end gap-3">
          <label className="block">
            <span className="mb-1 block text-xs text-slate-500">Slug (URL)</span>
            <input name="slug" placeholder="kampanya" required className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-slate-500">Başlık</span>
            <input name="title" placeholder="Kampanya" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </label>
          <button className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white">Oluştur</button>
        </form>
      </section>

      {/* Tüm sayfalar */}
      <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Başlık</th>
              <th className="px-4 py-3">Blok</th>
              <th className="px-4 py-3">Durum</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {pages.map((p) => (
              <tr key={p.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-mono text-xs">{p.slug}</td>
                <td className="px-4 py-3">{p.title || "—"}</td>
                <td className="px-4 py-3">{p._count.blocks}</td>
                <td className="px-4 py-3">
                  {p.managed ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">CMS yayında</span>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">kodlu tasarım</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/pages/${p.id}`} className="font-semibold text-cyan-700">Düzenle →</Link>
                </td>
              </tr>
            ))}
            {pages.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">Henüz sayfa yok. Yukarıdan oluşturun.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
