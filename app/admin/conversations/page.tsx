import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { audit } from "@/lib/audit";
import Link from "next/link";
import { PageHeader, Card, Badge, EmptyState } from "@/components/admin/ui";

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
      <PageHeader
        title="Sohbetler"
        description="Bot (Telegram/WhatsApp) konuşmalarını görüntüleyin. Soldan bir konuşma seçip mesaj geçmişini okuyabilirsiniz."
      />

      {conversations.length === 0 ? (
        <EmptyState
          icon="chat"
          title="Henüz konuşma yok"
          description="Telegram/WhatsApp botunuza mesaj gelince konuşmalar burada listelenir."
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[20rem_1fr]">
          {/* Liste */}
          <div className="space-y-3">
            {conversations.map((c) => {
              const active = c.id === id;
              return (
                <Link key={c.id} href={`/admin/conversations?id=${c.id}`} className="block">
                  <Card className={active ? "adm-card-featured" : ""}>
                    <div className="flex items-center justify-between gap-2">
                      <Badge tone="neutral">{c.channel}</Badge>
                      <span className="adm-muted text-xs">{c._count.messages} mesaj</span>
                    </div>
                    <div className="mt-1.5 truncate text-sm font-medium" style={{ color: "rgb(var(--foreground))" }}>{c.externalId}</div>
                    <div className="adm-muted truncate text-xs">{c.messages[0]?.content ?? "—"}</div>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* Detay */}
          <Card>
            {!selected ? (
              <EmptyState
                icon="chat"
                title="Bir konuşma seçin"
                description="Soldaki listeden bir konuşmaya tıklayın; mesaj geçmişi burada açılır."
              />
            ) : (
              <div>
                <div className="mb-4 flex items-center justify-between gap-3 border-b pb-3" style={{ borderColor: "rgb(var(--border))" }}>
                  <div className="flex items-center gap-2">
                    <Badge tone="neutral">{selected.channel}</Badge>
                    <span className="adm-muted text-sm">· {selected.externalId}</span>
                  </div>
                  <form action={deleteConversation}>
                    <input type="hidden" name="id" value={selected.id} />
                    <button className="adm-btn adm-btn-danger adm-btn-sm">Konuşmayı sil</button>
                  </form>
                </div>
                <div className="max-h-[60vh] space-y-3 overflow-y-auto">
                  {selected.messages.map((m) => {
                    const isUser = m.role === "user";
                    return (
                      <div key={m.id} className={isUser ? "text-right" : "text-left"}>
                        <div
                          className="inline-block max-w-[80%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm"
                          style={
                            isUser
                              ? { background: "rgb(var(--primary))", color: "#fff" }
                              : { background: "rgb(var(--muted))", color: "rgb(var(--foreground))" }
                          }
                        >
                          {m.content}
                        </div>
                        <div className="adm-muted mt-0.5 text-[10px]">{m.createdAt.toLocaleString("tr-TR")}</div>
                      </div>
                    );
                  })}
                  {selected.messages.length === 0 && <p className="adm-muted text-sm">Mesaj yok.</p>}
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
