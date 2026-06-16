"use client";

import { useState, useEffect, useTransition, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import type { WeatherData } from "@/lib/types";
import { handleError } from "@/lib/utils";

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [, startTransition] = useTransition();
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      startTransition(() => {
        setError("Geolocation not supported");
        setLoading(false);
      });
      return;
    }

    startTransition(() => {
      setLoading(true);
      setError(null);
      setPermissionDenied(false);
    });

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        fetch(`/api/weather?lat=${lat}&lon=${lon}`)
          .then((res) => {
            if (!res.ok) throw new Error("Failed");
            return res.json();
          })
          .then((data) => {
            startTransition(() => {
              setWeather(data);
              setLoading(false);
            });
          })
          .catch((error) => {
            startTransition(() => {
              handleError(error, setError, "Could not load weather");
              setLoading(false);
            });
          });
      },
      (geoError) => {
        startTransition(() => {
          if (geoError.code === geoError.PERMISSION_DENIED) {
            setPermissionDenied(true);
            setError("Location permission denied");
          } else {
            setError(geoError.message || "Location access failed");
          }
          setLoading(false);
        });
      },
      { timeout: 8000 }
    );
  }, []);

  // Request location on load
  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

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
        <div className="orbit-glow relative rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-6 backdrop-blur-xl">
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

            {!loading && permissionDenied && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl text-amber-500 animate-bounce">📍</span>
                  <div>
                    <h4 className="text-sm font-semibold text-white/90">Location Disabled</h4>
                    <p className="text-[11px] text-white/40 leading-tight">We can&apos;t detect your local weather.</p>
                  </div>
                </div>

                <div className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-3.5 space-y-2">
                  <p className="text-[11px] text-white/60 leading-relaxed font-medium">
                    To show your local temperature, please:
                  </p>
                  <ol className="list-decimal list-inside text-[10px] text-white/45 space-y-1 leading-normal">
                    <li>Click the lock/settings icon in your browser&apos;s address bar.</li>
                    <li>Toggle the <strong>Location</strong> permission to <strong>Allow</strong> or <strong>Ask</strong>.</li>
                    <li>Click below to refresh and load weather.</li>
                  </ol>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    requestLocation();
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/35 hover:to-blue-500/35 border border-cyan-500/20 hover:border-cyan-500/40 py-2.5 px-4 text-xs font-semibold text-white/90 transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 6.577M3.98 9h5" />
                  </svg>
                  Retry Geolocation Request
                </button>
              </div>
            )}

            {!loading && !permissionDenied && error && (
              <div className="space-y-3">
                <p className="text-sm text-red-400/80">{error}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    requestLocation();
                  }}
                  className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-xs text-white/60 hover:bg-white/[0.06] hover:text-white/80 transition-all cursor-pointer"
                >
                  Retry
                </button>
              </div>
            )}

            {weather && !loading && !permissionDenied && (
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
                  <div className="rounded-xl border border-white/[0.04] bg-white/[0.03] px-3.5 py-2.5">
                    <span className="block text-[10px] uppercase tracking-wider text-white/30">
                      Humidity
                    </span>
                    <span className="text-sm font-medium text-white/70">
                      {weather.humidity}%
                    </span>
                  </div>
                  <div className="rounded-xl border border-white/[0.04] bg-white/[0.03] px-3.5 py-2.5">
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
