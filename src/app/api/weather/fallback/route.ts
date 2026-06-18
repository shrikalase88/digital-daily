import { NextResponse } from "next/server";
import type { WeatherData } from "@/lib/types";

export const dynamic = "force-dynamic";

async function fetchWeatherFromIP(): Promise<WeatherData | null> {
  try {
    // Try multiple IP geolocation services in order of preference
    const providers = [
      "https://ipapi.co/json/",
      "https://ipapi.com/ip_api.php",
      "http://ip-api.com/json/?fields=status,lat,lon,city,country",
    ];

    let geoData: any = null;

    for (const url of providers) {
      try {
        const geoRes = await fetch(url, {
          next: { revalidate: 3600 },
        });

        if (!geoRes.ok) continue;

        const data = await geoRes.json();

        // Normalize response format
        geoData = {
          lat: data.lat || data.latitude,
          lon: data.lon || data.longitude,
          city: data.city,
          country: data.country || data.country_name,
        };

        if (geoData.lat && geoData.lon) break;
      } catch {
        continue;
      }
    }

    if (!geoData || !geoData.lat || !geoData.lon) {
      // Default to a major city if all providers fail
      geoData = { lat: 40.7128, lon: -74.0060, city: "New York", country: "US" };
    }

    // Fetch weather using the IP-based coordinates
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${geoData.lat}&longitude=${geoData.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`;
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
      city: geoData.city || "Unknown",
      country: geoData.country || "",
      description: condition,
    };
  } catch (error) {
    console.error("IP weather fallback error:", error);
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

export async function GET() {
  const weather = await fetchWeatherFromIP();
  if (!weather) {
    return NextResponse.json(
      { error: "Failed to fetch weather from IP location" },
      { status: 500 }
    );
  }
  return NextResponse.json(weather);
}
