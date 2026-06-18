"use client";

import { useState, useEffect, useTransition, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import type { WeatherData } from "@/lib/types";

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const fetchFallback = useCallback(() => {
    fetch("/api/weather/fallback")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch weather");
        return res.json();
      })
      .then((data) => {
        startTransition(() => {
          setWeather(data);
          setLoading(false);
        });
      })
      .catch(() => {
        startTransition(() => {
          setError("Could not load weather");
          setLoading(false);
        });
      });
  }, []);

  const fetchWeather = useCallback(() => {
    startTransition(() => {
      setLoading(true);
      setError(null);
    });

    if (!navigator.geolocation) {
      fetchFallback();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetch(`/api/weather?lat=${latitude}&lon=${longitude}`)
          .then((res) => {
            if (!res.ok) throw new Error("Failed to fetch weather");
            return res.json();
          })
          .then((data) => {
            startTransition(() => {
              setWeather(data);
              setLoading(false);
            });
          })
          .catch(() => {
            fetchFallback();
          });
      },
      () => {
        fetchFallback();
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, [fetchFallback]);

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(fetchWeather, 60000);
    return () => clearInterval(interval);
  }, [fetchWeather]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const mouseX = e.clientX - centerX;
      const mouseY = e.clientY - centerY;
      setRotateY(mouseX / 8);
      setRotateX(-mouseY / 8);
    },
    []
  );

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setIsHovered(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="perspective-1000"
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        className="orbit-card cursor-pointer"
        style={{
          transform: isHovered
            ? `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`
            : `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
        }}
      >
        <div className="ios-glass relative rounded-2xl p-6">
          <div className="relative z-10">
            <div className="mb-4 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
                Weather
              </h3>
            </div>

            {loading && (
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 animate-pulse rounded-2xl bg-white/[0.04]" />
                <div className="space-y-2.5 flex-1">
                  <div className="h-5 w-28 animate-pulse rounded bg-white/[0.04]" />
                  <div className="h-3 w-36 animate-pulse rounded bg-white/[0.04]" />
                </div>
              </div>
            )}

            {!loading && error && (
              <div className="space-y-3">
                <p className="text-sm text-red-400/80">{error}</p>
                <button
                  onClick={(e) => { e.stopPropagation(); fetchWeather(); }}
                  className="rounded-lg ios-glass px-3 py-1.5 text-xs text-white/60 hover:text-white/80 transition-all cursor-pointer"
                >
                  Retry
                </button>
              </div>
            )}

            {weather && !loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-4">
                  <motion.span
                    className="text-5xl"
                    animate={
                      isHovered
                        ? { rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }
                        : { rotate: [0, 5, -5, 0] }
                    }
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  >
                    {weather.icon}
                  </motion.span>
                  <div>
                    <motion.p
                      className="text-4xl font-light tracking-tight text-white"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                    >
                      {weather.temperature}
                      <span className="text-lg text-white/40">°C</span>
                    </motion.p>
                    <p className="text-xs text-white/35">
                      Feels like {weather.feelsLike}°C
                    </p>
                  </div>
                </div>

                <p className="text-sm font-medium tracking-wide text-white/70">
                  {weather.description}
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl ios-glass px-3.5 py-2.5">
                    <span className="block text-[10px] uppercase tracking-wider text-white/30">
                      Humidity
                    </span>
                    <span className="text-sm font-medium text-white/70">
                      {weather.humidity}%
                    </span>
                  </div>
                  <div className="rounded-xl ios-glass px-3.5 py-2.5">
                    <span className="block text-[10px] uppercase tracking-wider text-white/30">
                      Wind
                    </span>
                    <span className="text-sm font-medium text-white/70">
                      {weather.windSpeed} km/h
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-white/25">
                  <svg className="h-3.5 w-3.5 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  {weather.city}
                  {weather.country ? `, ${weather.country}` : ""}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
