import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { getAllSettings, setSetting, SETTING_DEFS } from "@/lib/settings";
import { PageHeader, Card, Section, Field, Badge } from "@/components/admin/ui";
import { Icon, type IconName } from "@/components/admin/icons";

export const dynamic = "force-dynamic";

// Grup adına göre ikon + kısa açıklama (görsel; başka bir şey değişmez).
const GROUP_META: Record<string, { icon: IconName; description: string }> = {
  "Yapay Zekâ": { icon: "robot", description: "AI asistanı ve içerik üretimi için sağlayıcı anahtarları ve model ayarları." },
  "İletişim": { icon: "inbox", description: "Ziyaretçilerin size ulaşacağı e-posta, telefon ve mesajlaşma bilgileri." },
  "Site": { icon: "settings", description: "Sitenizin adresi ve genel görünen değerleri." },
};
function groupMeta(g: string) {
  return GROUP_META[g] ?? { icon: "settings" as IconName, description: "Bu bölümdeki ayarlar." };
}

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
    <div className="space-y-6">
      <PageHeader
        eyebrow="Yönetim Paneli"
        title="Ayarlar"
        description="API anahtarları, iletişim ve site değerleri. Buraya girdiğiniz değerler anında (yeniden yayına gerek olmadan) devreye girer; sistem önce buradan, yoksa sunucudaki ortam değişkeninden okur."
      />

      <Card>
        <div className="flex gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl" style={{ background: "rgb(var(--gold) / 0.14)", color: "rgb(var(--gold))" }}>
            <Icon name="alert" size={18} />
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-[14.5px]" style={{ color: "rgb(var(--foreground))" }}>Güvenlik notu</p>
            <p className="adm-muted mt-1 text-[13.5px] leading-relaxed">
              Sır değerleri veritabanında şifreli saklanır (yedekler bunları içerir). Yalnız yöneticiler erişir,
              panelde maskelenir, denetim kaydına <b>değerleri yazılmaz</b>. Daha yüksek güvenlik isterseniz sunucu
              ortam değişkenlerini tercih edebilirsiniz.
            </p>
          </div>
        </div>
      </Card>

      <form action={saveSettings} className="space-y-5">
        {groups.map((g) => {
          const meta = groupMeta(g);
          return (
            <Section key={g} title={g} description={meta.description} icon={meta.icon}>
              <div className="space-y-6">
                {SETTING_DEFS.filter((d) => d.group === g).map((d) => {
                  const stored = all[d.key];
                  const isSet = stored != null && stored !== "";
                  return (
                    <div key={d.key} className="border-b pb-6 last:border-0 last:pb-0" style={{ borderColor: "rgb(var(--border))" }}>
                      <div className="mb-1.5 flex flex-wrap items-center gap-2">
                        <label className="text-[14px] font-semibold" htmlFor={`s:${d.key}`} style={{ color: "rgb(var(--foreground))" }}>{d.label}</label>
                        <code className="rounded px-1.5 py-0.5 text-[10.5px]" style={{ background: "rgb(var(--muted))", color: "rgb(var(--muted-foreground))" }}>{d.key}</code>
                        {isSet && <Badge tone="success">kayıtlı</Badge>}
                      </div>
                      <input
                        id={`s:${d.key}`}
                        name={`s:${d.key}`}
                        type={d.secret ? "password" : "text"}
                        autoComplete="off"
                        defaultValue={d.secret ? "" : (stored ?? "")}
                        placeholder={d.secret ? (isSet ? "•••• kayıtlı — değiştirmek için yaz" : (d.hint ?? "")) : (d.hint ?? "")}
                        className="adm-input max-w-xl"
                      />
                      {d.hint && <p className="adm-help">{d.hint}</p>}
                      {d.secret && <p className="adm-help">Boş bırakırsan mevcut değer korunur.</p>}
                      {isSet && (
                        <label className="mt-3 inline-flex items-center gap-2 text-[13px]" style={{ color: "rgb(var(--accent))" }}>
                          <input type="checkbox" name={`clear:${d.key}`} className="h-4 w-4 accent-current" />
                          Değeri sil (sunucu ortam değişkenine geri dön)
                        </label>
                      )}
                    </div>
                  );
                })}
              </div>
            </Section>
          );
        })}

        <div className="adm-sticky-save flex justify-end">
          <button className="adm-btn adm-btn-primary">
            <Icon name="check" size={18} /> Kaydet
          </button>
        </div>
      </form>
    </div>
  );
}
