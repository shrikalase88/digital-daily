"use client";

import { useState, useEffect, useCallback } from "react";

interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  lastUpdated: string;
}

interface StocksResponse {
  bse?: StockData;
  nse?: StockData;
  marketStatus?: "open" | "closed" | "pre-market" | "post-market";
  marketStatusLabel?: string;
}

function formatStockTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const time = date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });

  if (isToday) {
    return `Today, ${time} IST`;
  }

  const dateStr = date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    timeZone: "Asia/Kolkata",
  });
  return `${dateStr}, ${time} IST`;
}

export default function StockWidget() {
  const [stocks, setStocks] = useState<StocksResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStocks = useCallback(() => {
    fetch("/api/stocks")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch stocks");
        return res.json();
      })
      .then((data) => {
        setStocks(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Could not load market data");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchStocks();
    const interval = setInterval(fetchStocks, 15000);
    return () => clearInterval(interval);
  }, [fetchStocks]);

  if (loading) {
    return (
      <div className="ios-glass rounded-3xl p-5 border border-white/10 animate-pulse">
        <div className="mb-4 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
          <h3 className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">
            Market
          </h3>
        </div>
        <div className="space-y-2.5">
          <div className="h-16 w-full rounded-2xl bg-white/[0.04]" />
          <div className="h-16 w-full rounded-2xl bg-white/[0.04]" />
        </div>
      </div>
    );
  }

  if (error || !stocks) {
    return null;
  }

  const isOpen = stocks.marketStatus === "open";
  const isPreMarket = stocks.marketStatus === "pre-market";

  const statusDotColor = isOpen
    ? "bg-emerald-400"
    : isPreMarket
    ? "bg-amber-400"
    : "bg-zinc-500";

  return (
    <div className="ios-glass rounded-3xl p-5 border border-white/10 shadow-xl">
      {/* Header with market status */}
      <div className="mb-3.5 flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <span
            className={`h-1.5 w-1.5 rounded-full ${statusDotColor} ${
              isOpen ? "live-badge-beacon" : ""
            }`}
          />
          <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-300">
            Live Markets
          </h3>
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider border font-mono ${
            isOpen
              ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-300"
              : isPreMarket
              ? "bg-amber-500/10 border-amber-500/25 text-amber-300"
              : "bg-white/[0.04] border-white/[0.08] text-zinc-400"
          }`}
        >
          {stocks.marketStatusLabel || "Market Closed"}
        </span>
      </div>

      <div className="space-y-2.5">
        {stocks.bse && (
          <div className="rounded-2xl bg-white/[0.02] border border-white/[0.04] px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-zinc-400">BSE Sensex</p>
                <p className="font-mono text-lg font-bold text-white tracking-tight">
                  {stocks.bse.price.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div className="text-right font-mono">
                <p
                  className={`text-sm font-bold ${
                    stocks.bse.change >= 0 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {stocks.bse.change >= 0 ? "+" : ""}
                  {stocks.bse.change.toFixed(2)}
                </p>
                <p
                  className={`text-xs ${
                    stocks.bse.change >= 0
                      ? "text-emerald-400/80"
                      : "text-rose-400/80"
                  }`}
                >
                  ({stocks.bse.change >= 0 ? "+" : ""}
                  {stocks.bse.changePercent.toFixed(2)}%)
                </p>
              </div>
            </div>
            <p className="mt-1.5 text-[9px] text-zinc-500 font-mono">
              As of {formatStockTime(stocks.bse.lastUpdated)}
            </p>
          </div>
        )}

        {stocks.nse && (
          <div className="rounded-2xl bg-white/[0.02] border border-white/[0.04] px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-zinc-400">Nifty 50</p>
                <p className="font-mono text-lg font-bold text-white tracking-tight">
                  {stocks.nse.price.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div className="text-right font-mono">
                <p
                  className={`text-sm font-bold ${
                    stocks.nse.change >= 0 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {stocks.nse.change >= 0 ? "+" : ""}
                  {stocks.nse.change.toFixed(2)}
                </p>
                <p
                  className={`text-xs ${
                    stocks.nse.change >= 0
                      ? "text-emerald-400/80"
                      : "text-rose-400/80"
                  }`}
                >
                  ({stocks.nse.change >= 0 ? "+" : ""}
                  {stocks.nse.changePercent.toFixed(2)}%)
                </p>
              </div>
            </div>
            <p className="mt-1.5 text-[9px] text-zinc-500 font-mono">
              As of {formatStockTime(stocks.nse.lastUpdated)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
