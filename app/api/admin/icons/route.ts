import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getIconCatalog } from "@/lib/icon-catalog";

/**
 * FONT AWESOME İKON KATALOĞU — yalnız admin. İkon seçici (client) ilk açılışta
 * lazy fetch eder; @fortawesome paketi burada (server) çözülür, client'a sadece
 * düz `{ name, viewBox, paths, terms }[]` JSON iner. Katalog modül kapsamında
 * önbelleğe alınır; yanıt uzun süre önbelleklenebilir (statik veri).
 */
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.json(
    { icons: getIconCatalog() },
    { headers: { "Cache-Control": "private, max-age=86400" } },
  );
}
