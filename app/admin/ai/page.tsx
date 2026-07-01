import { requireAdmin } from "@/lib/auth";
import { assistantAvailable, writeEnabled } from "@/lib/ai/assistant";
import { AiChat } from "./ai-chat";
import { PageHeader, Card } from "@/components/admin/ui";
import { Icon } from "@/components/admin/icons";

export const dynamic = "force-dynamic";

export default async function AiPage() {
  await requireAdmin();
  const available = await assistantAvailable();
  const canWrite = writeEnabled();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Yönetim Paneli"
        title="AI Asistan"
        description={
          canWrite
            ? "Doğal dille veritabanınıza soru sorun. Asistan okuma yapar, ekleme/güncelleme önerir (uygulamak için sizin onayınız gerekir). Silme yapamaz."
            : "Doğal dille veritabanınıza soru sorun. Asistan yalnızca okuma yapar; ekleme, güncelleme veya silme yapamaz."
        }
      />

      {available ? (
        <AiChat />
      ) : (
        <Card>
          <div className="flex gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl" style={{ background: "rgb(var(--gold) / 0.14)", color: "rgb(var(--gold))" }}>
              <Icon name="alert" size={18} />
            </span>
            <div className="min-w-0 text-[13.5px] leading-relaxed" style={{ color: "rgb(var(--foreground))" }}>
              <p className="font-semibold">AI asistanı henüz yapılandırılmadı.</p>
              <p className="adm-muted mt-1">
                Etkinleştirmek için sunucuda{" "}
                <code className="rounded px-1" style={{ background: "rgb(var(--muted))" }}>OPENROUTER_API_KEY</code>,{" "}
                <code className="rounded px-1" style={{ background: "rgb(var(--muted))" }}>OPENROUTER_MODEL</code> ve salt-okunur{" "}
                <code className="rounded px-1" style={{ background: "rgb(var(--muted))" }}>AI_READONLY_DATABASE_URL</code> değerlerini
                ayarlayın; güvenli yazma için ayrıca{" "}
                <code className="rounded px-1" style={{ background: "rgb(var(--muted))" }}>AI_READWRITE_DATABASE_URL</code> (bkz.{" "}
                <code>deploy/SUNUCU-KURULUM.md</code>).
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
