import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { jwtVerify } from "jose";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

const ADMIN_COOKIE = "ab_admin";

async function hasValidAdminSession(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!token || !process.env.AUTH_SECRET) return false;
  try {
    await jwtVerify(token, new TextEncoder().encode(process.env.AUTH_SECRET));
    return true;
  } catch {
    return false;
  }
}

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Admin: locale öneki yok, ayrı oturum koruması.
  if (pathname.startsWith("/admin")) {
    const isLogin = pathname === "/admin/login";
    const authed = await hasValidAdminSession(req);
    if (!authed && !isLogin) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    if (authed && isLogin) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return NextResponse.next();
  }

  // API kendi kendini yönetir.
  if (pathname.startsWith("/api")) return NextResponse.next();

  // Geri kalan public yollar için çok dilli yönlendirme.
  return intlMiddleware(req);
}

export const config = {
  matcher: ["/((?!_next|_vercel|.*\\..*).*)"],
};
