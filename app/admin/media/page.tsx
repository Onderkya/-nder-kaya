import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { UploadForm } from "./upload-form";
import { MediaGrid } from "./media-grid";

export const dynamic = "force-dynamic";

export default async function MediaPage() {
  await requireAdmin();
  const media = await prisma.media
    .findMany({ orderBy: { createdAt: "desc" }, include: { _count: { select: { blocks: true } } } })
    .catch(() => []);

  const items = media.map((m) => ({ id: m.id, url: m.url, alt: m.alt, inUse: m._count.blocks }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-2 text-2xl font-bold">Medya</h1>
        <p className="text-sm text-slate-500">
          Görsel yükleyin ve yönetin. Yüklenen görsellerin URL&apos;sini kopyalayıp
          içeriklerde kullanabilirsiniz. (Yalnızca PNG, JPG, WEBP, GIF.)
        </p>
      </div>

      <UploadForm />
      <MediaGrid items={items} />
    </div>
  );
}
