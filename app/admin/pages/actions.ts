"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { routing } from "@/i18n/routing";
import { blockDef, localizedFieldDefs, propDefs } from "@/lib/cms-blocks";

function bust() {
  revalidatePath("/", "layout");
}

export async function createPage(formData: FormData) {
  const session = await requireAdmin();
  const slug = String(formData.get("slug") || "").trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
  const title = String(formData.get("title") || "").trim();
  if (!slug) return;
  const existing = await prisma.page.findUnique({ where: { slug } });
  if (existing) redirect(`/admin/pages/${existing.id}`);
  const page = await prisma.page.create({ data: { slug, title: title || slug, managed: false, published: true } });
  await audit(session.email, "create", "Page", page.id, `Sayfa oluşturuldu: ${slug}`);
  redirect(`/admin/pages/${page.id}`);
}

export async function updatePageMeta(formData: FormData) {
  const session = await requireAdmin();
  const id = String(formData.get("id"));
  const title = String(formData.get("title") || "").trim();
  const published = formData.get("published") === "on";
  const managed = formData.get("managed") === "on";
  await prisma.page.update({ where: { id }, data: { title: title || null, published, managed } });
  await audit(session.email, "update", "Page", id, `Sayfa ayarı: published=${published} managed=${managed}`);
  bust();
}

export async function deletePage(formData: FormData) {
  const session = await requireAdmin();
  const id = String(formData.get("id"));
  const page = await prisma.page.findUnique({ where: { id } });
  await prisma.page.delete({ where: { id } });
  await audit(session.email, "delete", "Page", id, `Sayfa silindi: ${page?.slug}`);
  bust();
  redirect("/admin/pages");
}

export async function addBlock(formData: FormData) {
  const session = await requireAdmin();
  const pageId = String(formData.get("pageId"));
  const type = String(formData.get("type"));
  if (!blockDef(type)) return;
  const last = await prisma.contentBlock.findFirst({ where: { pageId }, orderBy: { order: "desc" } });
  const order = (last?.order ?? -1) + 1;
  // count içeren tipler için varsayılan props.
  const def = blockDef(type)!;
  const props: Record<string, unknown> = {};
  for (const p of def.props) if (p.default !== undefined) props[p.name] = p.default;
  const block = await prisma.contentBlock.create({ data: { pageId, type, order, props: props as unknown as Prisma.InputJsonValue } });
  await audit(session.email, "create", "ContentBlock", block.id, `Blok eklendi: ${type}`);
  bust();
}

export async function moveBlock(formData: FormData) {
  await requireAdmin();
  const blockId = String(formData.get("blockId"));
  const dir = String(formData.get("dir"));
  const block = await prisma.contentBlock.findUnique({ where: { id: blockId } });
  if (!block || !block.pageId) return;
  const neighbor = await prisma.contentBlock.findFirst({
    where: {
      pageId: block.pageId,
      order: dir === "up" ? { lt: block.order } : { gt: block.order },
    },
    orderBy: { order: dir === "up" ? "desc" : "asc" },
  });
  if (!neighbor) return;
  await prisma.$transaction([
    prisma.contentBlock.update({ where: { id: block.id }, data: { order: neighbor.order } }),
    prisma.contentBlock.update({ where: { id: neighbor.id }, data: { order: block.order } }),
  ]);
  bust();
}

export async function reorderBlocks(formData: FormData) {
  await requireAdmin();
  const ids = String(formData.get("ids") || "").split(",").filter(Boolean);
  if (ids.length === 0) return;
  await prisma.$transaction(ids.map((id, i) => prisma.contentBlock.update({ where: { id }, data: { order: i } })));
  bust();
}

export async function deleteBlock(formData: FormData) {
  const session = await requireAdmin();
  const blockId = String(formData.get("blockId"));
  await prisma.contentBlock.delete({ where: { id: blockId } });
  await audit(session.email, "delete", "ContentBlock", blockId, "Blok silindi");
  bust();
}

export async function updateBlock(formData: FormData) {
  const session = await requireAdmin();
  const blockId = String(formData.get("blockId"));
  const type = String(formData.get("type"));

  // props (p:<name>) — count gibi alanlar dinamik alan setini etkiler.
  const props: Record<string, unknown> = {};
  for (const [k, v] of formData.entries()) {
    if (k.startsWith("p:")) {
      const name = k.slice(2);
      const val = String(v);
      if (val !== "") props[name] = val;
    }
  }
  // Bool prop'lar (checkbox) yoksa false; tanımdan bul.
  const baseDef = blockDef(type);
  if (baseDef) {
    const allProps = propDefs(type, props);
    for (const p of allProps) {
      if (p.kind === "bool") props[p.name] = formData.get(`p:${p.name}`) === "on";
    }
  }

  await prisma.contentBlock.update({ where: { id: blockId }, data: { props: props as unknown as Prisma.InputJsonValue } });

  // Çeviriler (t:<field>:<locale>)
  const fields = localizedFieldDefs(type, props).map((f) => f.name);
  for (const field of fields) {
    for (const locale of routing.locales) {
      const raw = formData.get(`t:${field}:${locale}`);
      if (raw === null) continue;
      const value = String(raw);
      if (value.trim() === "") {
        await prisma.translation.deleteMany({ where: { blockId, field, locale } });
      } else {
        await prisma.translation.upsert({
          where: { blockId_field_locale: { blockId, field, locale } },
          update: { value },
          create: { blockId, field, locale, value },
        });
      }
    }
  }
  await audit(session.email, "update", "ContentBlock", blockId, `Blok güncellendi: ${type}`);
  bust();
}
