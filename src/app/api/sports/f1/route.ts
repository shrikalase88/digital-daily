import { NextResponse } from "next/server";

/**
 * ESPN F1 API route.
 * Fetches live sessions and recent race results from the F1 scoreboard.
 */

interface EspnEvent {
  id: string;
  name?: string;
  date?: string;
  competitions?: Array<{
    competitors: Array<{
      athlete?: { shortName?: string };
      team?: { abbreviation?: string; shortDisplayName?: string };
      status?: string;
      order?: number;
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

const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function GET() {
  try {
    const res = await fetch(
      "https://site.api.espn.com/apis/site/v2/sports/racing/f1/scoreboard",
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
        const drivers = (comp?.competitors || []).slice().sort(
          (a, b) => (a.order ?? 99) - (b.order ?? 99)
        );
        const p1 = drivers[0];
        const p2 = drivers[1];
        const state = comp?.status?.type?.state;

        // For F1, show the event name as a compact label
        const eventName = event.name || "F1";
        const shortName =
          eventName.length > 20 ? eventName.slice(0, 18) + "…" : eventName;

        return {
          id: `f1-${event.id}`,
          league: "F1",
          homeTeam:
            p1?.athlete?.shortName ||
            p1?.team?.abbreviation ||
            "P1",
          homeScore: p1 ? `P${p1.order ?? p1.status ?? "1"}` : "",
          awayTeam:
            p2?.athlete?.shortName ||
            p2?.team?.abbreviation ||
            "P2",
          awayScore: p2 ? `P${p2.order ?? p2.status ?? "2"}` : "",
          status:
            comp?.status?.type?.shortDetail ||
            comp?.status?.type?.detail ||
            shortName,
          live: state === "in",
        };
      });

    return NextResponse.json({ matches });
  } catch {
    return NextResponse.json({ matches: [] }, { status: 500 });
  }
}
