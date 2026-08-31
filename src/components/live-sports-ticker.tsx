"use client";

import { useState, useEffect, useCallback } from "react";
import { TrendingUp } from "lucide-react";
import type { WeatherData } from "@/lib/types";

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

interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

interface StocksResponse {
  bse?: StockData;
  nse?: StockData;
  marketStatus?: string;
  marketStatusLabel?: string;
}

const SPORT_LABELS: Record<Match["sport"], string> = {
  cricket: "CRICKET",
  football: "FOOTBALL",
  f1: "F1",
  nba: "NBA",
};

const SPORT_DOT_COLORS: Record<Match["sport"], string> = {
  cricket: "bg-emerald-400",
  football: "bg-rose-400",
  f1: "bg-cyan-400",
  nba: "bg-amber-400",
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

export function LiveSportsTicker({ onOpenPulse }: { onOpenPulse?: () => void }) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [stocks, setStocks] = useState<StocksResponse | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAllData = useCallback(async () => {
    // 1. Fetch Sports
    const sportsResults = await Promise.allSettled([
      fetchSport("/api/sports/cricket", "cricket"),
      fetchSport("/api/sports/football", "football"),
      fetchSport("/api/sports/f1", "f1"),
      fetchSport("/api/sports/nba", "nba"),
    ]);

    const allMatches: Match[] = [];
    for (const r of sportsResults) {
      if (r.status === "fulfilled") allMatches.push(...r.value);
    }
    allMatches.sort((a, b) => {
      if (a.live && !b.live) return -1;
      if (!a.live && b.live) return 1;
      return 0;
    });
    setMatches(allMatches);

    // 2. Fetch Stocks
    try {
      const stockRes = await fetch("/api/stocks");
      if (stockRes.ok) {
        const stockData = await stockRes.json();
        setStocks(stockData);
      }
    } catch { /* ignore */ }

    // 3. Fetch Weather
    try {
      const weatherRes = await fetch("/api/weather/fallback");
      if (weatherRes.ok) {
        const weatherData = await weatherRes.json();
        setWeather(weatherData);
      }
    } catch { /* ignore */ }

    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAllData();
    }, 0);
    const interval = setInterval(fetchAllData, REFRESH_INTERVAL);

    function handleVisibility() {
      if (document.visibilityState === "visible") {
        fetchAllData();
      }
    }
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [fetchAllData]);

  if (loading && matches.length === 0 && !stocks && !weather) return null;

  return (
    <div className="mx-auto max-w-7xl 2xl:max-w-[1536px] px-4 py-2 sm:px-6 lg:px-8">
      <div
        className="relative overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 24px, black calc(100% - 24px), transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 24px, black calc(100% - 24px), transparent)",
        }}
      >
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-0.5">
          {/* ── 1. Live Weather Pill (Apple Glance Style) ── */}
          {weather && (
            <button
              onClick={onOpenPulse}
              className="flex flex-shrink-0 items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-950/20 hover:bg-cyan-950/40 backdrop-blur-md px-3 py-1.5 transition-all text-left group"
            >
              <span className="text-sm">{weather.icon || "☀️"}</span>
              <span className="text-[11px] font-bold text-white/90">
                {weather.temperature}°C
              </span>
              <span className="text-[10px] text-cyan-300 font-medium truncate max-w-[110px]">
                {weather.city}
              </span>
              <span className="text-[9px] text-white/30 hidden sm:inline">· {weather.description}</span>
            </button>
          )}

          {/* ── 2. BSE Sensex Market Index Pill ── */}
          {stocks?.bse && (
            <button
              onClick={onOpenPulse}
              className="flex flex-shrink-0 items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-950/20 hover:bg-emerald-950/40 backdrop-blur-md px-3 py-1.5 transition-all text-left group"
            >
              <TrendingUp size={12} className={stocks.bse.change >= 0 ? "text-emerald-400" : "text-rose-400"} />
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300">
                BSE SENSEX
              </span>
              <span className="font-mono text-[11px] font-bold text-white tabular-nums">
                {stocks.bse.price.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </span>
              <span
                className={`text-[10px] font-bold ${
                  stocks.bse.change >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {stocks.bse.change >= 0 ? "+" : ""}
                {stocks.bse.changePercent.toFixed(2)}%
              </span>
            </button>
          )}

          {/* ── 3. NSE Nifty Market Index Pill ── */}
          {stocks?.nse && (
            <button
              onClick={onOpenPulse}
              className="flex flex-shrink-0 items-center gap-2 rounded-full border border-teal-500/20 bg-teal-950/20 hover:bg-teal-950/40 backdrop-blur-md px-3 py-1.5 transition-all text-left group"
            >
              <TrendingUp size={12} className={stocks.nse.change >= 0 ? "text-teal-400" : "text-rose-400"} />
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-300">
                NIFTY 50
              </span>
              <span className="font-mono text-[11px] font-bold text-white tabular-nums">
                {stocks.nse.price.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </span>
              <span
                className={`text-[10px] font-bold ${
                  stocks.nse.change >= 0 ? "text-teal-400" : "text-rose-400"
                }`}
              >
                {stocks.nse.change >= 0 ? "+" : ""}
                {stocks.nse.changePercent.toFixed(2)}%
              </span>
            </button>
          )}

          {/* ── 4. Live Sports Matches ── */}
          {matches.map((match) => (
            <div
              key={match.id}
              className="flex flex-shrink-0 items-center gap-2 rounded-full border border-white/[0.08] bg-[#14121c]/80 px-3 py-1.5 transition-all hover:border-white/[0.16]"
            >
              <span
                className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                  SPORT_DOT_COLORS[match.sport]
                } ${match.live ? "animate-pulse" : "opacity-50"}`}
              />

              <span className="text-[9px] font-bold tracking-wider text-white/40 uppercase shrink-0">
                {SPORT_LABELS[match.sport]}
              </span>

              <span className="text-[11px] font-bold text-white/85 shrink-0">
                {match.homeTeam}
              </span>
              <span className="font-mono text-xs font-bold text-white tabular-nums shrink-0">
                {match.homeScore}
              </span>
              <span className="text-white/25 text-[10px] shrink-0">vs</span>
              <span className="font-mono text-xs font-bold text-white tabular-nums shrink-0">
                {match.awayScore}
              </span>
              <span className="text-[11px] font-bold text-white/85 shrink-0">
                {match.awayTeam}
              </span>

              <div
                className={`shrink-0 rounded-md px-1.5 py-0.5 text-[9px] font-bold border ${
                  match.live
                    ? "bg-rose-500/20 border-rose-500/30 text-rose-300"
                    : "bg-white/5 border-white/10 text-white/40"
                }`}
              >
                {match.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
