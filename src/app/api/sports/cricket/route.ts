import { NextResponse } from "next/server";

/**
 * SportScore Cricket API route.
 * Fetches live and recent cricket matches from SportScore (free, no API key).
 * Attribution required: "Powered by SportScore" link.
 */

interface SportScoreMatch {
  home: string;
  away: string;
  home_score: string | null;
  away_score: string | null;
  status: string;
  status_text: string;
  time: string;
  competition: string;
  url: string;
}

interface SportScoreResponse {
  sport: string;
  count: number;
  matches: SportScoreMatch[];
}

const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

// Only ICC international competitions
const INTERNATIONAL_KEYWORDS = [
  "world",
  "cup",
  "icc",
  "series",
  "international",
  "test series",
  "odi series",
  "t20 series",
];

function isInternationalMatch(competition: string): boolean {
  const lower = competition.toLowerCase();
  return INTERNATIONAL_KEYWORDS.some((kw) => lower.includes(kw));
}

export async function GET() {
  try {
    const res = await fetch(
      "https://sportscore.com/api/widget/matches/?sport=cricket&limit=50",
      { next: { revalidate: 60 } }
    );

    if (!res.ok) {
      return NextResponse.json({ matches: [] }, { status: 502 });
    }

    const data: SportScoreResponse = await res.json();
    const events = data.matches || [];
    const now = Date.now();

    const matches = events
      .filter((match) => {
        // Only ICC international matches
        if (!isInternationalMatch(match.competition)) return false;

        // Include live matches
        if (match.status === "live" || match.status === "inprogress") return true;
        // Include finished matches from the past 7 days
        if (match.status === "finished" && match.time) {
          const matchDate = new Date(match.time).getTime();
          return now - matchDate < MAX_AGE_MS;
        }
        // Include upcoming matches (within next 2 hours)
        if (match.status === "upcoming" && match.time) {
          const matchDate = new Date(match.time).getTime();
          return matchDate - now < 2 * 60 * 60 * 1000 && matchDate > now;
        }
        return false;
      })
      .map((match) => {
        const isLive = match.status === "live" || match.status === "inprogress";

        return {
          id: `cricket-${match.url}`,
          league: match.competition || "Cricket",
          homeTeam: match.home || "TBD",
          homeScore: match.home_score || "",
          awayTeam: match.away || "TBD",
          awayScore: match.away_score || "",
          status: match.status_text || match.status,
          live: isLive,
        };
      });

    // Sort: live first, then by recency
    matches.sort((a, b) => {
      if (a.live && !b.live) return -1;
      if (!a.live && b.live) return 1;
      return 0;
    });

    return NextResponse.json({ matches });
  } catch {
    return NextResponse.json({ matches: [] }, { status: 500 });
  }
}
