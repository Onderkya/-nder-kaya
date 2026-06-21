import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { audit } from "@/lib/audit";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function deleteConversation(formData: FormData) {
  "use server";
  const session = await requireAdmin();
  const id = String(formData.get("id"));
  await prisma.conversation.delete({ where: { id } }); // mesajlar Cascade ile gider
  await audit(session.email, "delete", "Conversation", id);
  revalidatePath("/admin/conversations");
}

export default async function ConversationsPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  await requireAdmin();
  const { id } = await searchParams;

  const conversations = await prisma.conversation
    .findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { messages: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      take: 100,
    })
    .catch(() => []);

  const selected = id
    ? await prisma.conversation
        .findUnique({ where: { id }, include: { messages: { orderBy: { createdAt: "asc" } } } })
        .catch(() => null)
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-2xl font-bold">Sohbetler</h1>
        <p className="text-sm text-slate-500">Bot (Telegram/WhatsApp) konuşmalarını görüntüleyin.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[20rem_1fr]">
        {/* Liste */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          {conversations.length === 0 && <p className="p-4 text-sm text-slate-500">Henüz konuşma yok.</p>}
          <ul className="divide-y divide-slate-100">
            {conversations.map((c) => (
              <li key={c.id} className={c.id === id ? "bg-cyan-50" : ""}>
                <Link href={`/admin/conversations?id=${c.id}`} className="block px-4 py-3 hover:bg-slate-50">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-500">
                      {c.channel}
                    </span>
                    <span className="text-xs text-slate-400">{c._count.messages} mesaj</span>
                  </div>
                  <div className="mt-1 truncate text-sm font-medium">{c.externalId}</div>
                  <div className="truncate text-xs text-slate-500">{c.messages[0]?.content ?? "—"}</div>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Detay */}
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          {!selected ? (
            <p className="p-6 text-center text-sm text-slate-400">Soldan bir konuşma seçin.</p>
          ) : (
            <div>
              <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-sm font-semibold">{selected.channel}</span>{" "}
                  <span className="text-sm text-slate-500">· {selected.externalId}</span>
                </div>
                <form action={deleteConversation}>
                  <input type="hidden" name="id" value={selected.id} />
                  <button className="text-xs text-red-600 hover:underline">Konuşmayı sil</button>
                </form>
              </div>
              <div className="max-h-[60vh] space-y-3 overflow-y-auto">
                {selected.messages.map((m) => (
                  <div key={m.id} className={m.role === "user" ? "text-right" : "text-left"}>
                    <div
                      className={
                        "inline-block max-w-[80%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm " +
                        (m.role === "user" ? "bg-cyan-600 text-white" : "bg-slate-100 text-slate-800")
                      }
                    >
                      {m.content}
                    </div>
                    <div className="mt-0.5 text-[10px] text-slate-400">{m.createdAt.toLocaleString("tr-TR")}</div>
                  </div>
                ))}
                {selected.messages.length === 0 && <p className="text-sm text-slate-400">Mesaj yok.</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
