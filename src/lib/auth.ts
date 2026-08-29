import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "admin_token";
const TOKEN_TTL_MS = 1000 * 60 * 60 * 12; // 12 horas

/**
 * Auth MVP del panel admin:
 * cookie firmada con HMAC-SHA256 usando ADMIN_PASSWORD como secreto.
 * Suficiente para un panel interno; sustituible por NextAuth en V1.
 */

export function signToken(): string {
  const secret = process.env.ADMIN_PASSWORD ?? "cambia-este-secreto";
  const payload = `${Date.now()}`;
  const sig = createHmac("sha256", secret).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function verifyToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const secret = process.env.ADMIN_PASSWORD ?? "cambia-este-secreto";
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;

  // expiración
  const ts = Number(payload);
  if (!Number.isFinite(ts) || Date.now() - ts > TOKEN_TTL_MS) return false;

  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export { COOKIE_NAME };
