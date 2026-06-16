import { NextRequest, NextResponse } from "next/server";
import type { WeatherData } from "@/lib/types";

export const dynamic = "force-dynamic";

async function fetchWeather(
  lat: number,
  lon: number
): Promise<WeatherData | null> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`;
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const data = await res.json();

    const code = data.current?.weather_code ?? 0;
    const condition = getWeatherCondition(code);
    const icon = getWeatherIcon(code);

    const timezone = data.timezone || "";
    const tzParts = timezone.split("/");
    let city = tzParts.length > 1 ? tzParts[1].replace(/_/g, " ") : "Unknown";
    let country = "";

    try {
      const geo = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=10`,
        {
          headers: { "User-Agent": "DigitalDaily/1.0" },
          next: { revalidate: 86400 },
        }
      );
      if (geo.ok) {
        const geoData = await geo.json();
        const addr = geoData.address || {};
        city =
          addr.city ||
          addr.town ||
          addr.village ||
          addr.municipality ||
          addr.county ||
          city;
        country = addr.country || "";
      }
    } catch {}

    return {
      temperature: Math.round(data.current?.temperature_2m ?? 0),
      feelsLike: Math.round(data.current?.apparent_temperature ?? 0),
      condition,
      icon,
      humidity: data.current?.relative_humidity_2m ?? 0,
      windSpeed: Math.round(data.current?.wind_speed_10m ?? 0),
      city,
      country,
      description: condition,
    };
  } catch (error) {
    console.error("Weather fetch error:", error);
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
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json(
      { error: "lat and lon query params required" },
      { status: 400 }
    );
  }

  const weather = await fetchWeather(parseFloat(lat), parseFloat(lon));
  if (!weather) {
    return NextResponse.json(
      { error: "Failed to fetch weather" },
      { status: 500 }
    );
  }

  return NextResponse.json(weather);
}
