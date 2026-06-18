"use client";

import { useState, useEffect, useCallback } from "react";

interface Match {
  id: string;
  sport: "cricket" | "football" | "f1" | "nba";
  league: string;
  homeTeam: string;
  homeScore: string;
  awayTeam: string;
  awayScore: string;
  status: string;
  live: boolean;
}

const SPORT_LABELS: Record<Match["sport"], string> = {
  cricket: "CRICKET",
  football: "FOOTBALL",
  f1: "F1",
  nba: "NBA",
};

const SPORT_DOT_COLORS: Record<Match["sport"], string> = {
  cricket: "bg-emerald-500",
  football: "bg-rose-500",
  f1: "bg-cyan-500",
  nba: "bg-amber-500",
};

const REFRESH_INTERVAL = 60000;

async function fetchSport(
  url: string,
  sport: Match["sport"]
): Promise<Match[]> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.matches || []).map(
      (m: Record<string, string | boolean>) => ({
        id: `${sport}-${m.id}`,
        sport,
        league: m.league,
        homeTeam: m.homeTeam,
        homeScore: m.homeScore,
        awayTeam: m.awayTeam,
        awayScore: m.awayScore,
        status: m.status,
        live: Boolean(m.live),
      })
    );
  } catch {
    return [];
  }
}

export function LiveSportsTicker() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllLiveScores = useCallback(async () => {
    const results = await Promise.allSettled([
      fetchSport("/api/sports/cricket", "cricket"),
      fetchSport("/api/sports/football", "football"),
      fetchSport("/api/sports/f1", "f1"),
      fetchSport("/api/sports/nba", "nba"),
    ]);

    const allMatches: Match[] = [];
    for (const r of results) {
      if (r.status === "fulfilled") allMatches.push(...r.value);
    }

    allMatches.sort((a, b) => {
      if (a.live && !b.live) return -1;
      if (!a.live && b.live) return 1;
      return 0;
    });

    setMatches(allMatches);
  }, []);

  useEffect(() => {
    async function init() {
      await fetchAllLiveScores();
      setLoading(false);
    }
    init();

    const interval = setInterval(fetchAllLiveScores, REFRESH_INTERVAL);

    function handleVisibility() {
      if (document.visibilityState === "visible") {
        fetchAllLiveScores();
      }
    }
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [fetchAllLiveScores]);

  if (!loading && matches.length === 0) return null;

  return (
    <div className="w-full py-3 px-4 sm:px-6 lg:px-8 shrink-0">
      <div className="mx-auto flex max-w-7xl items-center gap-3 overflow-x-auto no-scrollbar scroll-smooth w-full">
        {loading && (
          <>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex-shrink-0 h-10 w-64 rounded-full bg-white/[0.06] border border-white/[0.06] animate-pulse"
              />
            ))}
          </>
        )}

        {!loading &&
          matches.map((match) => (
            <div
              key={match.id}
              className="flex items-center flex-shrink-0 gap-2.5 rounded-full border border-white/[0.08] bg-[#16121e]/80 px-4 py-2.5 min-w-max transition-all hover:border-white/[0.16]"
            >
              <span
                className={`h-2 w-2 rounded-full shrink-0 ${
                  SPORT_DOT_COLORS[match.sport]
                } ${match.live ? "animate-pulse" : "opacity-50"}`}
              />

              <span className="text-[10px] font-semibold tracking-widest text-white/30 uppercase shrink-0">
                {SPORT_LABELS[match.sport]}
              </span>

              <span className="text-xs font-bold text-white/80 shrink-0">
                {match.homeTeam}
              </span>
              <span className="font-mono text-sm font-bold text-white tabular-nums shrink-0">
                {match.homeScore}
              </span>
              <span className="text-white/20 text-xs shrink-0">vs</span>
              <span className="font-mono text-sm font-bold text-white tabular-nums shrink-0">
                {match.awayScore}
              </span>
              <span className="text-xs font-bold text-white/80 shrink-0">
                {match.awayTeam}
              </span>

              <div
                className={`shrink-0 rounded-md px-2 py-0.5 text-[11px] font-bold border ${
                  match.live
                    ? "bg-pink-500/20 border-pink-500/30 text-rose-400"
                    : "bg-white/5 border-white/5 text-white/30"
                }`}
              >
                {match.status}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
