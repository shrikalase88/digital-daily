import { NextRequest } from "next/server";

// Rate limiting configuration
export const RATE_LIMIT = {
  windowMs: 60 * 1000, // 1 minute window
  maxRequests: 10, // 10 requests per minute per IP
};

// Cache TTL configuration (in milliseconds)
export const CACHE_TTL = {
  news: 5 * 60 * 1000, // 5 minutes
  sports: 2 * 60 * 1000, // 2 minutes
  weather: 10 * 60 * 1000, // 10 minutes
  stocks: 1 * 60 * 1000, // 1 minute
};

// In-memory stores (use Redis in production)
export const requestStore = new Map<string, { count: number; resetTime: number }>();
export const cacheStore = new Map<string, { data: unknown; timestamp: number; hits: number }>();

// Global types for Node.js process and intervals
declare global {
  // eslint-disable-next-line no-var
  var cacheCleanupInterval: NodeJS.Timeout | undefined;
}

// Cleanup old cache entries periodically
if (typeof global !== "undefined" && !global.cacheCleanupInterval) {
  global.cacheCleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, value] of cacheStore.entries()) {
      // Remove entries older than 2x their TTL
      const maxAge = CACHE_TTL.news * 2;
      if (now - value.timestamp > maxAge) {
        cacheStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") || "127.0.0.1";
}

export function checkRateLimit(ip: string): RateLimitResult {
  const now = Date.now();
  const client = requestStore.get(ip);

  if (!client || now > client.resetTime) {
    requestStore.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT.windowMs,
    });
    return { allowed: true, remaining: RATE_LIMIT.maxRequests - 1, resetTime: now + RATE_LIMIT.windowMs };
  }

  if (client.count >= RATE_LIMIT.maxRequests) {
    return { allowed: false, remaining: 0, resetTime: client.resetTime };
  }

  client.count += 1;
  requestStore.set(ip, client);
  return { allowed: true, remaining: RATE_LIMIT.maxRequests - client.count, resetTime: client.resetTime };
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  hits: number;
}