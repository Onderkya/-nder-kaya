import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { audit } from "@/lib/audit";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { validateUpload, safeFileName } from "@/lib/media";

export const dynamic = "force-dynamic";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

/** Görsel yükleme — yalnızca admin. Yerel dosya sistemine yazar (public/uploads). */
export async function POST(req: Request) {
  let session;
  try {
    session = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const ip = clientIp(req);
  const limit = rateLimit(`media-upload:${session.uid}:${ip}`, 30, 60_000);
  if (!limit.ok) {
    return NextResponse.json({ error: "rate_limited", retryAfter: limit.retryAfter }, { status: 429 });
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!form || !(file instanceof File)) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const alt = String(form.get("alt") ?? "").slice(0, 300) || null;

  const check = validateUpload(file.type, file.size);
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: 400 });

  const name = safeFileName(check.ext);
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOAD_DIR, name), buffer);

  const url = `/uploads/${name}`;
  const media = await prisma.media.create({ data: { url, alt } });
  await audit(session.email, "create", "Media", media.id, url);

  return NextResponse.json({ ok: true, media });
}

/** Görsel silme — kullanımdaysa (bir içerik bloğuna bağlıysa) reddeder. */
export async function DELETE(req: Request) {
  let session;
  try {
    session = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const id = body && typeof body.id === "string" ? body.id : null;
  if (!id) return NextResponse.json({ error: "invalid" }, { status: 400 });

  const media = await prisma.media.findUnique({ where: { id }, include: { _count: { select: { blocks: true } } } });
  if (!media) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (media._count.blocks > 0) {
    return NextResponse.json({ error: "İçerikte kullanılıyor; önce ilgili bloktan kaldırın." }, { status: 409 });
  }

  // Önce dosyayı sil (yoksa yoksay), sonra kaydı.
  if (media.url.startsWith("/uploads/")) {
    const fname = path.basename(media.url);
    await fs.unlink(path.join(UPLOAD_DIR, fname)).catch(() => {});
  }
  await prisma.media.delete({ where: { id } });
  await audit(session.email, "delete", "Media", id, media.url);

  return NextResponse.json({ ok: true });
}
