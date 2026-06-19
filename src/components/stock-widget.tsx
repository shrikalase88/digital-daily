"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

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
    const interval = setInterval(fetchStocks, 10000);
    return () => clearInterval(interval);
  }, [fetchStocks]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="ios-glass rounded-2xl p-5"
      >
        <div className="mb-4 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-white/20 animate-pulse" />
          <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
            Market
          </h3>
        </div>
        <div className="space-y-3">
          <div className="h-16 w-full animate-pulse rounded-xl bg-white/[0.04]" />
          <div className="h-16 w-full animate-pulse rounded-xl bg-white/[0.04]" />
        </div>
      </motion.div>
    );
  }

  if (error || !stocks) {
    return null;
  }

  const isOpen = stocks.marketStatus === "open";
  const isPreMarket = stocks.marketStatus === "pre-market";

  const statusDotColor = isOpen
    ? "bg-green-400"
    : isPreMarket
      ? "bg-amber-400"
      : "bg-white/30";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="ios-glass rounded-2xl p-5"
    >
      {/* Header with market status */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`h-1.5 w-1.5 rounded-full ${statusDotColor} ${isOpen ? "animate-pulse" : ""}`}
          />
          <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
            Market
          </h3>
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider border ${
            isOpen
              ? "bg-green-500/10 border-green-500/20 text-green-400"
              : isPreMarket
                ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                : "bg-white/[0.04] border-white/[0.06] text-white/30"
          }`}
        >
          {stocks.marketStatusLabel || "Market Closed"}
        </span>
      </div>

      <div className="space-y-3">
        {stocks.bse && (
          <div className="rounded-xl bg-white/[0.02] px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-white/60">BSE Sensex</p>
                <p className="text-lg font-semibold text-white">
                  {stocks.bse.price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="text-right">
                <p
                  className={`text-sm font-medium ${
                    stocks.bse.change >= 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {stocks.bse.change >= 0 ? "+" : ""}
                  {stocks.bse.change.toFixed(2)}
                </p>
                <p
                  className={`text-xs ${
                    stocks.bse.change >= 0 ? "text-green-400/70" : "text-red-400/70"
                  }`}
                >
                  ({stocks.bse.change >= 0 ? "+" : ""}
                  {stocks.bse.changePercent.toFixed(2)}%)
                </p>
              </div>
            </div>
            <p className="mt-1.5 text-[9px] text-white/20">
              As of {formatStockTime(stocks.bse.lastUpdated)}
            </p>
          </div>
        )}

        {stocks.nse && (
          <div className="rounded-xl bg-white/[0.02] px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-white/60">NSE Nifty</p>
                <p className="text-lg font-semibold text-white">
                  {stocks.nse.price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="text-right">
                <p
                  className={`text-sm font-medium ${
                    stocks.nse.change >= 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {stocks.nse.change >= 0 ? "+" : ""}
                  {stocks.nse.change.toFixed(2)}
                </p>
                <p
                  className={`text-xs ${
                    stocks.nse.change >= 0 ? "text-green-400/70" : "text-red-400/70"
                  }`}
                >
                  ({stocks.nse.change >= 0 ? "+" : ""}
                  {stocks.nse.changePercent.toFixed(2)}%)
                </p>
              </div>
            </div>
            <p className="mt-1.5 text-[9px] text-white/20">
              As of {formatStockTime(stocks.nse.lastUpdated)}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}