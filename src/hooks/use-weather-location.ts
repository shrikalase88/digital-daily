"use client";

import { useState, useEffect, useCallback } from "react";

export interface UserLocation {
  city: string;
  country?: string;
  lat?: number;
  lon?: number;
  isAuto: boolean;
}

const STORAGE_KEY = "digital-daily-weather-location";
const EVENT_NAME = "weather-location-changed";

function getInitialLocation(): UserLocation | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function useWeatherLocation() {
  const [location, setLocationState] = useState<UserLocation | null>(getInitialLocation);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectError, setDetectError] = useState<string | null>(null);

  // Subscribe to storage / custom event sync
  useEffect(() => {
    const handleSync = (e: CustomEvent<UserLocation | null>) => {
      setLocationState(e.detail);
    };

    window.addEventListener(EVENT_NAME as unknown as string, handleSync as EventListener);
    return () => {
      window.removeEventListener(EVENT_NAME as unknown as string, handleSync as EventListener);
    };
  }, []);

  const setLocation = useCallback((newLoc: UserLocation) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newLoc));
    } catch {
      /* ignore */
    }
    setLocationState(newLoc);
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: newLoc }));
  }, []);

  const clearLocation = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setLocationState(null);
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: null }));
  }, []);

  const detectLocation = useCallback(async (): Promise<UserLocation | null> => {
    setIsDetecting(true);
    setDetectError(null);

    // 1. Try browser Geolocation first for true GPS/Wi-Fi accuracy
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 8000,
            maximumAge: 60000,
          });
        });

        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        // Fetch weather + city name from our endpoint
        const res = await fetch(`/api/weather/fallback?lat=${lat}&lon=${lon}`);
        if (res.ok) {
          const data = await res.json();
          const newLoc: UserLocation = {
            city: data.city || "Current Location",
            country: data.country || "",
            lat,
            lon,
            isAuto: true,
          };
          setLocation(newLoc);
          setIsDetecting(false);
          return newLoc;
        }
      } catch (geoErr) {
        console.warn("Browser geolocation skipped/denied, falling back to network IP:", geoErr);
      }
    }

    // 2. Fallback to network/proxy IP detection
    try {
      const res = await fetch("/api/weather/fallback");
      if (res.ok) {
        const data = await res.json();
        const newLoc: UserLocation = {
          city: data.city || "Current Location",
          country: data.country || "",
          lat: data.lat,
          lon: data.lon,
          isAuto: true,
        };
        setLocation(newLoc);
        setIsDetecting(false);
        return newLoc;
      }
    } catch (err) {
      console.error("Network IP detection failed:", err);
      setDetectError("Unable to detect location. Please select your city manually.");
    }

    setIsDetecting(false);
    return null;
  }, [setLocation]);

  return {
    location,
    setLocation,
    clearLocation,
    detectLocation,
    isDetecting,
    detectError,
  };
}
