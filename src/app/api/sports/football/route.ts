import { NextResponse } from "next/server";

/**
 * ESPN Football (Soccer) API route.
 * Fetches live matches and recent results from multiple soccer leagues.
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

interface EspnResponse {
  events?: EspnEvent[];
  leagues?: Array<{ name?: string; abbreviation?: string; slug?: string }>;
}

// Major soccer leagues
const SOCCER_LEAGUES = [
  { slug: "fifa.world", label: "FIFA WC" },
  { slug: "eng.1", label: "Premier League" },
  { slug: "esp.1", label: "La Liga" },
  { slug: "ger.1", label: "Bundesliga" },
  { slug: "usa.1", label: "MLS" },
  { slug: "uefa.champions", label: "UCL" },
];

const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function GET() {
  try {
    const fetches = SOCCER_LEAGUES.map(async (league) => {
      try {
        const res = await fetch(
          `https://site.api.espn.com/apis/site/v2/sports/soccer/${league.slug}/scoreboard`,
          { next: { revalidate: 60 } }
        );
        if (!res.ok) return [];

        const data: EspnResponse = await res.json();
        const events = data.events || [];
        const now = Date.now();
        const leagueName =
          data.leagues?.[0]?.abbreviation ||
          data.leagues?.[0]?.name ||
          league.label;

        return events
          .filter((event) => {
            const comp = event.competitions?.[0];
            const state = comp?.status?.type?.state;
            if (state === "in") return true;
            if (state === "post" && event.date) {
              const matchDate = new Date(event.date).getTime();
              return now - matchDate < MAX_AGE_MS;
            }
            if (state === "pre" && event.date) {
              const matchDate = new Date(event.date).getTime();
              return matchDate - now < 2 * 60 * 60 * 1000 && matchDate > now;
            }
            return false;
          })
          .map((event) => {
            const comp = event.competitions?.[0];
            const competitors = comp?.competitors || [];
            const home = competitors.find((c) => c.homeAway === "home");
            const away = competitors.find((c) => c.homeAway === "away");
            const state = comp?.status?.type?.state;

            return {
              id: `football-${league.slug}-${event.id}`,
              league: leagueName,
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
