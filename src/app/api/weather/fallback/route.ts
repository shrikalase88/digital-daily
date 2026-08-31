import { NextRequest, NextResponse } from "next/server";
import type { WeatherData } from "@/lib/types";

export const dynamic = "force-dynamic";

async function fetchWeatherFromCoordinates(
  lat: number,
  lon: number,
  city: string,
  country: string
): Promise<WeatherData | null> {
  try {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`;
    const weatherRes = await fetch(weatherUrl, { next: { revalidate: 300 } });
    if (!weatherRes.ok) return null;
    const weatherData = await weatherRes.json();

    const code = weatherData.current?.weather_code ?? 0;
    const condition = getWeatherCondition(code);
    const icon = getWeatherIcon(code);

    return {
      temperature: Math.round(weatherData.current?.temperature_2m ?? 0),
      feelsLike: Math.round(weatherData.current?.apparent_temperature ?? 0),
      condition,
      icon,
      humidity: weatherData.current?.relative_humidity_2m ?? 0,
      windSpeed: Math.round(weatherData.current?.wind_speed_10m ?? 0),
      city: city || "Current Location",
      country: country || "",
      description: condition,
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
      const weather = await fetchWeatherFromCoordinates(
        parseFloat(vercelLat),
        parseFloat(vercelLon),
        vercelCity ? decodeURIComponent(vercelCity) : "Current Location",
        vercelCountry || ""
      );
      if (weather) return weather;
    }

    // 2. Check Cloudflare / Proxy IP headers
    const clientIp =
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-real-ip") ||
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();

    // 3. Multi-provider IP lookup fallback
    const providers = [
      clientIp && clientIp !== "127.0.0.1" && clientIp !== "::1"
        ? `http://ip-api.com/json/${clientIp}?fields=status,lat,lon,city,country`
        : "http://ip-api.com/json/?fields=status,lat,lon,city,country",
      "https://ipapi.co/json/",
      "https://freeipapi.com/api/json",
    ];

    let geoData: { lat: number; lon: number; city: string; country: string } | null = null;

    for (const url of providers) {
      try {
        const geoRes = await fetch(url, { next: { revalidate: 3600 } });
        if (!geoRes.ok) continue;
        const data = await geoRes.json();

        const lat = parseFloat(data.lat || data.latitude);
        const lon = parseFloat(data.lon || data.longitude);

        if (!isNaN(lat) && !isNaN(lon)) {
          geoData = {
            lat,
            lon,
            city: data.city || data.cityName || "Current Location",
            country: data.country || data.countryName || "",
          };
          break;
        }
      } catch {
        continue;
      }
    }

    // 4. Default fallback if IP resolution fails (e.g. strict local sandbox)
    if (!geoData) {
      geoData = { lat: 28.6139, lon: 77.2090, city: "New Delhi", country: "IN" };
    }

    return await fetchWeatherFromCoordinates(
      geoData.lat,
      geoData.lon,
      geoData.city,
      geoData.country
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
  const weather = await fetchWeatherFromIP(request);
  if (!weather) {
    return NextResponse.json(
      { error: "Failed to fetch weather from IP location" },
      { status: 500 }
    );
  }
  return NextResponse.json(weather);
}
