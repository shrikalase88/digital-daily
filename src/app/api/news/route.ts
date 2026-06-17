import { NextRequest, NextResponse } from "next/server";
import { aggregateNews } from "@/lib/feeds";
import type { Category } from "@/lib/types";

export const dynamic = "force-dynamic";

// In-memory cache for news (serverless function lifetime)
let cachedData: { articles: ReturnType<typeof aggregateNews> extends Promise<infer T> ? T : never; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") as Category | null;

    // Use cached data if available and fresh
    const now = Date.now();
    if (cachedData && now - cachedData.timestamp < CACHE_TTL) {
      const articles = cachedData.articles;
      const data = category
        ? { articles: articles.filter((a) => a.category === category), category }
        : { articles };

      return NextResponse.json(data, {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
          "X-Cache": "HIT",
        },
      });
    }

    // Fetch fresh data
    const articles = await aggregateNews();
    
    // Update cache
    cachedData = { articles, timestamp: now };

    const data = category
      ? { articles: articles.filter((a) => a.category === category), category }
      : { articles };

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        "X-Cache": "MISS",
      },
    });
  } catch (error) {
    console.error("News API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch news" },
      { status: 500 }
    );
  }
}
