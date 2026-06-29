-- CMS blok desteği: Page'e başlık/yönetilen bayrağı, ContentBlock'a doğrudan
-- sayfa ilişkisi + tipsel props; sectionId artık opsiyonel (bloklar doğrudan
-- sayfaya bağlanabilir). Mevcut CMS tabloları boş olduğundan veri kaybı yok.

ALTER TABLE "Page" ADD COLUMN "title" TEXT;
ALTER TABLE "Page" ADD COLUMN "managed" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "ContentBlock" ADD COLUMN "pageId" TEXT;
ALTER TABLE "ContentBlock" ADD COLUMN "props" JSONB;
ALTER TABLE "ContentBlock" ALTER COLUMN "sectionId" DROP NOT NULL;

CREATE INDEX "ContentBlock_pageId_idx" ON "ContentBlock"("pageId");

ALTER TABLE "ContentBlock"
  ADD CONSTRAINT "ContentBlock_pageId_fkey"
  FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;
