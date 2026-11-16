"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { MapPin, RefreshCw, Wind, Droplets } from "lucide-react";
import type { WeatherData } from "@/lib/types";
import { useWeatherLocation } from "@/hooks/use-weather-location";
import LocationModal from "@/components/location-modal";

export default function WeatherWidget({
  compact = false,
}: {
  compact?: boolean;
}) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [, startTransition] = useTransition();
  const { location } = useWeatherLocation();

  const fetchWeather = useCallback(async () => {
    startTransition(() => {
      setLoading(true);
      setError(null);
    });
    try {
      let url = "/api/weather/fallback";
      if (location?.lat && location?.lon) {
        url += `?lat=${location.lat}&lon=${location.lon}&city=${encodeURIComponent(
          location.city
        )}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch weather");
      const data = await res.json();
      startTransition(() => {
        setWeather(data);
        setLoading(false);
        setIsRefreshing(false);
      });
    } catch {
      startTransition(() => {
        setError("Could not load weather");
        setLoading(false);
        setIsRefreshing(false);
      });
    }
  }, [location, startTransition]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchWeather();
    }, 0);
    const interval = setInterval(fetchWeather, 300000); // 5 min
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [fetchWeather]);

  const handleRefresh = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRefreshing(true);
    fetchWeather();
  };

  return (
    <>
      <div className="ios-glass rounded-3xl p-5 border border-white/10 shadow-xl transition-all">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
            <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-300">
              Weather
            </h3>
            {location && !location.isAuto && (
              <span className="rounded-full bg-sky-500/10 border border-sky-500/20 px-1.5 py-0.2 text-[9px] font-medium text-sky-300">
                Custom
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setLocationModalOpen(true)}
              className="inline-flex items-center gap-1 rounded-full bg-white/[0.05] border border-white/10 px-2 py-0.5 text-[10px] font-medium text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Change location"
            >
              <MapPin size={10} className="text-sky-400" />
              <span>Change</span>
            </button>
            <button
              onClick={handleRefresh}
              className="p-1 text-zinc-400 hover:text-white transition-colors"
              aria-label="Refresh weather"
            >
              <RefreshCw
                size={12}
                className={isRefreshing ? "animate-spin text-sky-400" : ""}
              />
            </button>
          </div>
        </div>

        {/* Loading state */}
        {loading && !weather && (
          <div className="flex items-center gap-4 py-2 animate-pulse">
            <div className="h-12 w-12 rounded-2xl bg-white/[0.06]" />
            <div className="space-y-2 flex-1">
              <div className="h-5 w-24 rounded bg-white/[0.06]" />
              <div className="h-3 w-32 rounded bg-white/[0.06]" />
            </div>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="space-y-2.5 py-2">
            <p className="text-xs text-rose-400">{error}</p>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchWeather}
                className="rounded-xl bg-white/[0.06] border border-white/10 px-3 py-1 text-xs text-zinc-200 hover:text-white transition-colors"
              >
                Retry
              </button>
              <button
                onClick={() => setLocationModalOpen(true)}
                className="rounded-xl bg-sky-500/15 border border-sky-500/30 px-3 py-1 text-xs text-sky-300 hover:bg-sky-500/25 transition-colors"
              >
                Pick City
              </button>
            </div>
          </div>
        )}

        {/* Weather data display */}
        {weather && (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-4xl filter drop-shadow-sm">
                  {weather.icon}
                </span>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-mono text-3xl font-light tracking-tight text-white">
                      {weather.temperature}
                    </span>
                    <span className="text-sm font-normal text-zinc-400">°C</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-medium">
                    Feels like {weather.feelsLike}°C
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-xs font-semibold text-zinc-200">
                  {weather.description}
                </p>
                <button
                  onClick={() => setLocationModalOpen(true)}
                  className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-sky-300 hover:text-sky-200 transition-colors"
                >
                  <MapPin size={10} />
                  <span className="max-w-[120px] truncate">{weather.city}</span>
                </button>
              </div>
            </div>

            {!compact && (
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/[0.06]">
                <div className="flex items-center gap-2 rounded-xl bg-white/[0.02] border border-white/[0.04] px-3 py-2">
                  <Droplets size={13} className="text-sky-400 shrink-0" />
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-zinc-400">
                      Humidity
                    </span>
                    <span className="text-xs font-semibold text-zinc-200">
                      {weather.humidity}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-white/[0.02] border border-white/[0.04] px-3 py-2">
                  <Wind size={13} className="text-sky-400 shrink-0" />
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-zinc-400">
                      Wind
                    </span>
                    <span className="text-xs font-semibold text-zinc-200">
                      {weather.windSpeed} km/h
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <LocationModal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        onLocationSelected={() => fetchWeather()}
      />
    </>
  );
}
