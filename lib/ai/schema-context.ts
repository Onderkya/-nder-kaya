/**
 * AI asistanına verilen veritabanı şeması özeti.
 *
 * Prisma model adları varsayılan olarak tabloya birebir yansır; PostgreSQL'de
 * büyük/küçük harf duyarlı olduklarından SQL'de çift tırnakla yazılmalıdır
 * (örn. SELECT ... FROM "Lead"). Hassas alan (User.password hash'i) bilinçli
 * olarak gizlenmiştir; modele verilmez.
 */
export const SCHEMA_CONTEXT = `Veritabanı: PostgreSQL. Tablo ve kolon adları büyük/küçük harf
duyarlıdır — SQL'de daima çift tırnak kullan: FROM "Lead", "createdAt" gibi.

Tablolar ve kolonlar:

"User"(id, email, name, role[ADMIN|EDITOR], "createdAt")
  -- NOT: parola alanı güvenlik gereği gizlidir, sorgulanamaz.
"Page"(id, slug, "order", published, "createdAt", "updatedAt")
"Section"(id, "pageId"→Page.id, key, type, "order")
"ContentBlock"(id, "sectionId"→Section.id, type, "order", "mediaId"→Media.id)
"Translation"(id, "blockId"→ContentBlock.id, field, locale, value)
"SiteText"(id, key, locale, value)   -- site metni override'ları
"Media"(id, url, alt, width, height, "createdAt")
"Service"(id, slug, active, "order")
"LessonType"(id, minutes, price, currency, active, "order")
"AvailabilitySlot"(id, "startsAt", minutes, booked, "createdAt")
"Lead"(id, name, email, phone, service, message, locale, channel[WEB|WHATSAPP|TELEGRAM], status[NEW|CONTACTED|CONFIRMED|DONE|ARCHIVED], "createdAt")
"PromoCode"(id, code, type[PERCENT|AMOUNT], value, active, "validFrom", "validUntil", "usageLimit", "usedCount", "targetSlug", "createdAt")
"PaymentMethod"(id, type[KASPI|CRYPTO], coin, network, address, "qrUrl", active, "order", "createdAt", "updatedAt")
"AuditLog"(id, "actorEmail", action, entity, "entityId", details, "createdAt")
"Conversation"(id, channel, "externalId", locale, "createdAt")
"Message"(id, "conversationId"→Conversation.id, role, content, "createdAt")

İlişkiler oklarla (→) gösterildi. Enum değerleri köşeli parantezde verildi.`;
