import { NextRequest, NextResponse } from "next/server";
import { aggregateNews } from "@/lib/feeds";
import type { Category } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") as Category | null;

    const articles = await aggregateNews();

    const data = category
      ? {
          articles: articles.filter((a) => a.category === category),
          category,
        }
      : { articles };

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=300",
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
