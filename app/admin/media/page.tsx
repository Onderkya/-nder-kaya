import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { PageHeader, Card } from "@/components/admin/ui";
import { Icon } from "@/components/admin/icons";
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
      <PageHeader
        eyebrow="Görsel Kütüphanesi"
        title="Görseller"
        description="Sitede kullandığınız tüm görsellerin toplandığı yerdir. Buraya yüklediğiniz görselleri, bir sayfa ya da bölüm düzenlerken hazır listeden seçebilirsiniz."
      />

      <Card className="flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl" style={{ background: "rgb(var(--muted))", color: "rgb(var(--primary))" }}>
          <Icon name="eye" size={18} />
        </span>
        <p className="adm-muted text-[13.5px] leading-relaxed">
          <span className="font-semibold" style={{ color: "rgb(var(--foreground))" }}>&ldquo;Kullanımda&rdquo;</span> rozeti, o görselin şu anda sitenizde bir yerde
          görüntülendiği anlamına gelir. Hangi görselin nerede çıkacağını, ilgili sayfayı ya da bölümü düzenlerken kendiniz seçersiniz.
        </p>
      </Card>

      <UploadForm />
      <MediaGrid items={items} />
    </div>
  );
}
