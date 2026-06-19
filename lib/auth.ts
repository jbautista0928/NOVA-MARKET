import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "novamarket_admin_session";

// Web Crypto API: funciona tanto en Node.js (API routes) como en
// Edge Runtime (middleware), así el cálculo del token es idéntico
// en ambos lugares.
async function expectedToken(): Promise<string> {
  const secret = process.env.ADMIN_SESSION_SECRET || "fallback-secret-change-me";
  const input = secret + process.env.ADMIN_PASSWORD;

  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function checkPassword(password: string): boolean {
  return password === process.env.ADMIN_PASSWORD;
}

export async function createSessionToken(): Promise<string> {
  return expectedToken();
}

export function getSessionCookieName() {
  return COOKIE_NAME;
}

// Usado dentro de API routes para proteger endpoints de escritura.
export async function requireAdminSession(
  req: NextRequest
): Promise<NextResponse | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const expected = await expectedToken();

  if (!token || token !== expected) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  return null;
}
