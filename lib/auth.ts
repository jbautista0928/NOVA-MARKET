import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const COOKIE_NAME = "novamarket_admin_session";

function expectedToken() {
  // Token derivado de la contraseña de admin + un secreto fijo del servidor.
  // Así nunca se guarda la contraseña en texto plano en la cookie.
  const secret = process.env.ADMIN_SESSION_SECRET || "fallback-secret-change-me";
  return crypto
    .createHash("sha256")
    .update(secret + process.env.ADMIN_PASSWORD)
    .digest("hex");
}

export function checkPassword(password: string): boolean {
  return password === process.env.ADMIN_PASSWORD;
}

export function createSessionToken(): string {
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

  if (!token || token !== expectedToken()) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  return null;
}
