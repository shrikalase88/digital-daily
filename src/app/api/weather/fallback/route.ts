import { NextRequest, NextResponse } from "next/server";
import type { WeatherData } from "@/lib/types";

export const dynamic = "force-dynamic";

function isPrivateIP(ip: string): boolean {
  if (!ip) return true;
  const clean = ip.trim();
  if (clean === "127.0.0.1" || clean === "::1" || clean === "localhost") return true;
  if (clean.startsWith("10.") || clean.startsWith("192.168.")) return true;
  if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(clean)) return true;
  if (clean.startsWith("fc00:") || clean.startsWith("fe80:")) return true;
  return false;
}

function extractPublicIP(req: NextRequest): string | null {
  const headers = [
    req.headers.get("cf-connecting-ip"),
    req.headers.get("x-real-ip"),
    req.headers.get("x-client-ip"),
    req.headers.get("fastly-client-ip"),
    req.headers.get("true-client-ip"),
  ];

  for (const h of headers) {
    if (h && !isPrivateIP(h)) return h.trim();
  }

  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const parts = forwarded.split(",").map((p) => p.trim());
    for (const part of parts) {
      if (!isPrivateIP(part)) return part;
    }
  }

  return null;
}

async function fetchWeatherFromCoordinates(
  lat: number,
  lon: number,
  city: string,
  country: string,
  isAuto = false
): Promise<WeatherData | null> {
  try {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`;
    const weatherRes = await fetch(weatherUrl, {
      headers: { "User-Agent": "DigitalDaily/1.0" },
      next: { revalidate: 300 },
    });
    if (!weatherRes.ok) return null;
    const weatherData = await weatherRes.json();

    const code = weatherData.current?.weather_code ?? 0;
    const condition = getWeatherCondition(code);
    const icon = getWeatherIcon(code);

    let resolvedCity = city;
    let resolvedCountry = country;

    // If city is unknown or generic, attempt reverse geocoding via Nominatim
    if (!resolvedCity || resolvedCity === "Current Location" || resolvedCity === "Unknown") {
      try {
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=10&addressdetails=1`,
          {
            headers: { "User-Agent": "DigitalDaily/1.0 (contact@digitaldaily.com)" },
            next: { revalidate: 86400 },
          }
        );
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          const addr = geoData.address || {};
          resolvedCity =
            addr.city ||
            addr.town ||
            addr.village ||
            addr.municipality ||
            addr.county ||
            addr.state ||
            "Current Location";
          resolvedCountry = addr.country || resolvedCountry;
        }
      } catch {
        const tz = weatherData.timezone || "";
        const parts = tz.split("/");
        if (parts.length > 1) {
          resolvedCity = parts[1].replace(/_/g, " ");
        }
      }
    }

    return {
      temperature: Math.round(weatherData.current?.temperature_2m ?? 0),
      feelsLike: Math.round(weatherData.current?.apparent_temperature ?? 0),
      condition,
      icon,
      humidity: weatherData.current?.relative_humidity_2m ?? 0,
      windSpeed: Math.round(weatherData.current?.wind_speed_10m ?? 0),
      city: resolvedCity || "Current Location",
      country: resolvedCountry || "",
      description: condition,
      lat,
      lon,
      isAuto,
    };
  } catch (err) {
    console.error("Weather coordinate fetch error:", err);
    return null;
  }
}

async function fetchWeatherFromIP(req: NextRequest): Promise<WeatherData | null> {
  try {
    // 1. Check Vercel Edge IP geolocation headers
    const vercelLat = req.headers.get("x-vercel-ip-latitude");
    const vercelLon = req.headers.get("x-vercel-ip-longitude");
    const vercelCity = req.headers.get("x-vercel-ip-city");
    const vercelCountry = req.headers.get("x-vercel-ip-country");

    if (vercelLat && vercelLon) {
      const lat = parseFloat(vercelLat);
      const lon = parseFloat(vercelLon);
      if (!isNaN(lat) && !isNaN(lon)) {
        const weather = await fetchWeatherFromCoordinates(
          lat,
          lon,
          vercelCity ? decodeURIComponent(vercelCity) : "Current Location",
          vercelCountry || "",
          true
        );
        if (weather) return weather;
      }
    }

    // 2. Check Proxy / Network client IP
    const publicIp = extractPublicIP(req);

    // 3. Multi-provider IP lookup with HTTPS fallbacks
    const providers = publicIp
      ? [
          `https://freeipapi.com/api/json/${publicIp}`,
          `https://ipapi.co/${publicIp}/json/`,
          `http://ip-api.com/json/${publicIp}?fields=status,lat,lon,city,country`,
        ]
      : [
          "https://freeipapi.com/api/json",
          "https://ipapi.co/json/",
          "http://ip-api.com/json/?fields=status,lat,lon,city,country",
        ];

    let geoData: { lat: number; lon: number; city: string; country: string } | null = null;

    for (const url of providers) {
      try {
        const geoRes = await fetch(url, {
          headers: { "User-Agent": "DigitalDaily/1.0" },
          next: { revalidate: 3600 },
        });
        if (!geoRes.ok) continue;
        const data = await geoRes.json();

        const lat = parseFloat(data.lat || data.latitude);
        const lon = parseFloat(data.lon || data.longitude);

        if (!isNaN(lat) && !isNaN(lon) && (lat !== 0 || lon !== 0)) {
          geoData = {
            lat,
            lon,
            city: data.city || data.cityName || "Current Location",
            country: data.country || data.countryName || data.country_name || "",
          };
          break;
        }
      } catch {
        continue;
      }
    }

    // 4. Default fallback if IP resolution is unavailable (e.g. strict offline sandbox)
    if (!geoData) {
      geoData = { lat: 40.7128, lon: -74.006, city: "New York", country: "US" };
    }

    return await fetchWeatherFromCoordinates(
      geoData.lat,
      geoData.lon,
      geoData.city,
      geoData.country,
      true
    );
  } catch (error) {
    console.error("Automatic IP weather fetch error:", error);
    return null;
  }
}

function getWeatherCondition(code: number): string {
  if (code === 0) return "Clear";
  if (code <= 3) return "Partly Cloudy";
  if (code <= 48) return "Foggy";
  if (code <= 57) return "Drizzle";
  if (code <= 67) return "Rain";
  if (code <= 77) return "Snow";
  if (code <= 82) return "Rain Showers";
  if (code <= 86) return "Snow Showers";
  return "Thunderstorm";
}

function getWeatherIcon(code: number): string {
  if (code === 0) return "☀️";
  if (code <= 3) return "⛅";
  if (code <= 48) return "🌫️";
  if (code <= 57) return "🌦️";
  if (code <= 67) return "🌧️";
  if (code <= 77) return "❄️";
  if (code <= 82) return "🌦️";
  if (code <= 86) return "🌨️";
  return "⛈️";
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const latParam = searchParams.get("lat");
  const lonParam = searchParams.get("lon");
  const cityParam = searchParams.get("city");
  const countryParam = searchParams.get("country");

  // If explicit coordinates provided by user
  if (latParam && lonParam) {
    const lat = parseFloat(latParam);
    const lon = parseFloat(lonParam);
    if (!isNaN(lat) && !isNaN(lon)) {
      const weather = await fetchWeatherFromCoordinates(
        lat,
        lon,
        cityParam || "",
        countryParam || "",
        false
      );
      if (weather) {
        return NextResponse.json(weather);
      }
    }
  }

  // Otherwise, detect from network/proxy IP
  const weather = await fetchWeatherFromIP(request);
  if (!weather) {
    return NextResponse.json(
      { error: "Failed to fetch weather from location" },
      { status: 500 }
    );
  }
  return NextResponse.json(weather);
}
