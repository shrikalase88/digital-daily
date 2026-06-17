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
    // Include all matches (live + recent results) — server already filters
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

    // Sort: live matches first, then completed
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

    // Refresh immediately when user returns to tab
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
    <div className="w-full border-b border-white/5 bg-slate-950/80 py-2 shrink-0 overflow-hidden">
      <div className="no-scrollbar mx-auto flex max-w-7xl items-center gap-3 overflow-x-auto px-4 sm:px-6 lg:px-8">
        <span className="flex shrink-0 items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-white/30">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400/70" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-400" />
          </span>
          Live
        </span>

        {loading && (
          <>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-8 w-48 shrink-0 animate-pulse rounded-full bg-white/[0.04]"
              />
            ))}
          </>
        )}

        {!loading &&
          matches.map((match) => (
            <div
              key={match.id}
              className="flex shrink-0 items-center gap-2 rounded-full border border-white/5 bg-slate-900 px-3 py-1.5"
            >
              {/* Sport indicator dot — pulses only for live matches */}
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  SPORT_DOT_COLORS[match.sport]
                } ${match.live ? "animate-pulse" : "opacity-50"}`}
              />
              <span className="text-[10px] font-medium text-white/25">
                {match.league}
              </span>
              <span className="text-xs font-bold text-slate-400">
                {match.homeTeam}
              </span>
              <span className="font-mono text-xs font-bold text-white">
                {match.homeScore}
              </span>
              <span className="text-slate-600">vs</span>
              <span className="font-mono text-xs font-bold text-white">
                {match.awayScore}
              </span>
              <span className="text-xs font-bold text-slate-400">
                {match.awayTeam}
              </span>
              {/* Status badge — different style for live vs completed */}
              <span
                className={`rounded px-1.5 py-0.5 font-mono text-[10px] ${
                  match.live
                    ? "bg-pink-500/10 text-pink-400"
                    : "bg-white/5 text-white/30"
                }`}
              >
                {match.status}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}
