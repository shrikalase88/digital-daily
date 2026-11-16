"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Search,
  Crosshair,
  X,
  Check,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { useWeatherLocation, type UserLocation } from "@/hooks/use-weather-location";

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelected?: (loc: UserLocation) => void;
}

interface SearchCityItem {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  countryCode?: string;
  admin1?: string;
}

const POPULAR_CITIES: Array<{
  name: string;
  country: string;
  lat: number;
  lon: number;
}> = [
  { name: "New York", country: "United States", lat: 40.7128, lon: -74.006 },
  { name: "London", country: "United Kingdom", lat: 51.5074, lon: -0.1278 },
  { name: "Tokyo", country: "Japan", lat: 35.6762, lon: 139.6503 },
  { name: "Mumbai", country: "India", lat: 19.076, lon: 72.8777 },
  { name: "San Francisco", country: "United States", lat: 37.7749, lon: -122.4194 },
  { name: "Paris", country: "France", lat: 48.8566, lon: 2.3522 },
  { name: "Singapore", country: "Singapore", lat: 1.3521, lon: 103.8198 },
  { name: "Dubai", country: "United Arab Emirates", lat: 25.2048, lon: 55.2708 },
  { name: "Sydney", country: "Australia", lat: -33.8688, lon: 151.2093 },
  { name: "Berlin", country: "Germany", lat: 52.52, lon: 13.405 },
];

export default function LocationModal({
  isOpen,
  onClose,
  onLocationSelected,
}: LocationModalProps) {
  const { location, setLocation, clearLocation, detectLocation, isDetecting } =
    useWeatherLocation();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchCityItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [detectStatus, setDetectStatus] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Debounced search query
  const handleQueryChange = (text: string) => {
    setQuery(text);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (text.trim().length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/weather/search?q=${encodeURIComponent(text.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
        } else {
          setResults([]);
        }
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 250);
  };

  const handleSelectCity = (city: {
    name: string;
    country?: string;
    lat: number;
    lon: number;
  }) => {
    const newLoc: UserLocation = {
      city: city.name,
      country: city.country,
      lat: city.lat,
      lon: city.lon,
      isAuto: false,
    };
    setLocation(newLoc);
    onLocationSelected?.(newLoc);
    onClose();
  };

  const handleAutoDetect = async () => {
    setDetectStatus("Detecting your location via GPS/Network...");
    const res = await detectLocation();
    if (res) {
      setDetectStatus(`Detected: ${res.city}`);
      onLocationSelected?.(res);
      setTimeout(() => {
        onClose();
      }, 400);
    } else {
      setDetectStatus("Could not detect automatically. Try searching below.");
    }
  };

  const handleResetToAuto = () => {
    clearLocation();
    handleAutoDetect();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-md"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 8 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-[#121217] p-5 sm:p-6 shadow-2xl z-10 text-white"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <MapPin size={16} />
              </div>
              <div>
                <h3 className="text-sm font-semibold tracking-tight text-white">
                  Weather Location
                </h3>
                <p className="text-[11px] text-zinc-400">
                  {location
                    ? `Current: ${location.city}${
                        location.country ? `, ${location.country}` : ""
                      } (${location.isAuto ? "Auto-detected" : "Custom"})`
                    : "Auto-detecting via network proxy..."}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 border border-white/10 text-zinc-400 hover:text-white transition-colors"
              aria-label="Close dialog"
            >
              <X size={15} />
            </button>
          </div>

          {/* Auto-Detect Action Row */}
          <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 rounded-2xl bg-zinc-900/60 p-3 border border-white/[0.06]">
            <button
              onClick={handleAutoDetect}
              disabled={isDetecting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 px-3.5 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/25 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isDetecting ? (
                <Loader2 size={14} className="animate-spin text-cyan-400" />
              ) : (
                <Crosshair size={14} className="text-cyan-400" />
              )}
              <span>{isDetecting ? "Detecting GPS & IP..." : "Auto-Detect My Location"}</span>
            </button>

            {location && !location.isAuto && (
              <button
                onClick={handleResetToAuto}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/10 active:scale-[0.98] transition-all"
              >
                <RotateCcw size={13} />
                <span>Reset to Auto</span>
              </button>
            )}
          </div>

          {detectStatus && (
            <p className="mt-2 text-[11px] text-cyan-300 font-medium px-1">
              {detectStatus}
            </p>
          )}

          {/* Search Input (16px to prevent iOS Safari auto-zoom) */}
          <div className="relative mt-4">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Search any city or country (e.g. London, Mumbai, Tokyo)..."
              style={{ fontSize: "16px" }}
              className="w-full rounded-2xl bg-zinc-900/80 border border-white/10 py-2.5 pl-10 pr-10 text-[16px] text-white placeholder:text-zinc-500 outline-none transition-all focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
            />
            {isSearching && (
              <Loader2
                size={14}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin text-zinc-400"
              />
            )}
            {query && !isSearching && (
              <button
                type="button"
                onClick={() => handleQueryChange("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Search Autocomplete Results */}
          {results.length > 0 && (
            <div className="mt-3 max-h-48 overflow-y-auto space-y-1 rounded-2xl border border-white/10 bg-zinc-900/90 p-1.5 no-scrollbar">
              {results.map((item) => (
                <button
                  key={`${item.id}-${item.latitude}`}
                  onClick={() =>
                    handleSelectCity({
                      name: item.name,
                      country: item.country,
                      lat: item.latitude,
                      lon: item.longitude,
                    })
                  }
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs text-zinc-200 hover:bg-white/10 hover:text-white transition-colors group"
                >
                  <div className="min-w-0 flex-1">
                    <span className="font-semibold text-white">{item.name}</span>
                    <span className="ml-1.5 text-zinc-400">
                      {[item.admin1, item.country].filter(Boolean).join(", ")}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-500 group-hover:text-cyan-400 font-mono">
                    Select →
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Popular Cities Chips */}
          <div className="mt-5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Popular Hubs
            </span>
            <div className="mt-2 flex flex-wrap gap-1.5 max-h-32 overflow-y-auto no-scrollbar">
              {POPULAR_CITIES.map((c) => {
                const isSelected =
                  location?.city?.toLowerCase() === c.name.toLowerCase();
                return (
                  <button
                    key={c.name}
                    onClick={() => handleSelectCity(c)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border transition-all ${
                      isSelected
                        ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300 shadow-sm"
                        : "bg-white/[0.04] border-white/[0.08] text-zinc-300 hover:bg-white/[0.08] hover:text-white"
                    }`}
                  >
                    <span>{c.name}</span>
                    {isSelected && <Check size={11} className="text-cyan-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
