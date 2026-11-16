"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { TrendingUp, MapPin } from "lucide-react";
import type { WeatherData } from "@/lib/types";
import { useWeatherLocation } from "@/hooks/use-weather-location";
import LocationModal from "@/components/location-modal";

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
  f1: "bg-sky-400",
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

export function LiveSportsTicker({
  onOpenPulse,
  onOpenLocation,
}: {
  onOpenPulse?: () => void;
  onOpenLocation?: () => void;
}) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [stocks, setStocks] = useState<StocksResponse | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [, startTransition] = useTransition();
  const { location } = useWeatherLocation();

  const fetchWeather = useCallback(async () => {
    try {
      let url = "/api/weather/fallback";
      if (location?.lat && location?.lon) {
        url += `?lat=${location.lat}&lon=${location.lon}&city=${encodeURIComponent(
          location.city
        )}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        startTransition(() => {
          setWeather(data);
        });
      }
    } catch {
      /* ignore */
    }
  }, [location, startTransition]);

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

    let stockData: StocksResponse | null = null;
    // 2. Fetch Stocks
    try {
      const stockRes = await fetch("/api/stocks");
      if (stockRes.ok) {
        stockData = await stockRes.json();
      }
    } catch {
      /* ignore */
    }

    // 3. Fetch Weather
    await fetchWeather();

    startTransition(() => {
      setMatches(allMatches);
      if (stockData) setStocks(stockData);
      setLoading(false);
    });
  }, [fetchWeather, startTransition]);

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

  const handleLocationClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenLocation) {
      onOpenLocation();
    } else {
      setLocationModalOpen(true);
    }
  };

  return (
    <>
      <div className="w-full bg-[#09090b]/85 backdrop-blur-xl border-y border-white/[0.06] py-1.5 transition-colors">
        <div className="mx-auto max-w-7xl 2xl:max-w-[1536px] px-4 sm:px-6 lg:px-8">
          <div
            className="relative overflow-hidden"
            style={{
              maskImage:
                "linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent)",
              WebkitMaskImage:
                "linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent)",
            }}
          >
            {loading && matches.length === 0 && !stocks && !weather ? (
              /* Stable Skeleton to prevent CLS layout shift */
              <div className="flex items-center gap-2 py-0.5 overflow-hidden animate-pulse">
                <div className="h-7 w-36 rounded-full bg-white/[0.05]" />
                <div className="h-7 w-32 rounded-full bg-white/[0.05]" />
                <div className="h-7 w-32 rounded-full bg-white/[0.05]" />
                <div className="h-7 w-44 rounded-full bg-white/[0.05]" />
              </div>
            ) : (
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-0.5">
                {/* ── 1. Live Weather Pill with Location Change ── */}
                {weather && (
                  <div className="flex flex-shrink-0 items-center rounded-full border border-sky-500/25 bg-sky-950/20 px-2.5 py-1 text-left group">
                    <button
                      onClick={onOpenPulse}
                      className="flex items-center gap-1.5 hover:opacity-85 transition-opacity"
                      title="View weather details"
                    >
                      <span className="text-sm">{weather.icon || "☀️"}</span>
                      <span className="font-mono text-[11px] font-semibold text-zinc-100">
                        {weather.temperature}°C
                      </span>
                    </button>

                    <button
                      onClick={handleLocationClick}
                      className="ml-1.5 flex items-center gap-1 rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] font-medium text-sky-300 hover:bg-sky-500/20 hover:text-white transition-all active:scale-[0.97]"
                      title="Change city or auto-detect location"
                      aria-label="Change city or auto-detect location"
                    >
                      <MapPin size={10} className="text-sky-400 shrink-0" />
                      <span className="truncate max-w-[85px] sm:max-w-[110px]">
                        {weather.city}
                      </span>
                    </button>
                  </div>
                )}

                {/* ── 2. BSE Sensex Market Index Pill ── */}
                {stocks?.bse && (
                  <button
                    onClick={onOpenPulse}
                    className="flex flex-shrink-0 items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-950/20 hover:bg-emerald-950/35 px-3 py-1 transition-all text-left active:scale-[0.98]"
                  >
                    <TrendingUp
                      size={12}
                      className={
                        stocks.bse.change >= 0 ? "text-emerald-400" : "text-rose-400"
                      }
                    />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                      SENSEX
                    </span>
                    <span className="font-mono text-[11px] font-semibold text-zinc-100 tabular-nums">
                      {stocks.bse.price.toLocaleString("en-IN", {
                        maximumFractionDigits: 0,
                      })}
                    </span>
                    <span
                      className={`text-[10px] font-semibold ${
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
                    className="flex flex-shrink-0 items-center gap-2 rounded-full border border-teal-500/20 bg-teal-950/20 hover:bg-teal-950/35 px-3 py-1 transition-all text-left active:scale-[0.98]"
                  >
                    <TrendingUp
                      size={12}
                      className={
                        stocks.nse.change >= 0 ? "text-teal-400" : "text-rose-400"
                      }
                    />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300">
                      NIFTY 50
                    </span>
                    <span className="font-mono text-[11px] font-semibold text-zinc-100 tabular-nums">
                      {stocks.nse.price.toLocaleString("en-IN", {
                        maximumFractionDigits: 0,
                      })}
                    </span>
                    <span
                      className={`text-[10px] font-semibold ${
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
                    className="flex flex-shrink-0 items-center gap-2 rounded-full border border-white/[0.08] bg-[#121217]/90 px-3 py-1 transition-all hover:border-white/[0.18]"
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                        SPORT_DOT_COLORS[match.sport]
                      } ${match.live ? "animate-pulse" : "opacity-40"}`}
                    />

                    <span className="text-[9px] font-bold tracking-wider text-zinc-400 uppercase shrink-0">
                      {SPORT_LABELS[match.sport]}
                    </span>

                    <span className="text-[11px] font-medium text-zinc-200 shrink-0">
                      {match.homeTeam}
                    </span>
                    <span className="font-mono text-xs font-semibold text-white tabular-nums shrink-0">
                      {match.homeScore}
                    </span>
                    <span className="text-zinc-500 text-[10px] shrink-0">vs</span>
                    <span className="font-mono text-xs font-semibold text-white tabular-nums shrink-0">
                      {match.awayScore}
                    </span>
                    <span className="text-[11px] font-medium text-zinc-200 shrink-0">
                      {match.awayTeam}
                    </span>

                    <div
                      className={`shrink-0 rounded-md px-1.5 py-0.5 text-[9px] font-bold border ${
                        match.live
                          ? "bg-rose-500/20 border-rose-500/30 text-rose-300"
                          : "bg-white/[0.04] border-white/10 text-zinc-400"
                      }`}
                    >
                      {match.status}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <LocationModal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        onLocationSelected={() => fetchWeather()}
      />
    </>
  );
}
