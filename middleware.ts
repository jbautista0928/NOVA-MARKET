import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const COOKIE_NAME = "novamarket_admin_session";

function expectedToken() {
  const secret = process.env.ADMIN_SESSION_SECRET || "fallback-secret-change-me";
  return crypto
    .createHash("sha256")
    .update(secret + process.env.ADMIN_PASSWORD)
    .digest("hex");
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminRoute = pathname.startsWith("/admin") && pathname !== "/admin/login";
  if (!isAdminRoute) return NextResponse.next();

  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token || token !== expectedToken()) {
    const loginUrl = new URL("/admin/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
