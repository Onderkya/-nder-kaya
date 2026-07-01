import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { PageHeader, Card, Section, Badge, Field, EmptyState, LocationHint } from "@/components/admin/ui";

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

  const now = new Date();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Gelen Kutusu"
        title="Rezervasyon"
        description="Ders tiplerini (süre/fiyat) ve uygun zaman slotlarını yönetin. Boş slotlar dersler sayfasında müşterilere gösterilir."
      />

      {/* Ders tipleri */}
      <Section
        title="Ders tipleri"
        description="Süre ve fiyat seçenekleri — müşteri bunlardan birini seçerek randevu alır."
        icon="calendar"
      >
        <form action={createLessonType} className="grid gap-4 sm:grid-cols-4">
          <Field label="Süre (dk)" help="Dersin uzunluğu.">
            <input name="minutes" type="number" min={1} required placeholder="30" className="adm-input w-full" />
          </Field>
          <Field label="Fiyat" help="Boş = belirtilmemiş.">
            <input name="price" type="number" min={0} className="adm-input w-full" />
          </Field>
          <Field label="Para birimi">
            <input name="currency" defaultValue="USD" className="adm-input w-full" />
          </Field>
          <div className="flex items-end">
            <button className="adm-btn adm-btn-primary w-full sm:w-auto">Ekle</button>
          </div>
        </form>

        <div className="mt-5">
          {types.length === 0 ? (
            <EmptyState icon="calendar" title="Henüz ders tipi yok" description="Yukarıdan süre ve fiyat ekleyin; müşteriler bunlardan seçim yapar." />
          ) : (
            <>
              {/* Mobil — kartlar */}
              <div className="space-y-3 sm:hidden">
                {types.map((t) => (
                  <Card key={t.id}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold" style={{ color: "rgb(var(--foreground))" }}>{t.minutes} dk</p>
                        <p className="adm-muted text-[13.5px]">{t.price != null ? `${t.price} ${t.currency}` : "Fiyat belirtilmemiş"}</p>
                      </div>
                      <Badge tone={t.active ? "success" : "neutral"}>{t.active ? "Aktif" : "Pasif"}</Badge>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <form action={toggleLessonType}>
                        <input type="hidden" name="id" value={t.id} />
                        <input type="hidden" name="active" value={String(t.active)} />
                        <button className="adm-btn adm-btn-ghost adm-btn-sm">{t.active ? "Pasif yap" : "Aktif yap"}</button>
                      </form>
                      <form action={deleteLessonType}>
                        <input type="hidden" name="id" value={t.id} />
                        <button className="adm-btn adm-btn-danger adm-btn-sm">Sil</button>
                      </form>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Masaüstü — tablo */}
              <div className="hidden sm:block">
                <table className="hidden w-full text-left text-sm sm:table">
                  <thead>
                    <tr className="adm-muted border-b text-xs uppercase tracking-wide" style={{ borderColor: "rgb(var(--border))" }}>
                      <th className="py-3 pr-4 font-semibold">Süre</th>
                      <th className="py-3 pr-4 font-semibold">Fiyat</th>
                      <th className="py-3 pr-4 font-semibold">Durum</th>
                      <th className="py-3 font-semibold"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {types.map((t) => (
                      <tr key={t.id} className="border-b last:border-0" style={{ borderColor: "rgb(var(--border))" }}>
                        <td className="py-3 pr-4 font-semibold" style={{ color: "rgb(var(--foreground))" }}>{t.minutes} dk</td>
                        <td className="py-3 pr-4" style={{ color: "rgb(var(--foreground))" }}>{t.price != null ? `${t.price} ${t.currency}` : "—"}</td>
                        <td className="py-3 pr-4">
                          <form action={toggleLessonType} className="flex items-center gap-2">
                            <input type="hidden" name="id" value={t.id} />
                            <input type="hidden" name="active" value={String(t.active)} />
                            <button className="inline-flex"><Badge tone={t.active ? "success" : "neutral"}>{t.active ? "Aktif" : "Pasif"}</Badge></button>
                          </form>
                        </td>
                        <td className="py-3">
                          <form action={deleteLessonType}>
                            <input type="hidden" name="id" value={t.id} />
                            <button className="adm-btn adm-btn-danger adm-btn-sm">Sil</button>
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </Section>

      {/* Uygunluk slotları */}
      <Section
        title="Uygunluk (randevu) slotları"
        description="Bir slot = müsait olduğun bir zaman aralığı. Müşteriler bu boş slotları /lessons sayfasından seçip randevu alır."
        icon="calendar"
      >
        <LocationHint>Boş slotlar sitenizde <strong>/lessons</strong> (Dersler) sayfasında müşterilere gösterilir.</LocationHint>

        <form action={createSlot} className="mt-4 grid gap-4 sm:grid-cols-3">
          <Field label="Başlangıç" help="Randevunun başlayacağı tarih ve saat.">
            <input name="startsAt" type="datetime-local" required className="adm-input w-full" />
          </Field>
          <Field label="Süre (dk)">
            <input name="minutes" type="number" min={1} defaultValue={30} className="adm-input w-full" />
          </Field>
          <div className="flex items-end">
            <button className="adm-btn adm-btn-primary w-full sm:w-auto">Slot ekle</button>
          </div>
        </form>

        <div className="mt-5">
          {slots.length === 0 ? (
            <EmptyState icon="calendar" title="Henüz slot yok" description="Müsait olduğun zamanları ekle; müşteriler /lessons sayfasından bu boş slotlardan randevu alır." />
          ) : (
            <>
              {/* Mobil — kartlar */}
              <div className="space-y-3 sm:hidden">
                {slots.map((s) => {
                  const past = s.startsAt < now;
                  return (
                    <Card key={s.id}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold" style={{ color: "rgb(var(--foreground))" }}>{s.startsAt.toLocaleString("tr-TR")}</p>
                          <p className="adm-muted text-[13.5px]">{s.minutes} dk</p>
                        </div>
                        {s.booked ? (
                          <Badge tone="success">Dolu</Badge>
                        ) : past ? (
                          <Badge tone="neutral">Geçmiş</Badge>
                        ) : (
                          <Badge tone="neutral">Boş</Badge>
                        )}
                      </div>
                      <div className="mt-3">
                        <form action={deleteSlot}>
                          <input type="hidden" name="id" value={s.id} />
                          <button className="adm-btn adm-btn-danger adm-btn-sm">Sil</button>
                        </form>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Masaüstü — tablo */}
              <div className="hidden sm:block">
                <table className="hidden w-full text-left text-sm sm:table">
                  <thead>
                    <tr className="adm-muted border-b text-xs uppercase tracking-wide" style={{ borderColor: "rgb(var(--border))" }}>
                      <th className="py-3 pr-4 font-semibold">Başlangıç</th>
                      <th className="py-3 pr-4 font-semibold">Süre</th>
                      <th className="py-3 pr-4 font-semibold">Durum</th>
                      <th className="py-3 font-semibold"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {slots.map((s) => {
                      const past = s.startsAt < now;
                      return (
                        <tr key={s.id} className="border-b last:border-0" style={{ borderColor: "rgb(var(--border))" }}>
                          <td className="py-3 pr-4" style={{ color: "rgb(var(--foreground))" }}>{s.startsAt.toLocaleString("tr-TR")}</td>
                          <td className="py-3 pr-4" style={{ color: "rgb(var(--foreground))" }}>{s.minutes} dk</td>
                          <td className="py-3 pr-4">
                            {s.booked ? (
                              <Badge tone="success">Dolu</Badge>
                            ) : past ? (
                              <Badge tone="neutral">Geçmiş</Badge>
                            ) : (
                              <Badge tone="neutral">Boş</Badge>
                            )}
                          </td>
                          <td className="py-3">
                            <form action={deleteSlot}>
                              <input type="hidden" name="id" value={s.id} />
                              <button className="adm-btn adm-btn-danger adm-btn-sm">Sil</button>
                            </form>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </Section>
    </div>
  );
}
