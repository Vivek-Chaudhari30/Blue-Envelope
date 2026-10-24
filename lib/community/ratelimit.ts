// Tiny in-memory per-IP rate limiter shared by the community API routes.
// Demo-grade (per server instance). Supabase/edge deploys would use a store.

const BUCKET = new Map<string, { count: number; resetAt: number }>();

export function rateLimited(ip: string, limit = 30, windowMs = 60_000): boolean {
  const now = Date.now();
  const b = BUCKET.get(ip);
  if (!b || now > b.resetAt) {
    BUCKET.set(ip, { count: 1, resetAt: now + windowMs });
    return false;
  }
  b.count += 1;
  return b.count > limit;
}

export function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}
