import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { getAllSettings, setSetting, SETTING_DEFS } from "@/lib/settings";

export const dynamic = "force-dynamic";

async function saveSettings(formData: FormData) {
  "use server";
  const session = await requireAdmin();
  const changed: string[] = [];
  for (const def of SETTING_DEFS) {
    const clear = formData.get(`clear:${def.key}`) === "on";
    const raw = String(formData.get(`s:${def.key}`) ?? "");
    if (clear) {
      await setSetting(def.key, "");
      changed.push(def.key);
      continue;
    }
    if (def.secret) {
      // Sır: boş bırakılırsa DOKUNULMAZ (mevcut değer korunur). Doluysa güncellenir.
      if (raw.trim() !== "") { await setSetting(def.key, raw.trim()); changed.push(def.key); }
    } else {
      await setSetting(def.key, raw.trim());
      changed.push(def.key);
    }
  }
  // Sır DEĞERLERİNİ denetime YAZMA — yalnız hangi anahtarların değiştiğini.
  await audit(session.email, "update", "Setting", null, `Güncellendi: ${changed.join(", ") || "—"}`);
  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
}

export default async function SettingsPage() {
  await requireAdmin();
  const all = await getAllSettings();
  const groups = [...new Set(SETTING_DEFS.map((d) => d.group))];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Ayarlar</h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-500">
          API anahtarları ve iletişim/site değerleri. Buraya girilen değerler <b>anında</b> (rebuild
          gerekmeden) devreye girer; kod önce buradan, yoksa sunucu ortam değişkeninden okur.
        </p>
        <p className="mt-2 max-w-3xl rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
          ⚠️ Güvenlik: Sırlar veritabanında saklanır (DB yedeği bunları içerir). Yalnız adminler erişir,
          panelde maskelenir, denetim kaydına <b>değerleri yazılmaz</b>. Daha yüksek güvenlik için sunucu
          ortam değişkenlerini tercih edebilirsiniz.
        </p>
      </div>

      <form action={saveSettings} className="space-y-6">
        {groups.map((g) => (
          <section key={g} className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-cyan-800">{g}</h2>
            <div className="space-y-5">
              {SETTING_DEFS.filter((d) => d.group === g).map((d) => {
                const stored = all[d.key];
                const isSet = stored != null && stored !== "";
                return (
                  <div key={d.key} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                    <label className="block">
                      <span className="flex items-center gap-2 text-sm font-medium">
                        {d.label}
                        <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">{d.key}</code>
                        {isSet && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">kayıtlı</span>}
                      </span>
                      <input
                        name={`s:${d.key}`}
                        type={d.secret ? "password" : "text"}
                        autoComplete="off"
                        defaultValue={d.secret ? "" : (stored ?? "")}
                        placeholder={d.secret ? (isSet ? "•••• kayıtlı — değiştirmek için yaz" : (d.hint ?? "")) : (d.hint ?? "")}
                        className="mt-1.5 w-full max-w-xl rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      />
                    </label>
                    <div className="mt-1 flex items-center justify-between">
                      {d.hint ? <span className="text-xs text-slate-400">{d.hint}</span> : <span />}
                      {isSet && (
                        <label className="flex items-center gap-1.5 text-xs text-red-500">
                          <input type="checkbox" name={`clear:${d.key}`} /> sil (env'e dön)
                        </label>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        <div className="pb-10">
          <button className="rounded-lg bg-cyan-600 px-5 py-2 text-sm font-semibold text-white">Kaydet</button>
        </div>
      </form>
    </div>
  );
}
