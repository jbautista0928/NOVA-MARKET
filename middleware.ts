import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "novamarket_admin_session";

// Web Crypto API (compatible con Edge Runtime, a diferencia del
// módulo "crypto" de Node.js que no funciona en middleware).
async function expectedToken(): Promise<string> {
  const secret = process.env.ADMIN_SESSION_SECRET || "fallback-secret-change-me";
  const input = secret + process.env.ADMIN_PASSWORD;

  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminRoute = pathname.startsWith("/admin") && pathname !== "/admin/login";
  if (!isAdminRoute) return NextResponse.next();

  const token = req.cookies.get(COOKIE_NAME)?.value;
  const expected = await expectedToken();

  if (!token || token !== expected) {
    const loginUrl = new URL("/admin/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
