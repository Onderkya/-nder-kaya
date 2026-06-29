import { requireAdmin } from "@/lib/auth";
import { assistantAvailable, writeEnabled } from "@/lib/ai/assistant";
import { AiChat } from "./ai-chat";

export const dynamic = "force-dynamic";

export default async function AiPage() {
  await requireAdmin();
  const available = await assistantAvailable();
  const canWrite = writeEnabled();

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold">AI Asistan</h1>
      <p className="mb-6 text-sm text-slate-500">
        Doğal dille veritabanına soru sor. Asistan okuma yapar ve{" "}
        {canWrite ? (
          <>
            ekleme/güncelleme <strong>önerir</strong> (uygulamak için senin onayın gerekir).
          </>
        ) : (
          <>yalnızca okuma yapar.</>
        )}{" "}
        <strong>Silme yapamaz.</strong>
      </p>

      {available ? (
        <AiChat />
      ) : (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
          AI asistanı henüz yapılandırılmadı. Etkinleştirmek için sunucuda{" "}
          <code className="rounded bg-amber-100 px-1">OPENROUTER_API_KEY</code>,{" "}
          <code className="rounded bg-amber-100 px-1">OPENROUTER_MODEL</code> ve salt-okunur{" "}
          <code className="rounded bg-amber-100 px-1">AI_READONLY_DATABASE_URL</code> değerlerini
          ayarla; güvenli yazma için ayrıca{" "}
          <code className="rounded bg-amber-100 px-1">AI_READWRITE_DATABASE_URL</code> (bkz.{" "}
          <code>deploy/SUNUCU-KURULUM.md</code>).
        </div>
      )}
    </div>
  );
}
