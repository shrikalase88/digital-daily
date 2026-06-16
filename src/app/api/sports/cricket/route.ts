import { NextResponse } from "next/server";

/**
 * ESPN Cricket API route.
 * Fetches live matches and recent results from multiple cricket leagues.
 * ESPN uses numeric league IDs for cricket.
 */

interface EspnEvent {
  id: string;
  name?: string;
  date?: string;
  competitions?: Array<{
    competitors: Array<{
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

interface EspnResponse {
  events?: EspnEvent[];
  leagues?: Array<{ name?: string; abbreviation?: string }>;
}

// Key cricket leagues with their ESPN numeric IDs
const CRICKET_LEAGUES = [
  { id: "8039", label: "Cricket WC" },
  { id: "8048", label: "IPL" },
  { id: "8037", label: "Champions Trophy" },
  { id: "8044", label: "Big Bash" },
  { id: "8043", label: "Sheffield Shield" },
  { id: "8053", label: "T20 Blast" },
];

const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function GET() {
  try {
    const fetches = CRICKET_LEAGUES.map(async (league) => {
      try {
        const res = await fetch(
          `https://site.api.espn.com/apis/site/v2/sports/cricket/${league.id}/scoreboard`,
          { next: { revalidate: 60 } }
        );
        if (!res.ok) return [];

        const data: EspnResponse = await res.json();
        const events = data.events || [];
        const now = Date.now();

        return events
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
            const competitors = comp?.competitors || [];
            const team1 = competitors[0];
            const team2 = competitors[1];
            const state = comp?.status?.type?.state;

            return {
              id: `cricket-${league.id}-${event.id}`,
              league:
                data.leagues?.[0]?.abbreviation ||
                data.leagues?.[0]?.name ||
                league.label,
              homeTeam:
                team1?.team?.abbreviation ||
                team1?.team?.shortDisplayName ||
                "TBD",
              homeScore: team1?.score || "",
              awayTeam:
                team2?.team?.abbreviation ||
                team2?.team?.shortDisplayName ||
                "TBD",
              awayScore: team2?.score || "",
              status:
                comp?.status?.type?.shortDetail ||
                comp?.status?.type?.detail ||
                "",
              live: state === "in",
            };
          });
      } catch {
        return [];
      }
    });

    const results = await Promise.allSettled(fetches);
    const matches = results.flatMap((r) =>
      r.status === "fulfilled" ? r.value : []
    );

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
