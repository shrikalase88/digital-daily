import { NextRequest, NextResponse } from "next/server";
import { getClientIP, checkRateLimit, cacheStore, CACHE_TTL } from "@/lib/middleware";
import { circuitBreakers, CircuitState } from "@/lib/circuit-breaker";

export const dynamic = "force-dynamic";

interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  lastUpdated: string;
}

async function fetchBSESensex(): Promise<StockData | null> {
  return circuitBreakers.yahooFinance.execute(async () => {
    // Add timestamp to prevent caching
    const timestamp = Date.now();
    const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/^BSESN?timestamp=${timestamp}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/json",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
      },
      // Force fresh data every time
      cache: "no-store",
    });

    if (!res.ok) throw new Error(`Yahoo Finance error: ${res.status}`);
    const data = await res.json();
    
    const meta = data.chart?.result?.[0]?.meta;
    if (!meta) throw new Error("No data from Yahoo Finance");

    // Use regularMarketPrice for real-time data
    const currentPrice = meta.regularMarketPrice || meta.previousClose || 0;
    const previousClose = meta.previousClose || meta.chartPreviousClose || currentPrice;
    const change = currentPrice - previousClose;
    const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;

    console.log(`[BSE] Price: ${currentPrice}, Change: ${change}, Change%: ${changePercent}`);

    return {
      symbol: "BSE Sensex",
      price: Math.round(currentPrice * 100) / 100,
      change: Math.round(change * 100) / 100,
      changePercent: Math.round(changePercent * 100) / 100,
      lastUpdated: new Date().toISOString(),
    };
  });
}

async function fetchNSENifty(): Promise<StockData | null> {
  return circuitBreakers.yahooFinance.execute(async () => {
    // Add timestamp to prevent caching
    const timestamp = Date.now();
    const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/^NSEI?timestamp=${timestamp}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/json",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
      },
      // Force fresh data every time
      cache: "no-store",
    });

    if (!res.ok) throw new Error(`Yahoo Finance error: ${res.status}`);
    const data = await res.json();
    
    const meta = data.chart?.result?.[0]?.meta;
    if (!meta) throw new Error("No data from Yahoo Finance");

    // Use regularMarketPrice for real-time data
    const currentPrice = meta.regularMarketPrice || meta.previousClose || 0;
    const previousClose = meta.previousClose || meta.chartPreviousClose || currentPrice;
    const change = currentPrice - previousClose;
    const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;

    console.log(`[NSE] Price: ${currentPrice}, Change: ${change}, Change%: ${changePercent}`);

    return {
      symbol: "NSE Nifty",
      price: Math.round(currentPrice * 100) / 100,
      change: Math.round(change * 100) / 100,
      changePercent: Math.round(changePercent * 100) / 100,
      lastUpdated: new Date().toISOString(),
    };
  });
}

export async function GET(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit(clientIP);

    // Check rate limit
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests" },
        { 
          status: 429,
          headers: {
            "X-RateLimit-Limit": "10",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": Math.ceil(rateLimit.resetTime / 1000).toString(),
            "Retry-After": Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
          }
        }
      );
    }

    // Don't cache stock data - always fetch fresh
    // Skip cache check during market hours (9:15 AM - 3:30 PM IST)
    const istHour = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata", hour: "numeric", hour12: false });
    const istMinute = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata", minute: "numeric" });
    const currentTime = parseInt(istHour) * 60 + parseInt(istMinute);
    const marketOpen = 9 * 60 + 15; // 9:15 AM
    const marketClose = 15 * 60 + 30; // 3:30 PM

    // During market hours, skip cache for real-time data
    const cached = cacheStore.get("stocks");
    if (currentTime >= marketOpen && currentTime <= marketClose) {
      console.log("[Stocks] Market hours - fetching real-time data");
    } else {
      // After market hours, use cache
      const now = Date.now();
      if (cached && now - cached.timestamp < 300000) { // 5 min cache after hours
        return NextResponse.json(cached.data, {
          headers: {
            "X-RateLimit-Limit": "10",
            "X-RateLimit-Remaining": rateLimit.remaining.toString(),
            "X-Cache": "HIT",
            "X-Market-Status": "CLOSED",
          },
        });
      }
    }

    // Fetch fresh data with circuit breaker protection
    const [bse, nse] = await Promise.allSettled([
      fetchBSESensex(),
      fetchNSENifty(),
    ]);

    // Handle circuit breaker open state
    const bseData = bse.status === "fulfilled" ? bse.value : null;
    const nseData = nse.status === "fulfilled" ? nse.value : null;

    if (!bseData && !nseData) {
      // Try to serve stale cache
      if (cached) {
        return NextResponse.json(cached.data, {
          headers: {
            "X-Cache": "STALE",
            "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
          },
        });
      }

      const circuitState = circuitBreakers.yahooFinance.getState();
      return NextResponse.json(
        { 
          error: "Market data temporarily unavailable",
          circuitState: circuitBreakers.yahooFinance.getState(),
        },
        { 
          status: circuitState === CircuitState.OPEN ? 503 : 500,
          headers: {
            "Retry-After": "60",
          }
        }
      );
    }

    // Determine market status for the frontend
    const dayOfWeek = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata", weekday: "short" });
    const isWeekend = dayOfWeek === "Sat" || dayOfWeek === "Sun";
    let marketStatus: "open" | "closed" | "pre-market" | "post-market";
    let marketStatusLabel: string;

    if (isWeekend) {
      marketStatus = "closed";
      marketStatusLabel = "Weekend · Market Closed";
    } else if (currentTime >= marketOpen && currentTime <= marketClose) {
      marketStatus = "open";
      marketStatusLabel = "Market Open";
    } else if (currentTime < marketOpen && currentTime >= marketOpen - 60) {
      marketStatus = "pre-market";
      marketStatusLabel = "Pre-Market";
    } else {
      marketStatus = "closed";
      marketStatusLabel = "Market Closed";
    }

    const data = {
      bse: bseData || {
        symbol: "BSE Sensex",
        price: 0,
        change: 0,
        changePercent: 0,
        lastUpdated: new Date().toISOString(),
      },
      nse: nseData || {
        symbol: "NSE Nifty",
        price: 0,
        change: 0,
        changePercent: 0,
        lastUpdated: new Date().toISOString(),
      },
      marketStatus,
      marketStatusLabel,
    };

    // Update cache
    const now = Date.now();
    cacheStore.set("stocks", {
      data,
      timestamp: now,
      hits: 0,
    });

    return NextResponse.json(data, {
      headers: {
        "X-RateLimit-Limit": "10",
        "X-RateLimit-Remaining": rateLimit.remaining.toString(),
        "X-Cache": "MISS",
        "X-Circuit-State": circuitBreakers.yahooFinance.getState(),
        "Cache-Control": `public, s-maxage=${CACHE_TTL.stocks / 1000}, stale-while-revalidate=120`,
      },
    });
  } catch (error) {
    console.error("Stocks API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stock data" },
      { status: 500 }
    );
  }
}