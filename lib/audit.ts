import { prisma } from "./db";

/** Hassas yönetim işlemlerini denetim kaydına yazar (sessizce; başarısız olsa da akışı bozmaz). */
export async function audit(
  actorEmail: string,
  action: string,
  entity: string,
  entityId: string | null,
  details?: string
) {
  try {
    await prisma.auditLog.create({
      data: { actorEmail, action, entity, entityId, details: details ?? null },
    });
  } catch {
    // denetim kaydı yazılamazsa işlemi engelleme
  }
}
