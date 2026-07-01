import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { audit } from "@/lib/audit";

export const dynamic = "force-dynamic";

// --- Ders tipleri ---
async function createLessonType(formData: FormData) {
  "use server";
  const session = await requireAdmin();
  const minutes = Number(formData.get("minutes"));
  const price = formData.get("price") ? Number(formData.get("price")) : null;
  const currency = String(formData.get("currency") || "USD").toUpperCase().slice(0, 8);
  if (!Number.isFinite(minutes) || minutes <= 0) return;
  if (price !== null && (!Number.isFinite(price) || price < 0)) return;
  const created = await prisma.lessonType.create({ data: { minutes, price, currency } });
  await audit(session.email, "create", "LessonType", created.id, `${minutes}dk ${price ?? "-"} ${currency}`);
  revalidatePath("/admin/booking");
  revalidatePath("/", "layout"); // public /lessons (ISR) anında tazelensin
}

async function toggleLessonType(formData: FormData) {
  "use server";
  const session = await requireAdmin();
  const id = String(formData.get("id"));
  const active = formData.get("active") === "true";
  await prisma.lessonType.update({ where: { id }, data: { active: !active } });
  await audit(session.email, "toggle", "LessonType", id, `active=${!active}`);
  revalidatePath("/admin/booking");
  revalidatePath("/", "layout"); // public /lessons (ISR) anında tazelensin
}

async function deleteLessonType(formData: FormData) {
  "use server";
  const session = await requireAdmin();
  const id = String(formData.get("id"));
  await prisma.lessonType.delete({ where: { id } });
  await audit(session.email, "delete", "LessonType", id);
  revalidatePath("/admin/booking");
  revalidatePath("/", "layout"); // public /lessons (ISR) anında tazelensin
}

// --- Uygunluk slotları ---
async function createSlot(formData: FormData) {
  "use server";
  const session = await requireAdmin();
  const startsRaw = String(formData.get("startsAt") || "");
  const minutes = Number(formData.get("minutes")) || 30;
  const startsAt = new Date(startsRaw);
  if (!startsRaw || Number.isNaN(startsAt.getTime())) return;
  const created = await prisma.availabilitySlot.create({ data: { startsAt, minutes } });
  await audit(session.email, "create", "AvailabilitySlot", created.id, `${startsAt.toISOString()} ${minutes}dk`);
  revalidatePath("/admin/booking");
  revalidatePath("/", "layout"); // public /lessons (ISR) anında tazelensin
}

async function deleteSlot(formData: FormData) {
  "use server";
  const session = await requireAdmin();
  const id = String(formData.get("id"));
  await prisma.availabilitySlot.delete({ where: { id } });
  await audit(session.email, "delete", "AvailabilitySlot", id);
  revalidatePath("/admin/booking");
  revalidatePath("/", "layout"); // public /lessons (ISR) anında tazelensin
}

export default async function BookingPage() {
  await requireAdmin();
  const [types, slots] = await Promise.all([
    prisma.lessonType.findMany({ orderBy: { minutes: "asc" } }).catch(() => []),
    prisma.availabilitySlot.findMany({ orderBy: { startsAt: "asc" } }).catch(() => []),
  ]);

  const field = "rounded-lg border border-slate-300 px-3 py-2 text-sm";
  const now = new Date();

  return (
    <div className="space-y-10">
      <div>
        <h1 className="mb-2 text-2xl font-bold">Rezervasyon</h1>
        <p className="text-sm text-slate-500">
          Ders tiplerini (süre/fiyat) ve uygun zaman slotlarını yönetin. Boş slotlar
          dersler sayfasında müşterilere gösterilir.
        </p>
      </div>

      {/* Ders tipleri */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Ders tipleri</h2>
        <form action={createLessonType} className="grid gap-3 rounded-2xl bg-white p-6 shadow-sm sm:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Süre (dk)</label>
            <input name="minutes" type="number" min={1} required placeholder="30" className={`${field} w-full`} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Fiyat (boş = belirtilmemiş)</label>
            <input name="price" type="number" min={0} className={`${field} w-full`} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Para birimi</label>
            <input name="currency" defaultValue="USD" className={`${field} w-full`} />
          </div>
          <div className="flex items-end">
            <button className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white">Ekle</button>
          </div>
        </form>

        <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr><th className="p-3">Süre</th><th className="p-3">Fiyat</th><th className="p-3">Durum</th><th className="p-3"></th></tr>
            </thead>
            <tbody>
              {types.map((t) => (
                <tr key={t.id} className="border-b border-slate-100">
                  <td className="p-3 font-semibold">{t.minutes} dk</td>
                  <td className="p-3">{t.price != null ? `${t.price} ${t.currency}` : "—"}</td>
                  <td className="p-3">
                    <form action={toggleLessonType}>
                      <input type="hidden" name="id" value={t.id} />
                      <input type="hidden" name="active" value={String(t.active)} />
                      <button className={`rounded-full px-3 py-1 text-xs font-semibold ${t.active ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-600"}`}>
                        {t.active ? "Aktif" : "Pasif"}
                      </button>
                    </form>
                  </td>
                  <td className="p-3">
                    <form action={deleteLessonType}>
                      <input type="hidden" name="id" value={t.id} />
                      <button className="text-xs text-red-600 hover:underline">Sil</button>
                    </form>
                  </td>
                </tr>
              ))}
              {types.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-slate-500">Henüz ders tipi yok.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      {/* Slotlar */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Uygun zaman slotları</h2>
        <form action={createSlot} className="grid gap-3 rounded-2xl bg-white p-6 shadow-sm sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Başlangıç</label>
            <input name="startsAt" type="datetime-local" required className={`${field} w-full`} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Süre (dk)</label>
            <input name="minutes" type="number" min={1} defaultValue={30} className={`${field} w-full`} />
          </div>
          <div className="flex items-end">
            <button className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white">Slot ekle</button>
          </div>
        </form>

        <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr><th className="p-3">Başlangıç</th><th className="p-3">Süre</th><th className="p-3">Durum</th><th className="p-3"></th></tr>
            </thead>
            <tbody>
              {slots.map((s) => {
                const past = s.startsAt < now;
                return (
                  <tr key={s.id} className="border-b border-slate-100">
                    <td className="p-3">{s.startsAt.toLocaleString("tr-TR")}</td>
                    <td className="p-3">{s.minutes} dk</td>
                    <td className="p-3">
                      {s.booked ? (
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">Dolu</span>
                      ) : past ? (
                        <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">Geçmiş</span>
                      ) : (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">Boş</span>
                      )}
                    </td>
                    <td className="p-3">
                      <form action={deleteSlot}>
                        <input type="hidden" name="id" value={s.id} />
                        <button className="text-xs text-red-600 hover:underline">Sil</button>
                      </form>
                    </td>
                  </tr>
                );
              })}
              {slots.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-slate-500">Henüz slot yok.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
