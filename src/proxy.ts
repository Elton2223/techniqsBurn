import { NextRequest, NextResponse } from "next/server";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

const LIMITS: Record<string, { max: number; windowMs: number }> = {
  "POST:/api/secrets": { max: 10, windowMs: 60_000 },
  "GET:/api/secrets": { max: 20, windowMs: 60_000 },
};

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap) {
    if (entry.resetAt < now) rateLimitMap.delete(key);
  }
}, 60_000);

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function getRateLimitKey(request: NextRequest): string | null {
  const { pathname } = request.nextUrl;
  const method = request.method;

  if (pathname.startsWith("/api/secrets")) {
    return `${method}:/api/secrets`;
  }
  return null;
}

export function proxy(request: NextRequest) {
  const limitKey = getRateLimitKey(request);
  if (!limitKey) return NextResponse.next();

  const config = LIMITS[limitKey];
  if (!config) return NextResponse.next();

  const ip = getClientIp(request);
  const key = `${limitKey}:${ip}`;
  const now = Date.now();

  const entry = rateLimitMap.get(key);

  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(key, { count: 1, resetAt: now + config.windowMs });
    return NextResponse.next();
  }

  if (entry.count >= config.max) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": retryAfter.toString() },
      }
    );
  }

  entry.count++;
  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
