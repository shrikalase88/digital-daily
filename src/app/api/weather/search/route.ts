import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export interface GeoSearchResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  countryCode?: string;
  admin1?: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      q
    )}&count=8&language=en&format=json`;

    const res = await fetch(url, {
      headers: { "User-Agent": "DigitalDaily/1.0" },
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      return NextResponse.json({ results: [] });
    }

    const data = await res.json();
    const results: GeoSearchResult[] = (data.results || []).map(
      (item: Record<string, unknown>) => ({
        id: item.id as number,
        name: item.name as string,
        latitude: item.latitude as number,
        longitude: item.longitude as number,
        country: (item.country as string) || "",
        countryCode: (item.country_code as string) || "",
        admin1: (item.admin1 as string) || "",
      })
    );

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Geocoding search error:", error);
    return NextResponse.json({ results: [], error: "Search failed" }, { status: 500 });
  }
}
