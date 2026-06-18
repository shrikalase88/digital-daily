import { NextRequest, NextResponse } from "next/server";
import { aggregateNews } from "@/lib/feeds";
import type { Article, Category } from "@/lib/types";

// Rate limiting configuration
const RATE_LIMIT = {
  windowMs: 60 * 1000, // 1 minute window
  maxRequests: 10, // 10 requests per minute per IP
};

// In-memory stores (use Redis in production)
const requestStore = new Map<string, { count: number; resetTime: number }>();
const cacheStore = new Map<string, { data: unknown; timestamp: number; hits: number }>();

// Cache configuration
const CACHE_TTL = {
  news: 5 * 60 * 1000, // 5 minutes
  sports: 2 * 60 * 1000, // 2 minutes
  weather: 10 * 60 * 1000, // 10 minutes
  stocks: 1 * 60 * 1000, // 1 minute
};

// Cleanup old cache entries periodically
if (global.cacheCleanupInterval) {
  clearInterval(global.cacheCleanupInterval);
}

global.cacheCleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [key, value] of cacheStore.entries()) {
    if (now - value.timestamp > CACHE_TTL.news * 2) {
      cacheStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") || "127.0.0.1";
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetTime: number } {
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

function getCacheKey(category: string | null): string {
  return `news:${category || "all"}`;
}

export async function GET(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit(clientIP);

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") as Category | null;

    // Add rate limit headers to all responses
    const headers = {
      "X-RateLimit-Limit": RATE_LIMIT.maxRequests.toString(),
      "X-RateLimit-Remaining": rateLimit.remaining.toString(),
      "X-RateLimit-Reset": Math.ceil(rateLimit.resetTime / 1000).toString(),
    };

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { 
          status: 429,
          headers: {
            ...headers,
            "Retry-After": Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
            "Cache-Control": "no-store",
          }
        }
      );
    }

    // Check cache with stale-while-revalidate strategy
    const cacheKey = getCacheKey(category);
    const cached = cacheStore.get(cacheKey);
    const now = Date.now();

    if (cached) {
      const age = now - cached.timestamp;
      const isFresh = age < CACHE_TTL.news;
      const isStaleButRevalidatable = age < CACHE_TTL.news * 2; // 2x TTL for stale-while-revalidate

      if (isFresh || isStaleButRevalidatable) {
        // Update cache hit counter
        cached.hits += 1;
        cacheStore.set(cacheKey, cached);

        const articles = cached.data as Article[];
        const filteredArticles = category
          ? articles.filter((a: Article) => a.category === category)
          : articles;

        return NextResponse.json(
          { articles: filteredArticles, category },
          {
            headers: {
              ...headers,
              "Cache-Control": isFresh
                ? `public, s-maxage=${CACHE_TTL.news / 1000}, stale-while-revalidate=${CACHE_TTL.news / 1000}`
                : "public, s-maxage=0, stale-while-revalidate=300",
              "X-Cache": "HIT",
              "X-Cache-Age": Math.floor(age / 1000).toString(),
              "X-Cache-Hits": cached.hits.toString(),
            },
          }
        );
      }
    }

    // Fetch fresh data in background (stale-while-revalidate)
    const articles = await aggregateNews();
    
    // Update cache
    cacheStore.set(cacheKey, {
      data: articles,
      timestamp: now,
      hits: 0,
    });

    const filteredArticles = category
      ? articles.filter((a) => a.category === category)
      : articles;

    return NextResponse.json(
      { articles: filteredArticles, category },
      {
        headers: {
          ...headers,
          "Cache-Control": `public, s-maxage=${CACHE_TTL.news / 1000}, stale-while-revalidate=${CACHE_TTL.news / 1000}`,
          "X-Cache": "MISS",
        },
      }
    );
  } catch (error) {
    console.error("News API error:", error);
    
    // Try to serve stale cache on error
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") as Category | null;
    const cached = cacheStore.get(getCacheKey(category));
    
    if (cached) {
      const articles = cached.data as Article[];
      const filteredArticles = category
        ? articles.filter((a: Article) => a.category === category)
        : articles;

      return NextResponse.json(
        { articles: filteredArticles, category, stale: true },
        {
          headers: {
            "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
            "X-Cache": "STALE_ERROR",
          },
        }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch news" },
      { status: 500 }
    );
  }
}

// Cleanup on module unload
if (typeof process !== "undefined") {
  process.on("exit", () => {
    if (global.cacheCleanupInterval) {
      clearInterval(global.cacheCleanupInterval);
    }
  });
}