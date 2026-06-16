import { NextResponse } from "next/server";

/**
 * ESPN NBA API route.
 * Fetches live matches and recent results from the NBA scoreboard.
 */

interface EspnEvent {
  id: string;
  name?: string;
  date?: string;
  competitions?: Array<{
    competitors: Array<{
      homeAway?: string;
      team?: { abbreviation?: string; shortDisplayName?: string };
      score?: string;
    }>;
    status?: {
      type?: {
        state?: string;
        completed?: boolean;
        detail?: string;
        shortDetail?: string;
      };
      displayClock?: string;
      period?: number;
    };
  }>;
}

const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function GET() {
  try {
    const res = await fetch(
      "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard",
      { next: { revalidate: 60 } }
    );

    if (!res.ok) {
      return NextResponse.json({ matches: [] }, { status: 502 });
    }

    const data = await res.json();
    const events: EspnEvent[] = data.events || [];
    const now = Date.now();

    const matches = events
      .filter((event) => {
        const comp = event.competitions?.[0];
        const state = comp?.status?.type?.state;
        // Include live matches
        if (state === "in") return true;
        // Include completed matches from the past 24 hours
        if (state === "post" && event.date) {
          const matchDate = new Date(event.date).getTime();
          return now - matchDate < MAX_AGE_MS;
        }
        // Include upcoming matches (within next 2 hours)
        if (state === "pre" && event.date) {
          const matchDate = new Date(event.date).getTime();
          return matchDate - now < 2 * 60 * 60 * 1000 && matchDate > now;
        }
        return false;
      })
      .map((event) => {
        const comp = event.competitions?.[0];
        const teams = comp?.competitors || [];
        const home = teams.find((t) => t.homeAway === "home");
        const away = teams.find((t) => t.homeAway === "away");
        const state = comp?.status?.type?.state;

        return {
          id: `nba-${event.id}`,
          league: "NBA",
          homeTeam:
            home?.team?.abbreviation ||
            home?.team?.shortDisplayName ||
            "TBD",
          homeScore: home?.score || "0",
          awayTeam:
            away?.team?.abbreviation ||
            away?.team?.shortDisplayName ||
            "TBD",
          awayScore: away?.score || "0",
          status:
            comp?.status?.type?.shortDetail ||
            comp?.status?.type?.detail ||
            "",
          live: state === "in",
        };
      });

    // Sort: live first
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
