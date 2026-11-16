"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Activity, CloudSun, TrendingUp, Trophy } from "lucide-react";
import WeatherWidget from "./weather-widget";
import StockWidget from "./stock-widget";
import { LiveSportsTicker } from "./live-sports-ticker";

interface PulseDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = "all" | "markets" | "weather" | "sports";

export default function PulseDrawer({ isOpen, onClose }: PulseDrawerProps) {
  const [activeTab, setActiveTab] = useState<TabType>("all");

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/75 backdrop-blur-md">
        {/* Backdrop click to close */}
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-lg bg-[#121217] border-t border-white/10 rounded-t-[32px] p-5 sm:p-6 max-h-[85vh] overflow-y-auto no-scrollbar shadow-[0_-20px_50px_rgba(0,0,0,0.8)] z-10"
        >
          {/* Drag Pill Handle */}
          <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/20" />

          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/15 text-rose-400 border border-rose-500/25">
                <Activity size={14} className="live-badge-beacon" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Live Pulse Hub</h3>
                <p className="text-[10px] text-zinc-400 font-mono">
                  Real-time markets, sports & weather
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 border border-white/10 text-zinc-400 hover:text-white active:scale-95 transition-all"
              aria-label="Close"
            >
              <X size={15} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-white/[0.04] rounded-2xl mb-4 border border-white/5">
            <button
              onClick={() => setActiveTab("all")}
              className={`flex-1 py-1.5 text-xs font-medium rounded-xl transition-all active:scale-[0.98] ${
                activeTab === "all"
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("markets")}
              className={`flex-1 py-1.5 text-xs font-medium rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-1 ${
                activeTab === "markets"
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <TrendingUp size={12} /> Markets
            </button>
            <button
              onClick={() => setActiveTab("weather")}
              className={`flex-1 py-1.5 text-xs font-medium rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-1 ${
                activeTab === "weather"
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <CloudSun size={12} /> Weather
            </button>
            <button
              onClick={() => setActiveTab("sports")}
              className={`flex-1 py-1.5 text-xs font-medium rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-1 ${
                activeTab === "sports"
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Trophy size={12} /> Sports
            </button>
          </div>

          {/* Content Sections */}
          <div className="space-y-3.5 pb-4">
            {(activeTab === "all" || activeTab === "sports") && (
              <div>
                <div className="flex items-center gap-2 mb-2 px-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono">
                    Live Sports Wire
                  </span>
                </div>
                <div className="ios-glass rounded-2xl p-2">
                  <LiveSportsTicker />
                </div>
              </div>
            )}

            {(activeTab === "all" || activeTab === "markets") && (
              <div>
                <StockWidget />
              </div>
            )}

            {(activeTab === "all" || activeTab === "weather") && (
              <div>
                <WeatherWidget />
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
