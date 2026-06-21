import { requireAdmin } from "@/lib/auth";
import { assistantAvailable } from "@/lib/ai/assistant";
import { AiChat } from "./ai-chat";

export const dynamic = "force-dynamic";

export default async function AiPage() {
  await requireAdmin();
  const available = assistantAvailable();

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold">AI Asistan</h1>
      <p className="mb-6 text-sm text-slate-500">
        Doğal dille veritabanına soru sor. Asistan <strong>yalnızca okuma</strong> yapar —
        veri ekleyemez, değiştiremez veya silemez.
      </p>

      {available ? (
        <AiChat />
      ) : (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
          AI asistanı henüz yapılandırılmadı. Etkinleştirmek için sunucuda{" "}
          <code className="rounded bg-amber-100 px-1">ANTHROPIC_API_KEY</code> ve salt-okunur{" "}
          <code className="rounded bg-amber-100 px-1">AI_READONLY_DATABASE_URL</code> değerlerini
          ayarla (bkz. <code>deploy/SUNUCU-KURULUM.md</code>).
        </div>
      )}
    </div>
  );
}
