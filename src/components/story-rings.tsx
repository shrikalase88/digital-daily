"use client";

import { motion } from "framer-motion";
import { Globe2, Cpu, TrendingUp, Trophy, Zap, Play, LucideIcon } from "lucide-react";
import type { Category } from "@/lib/types";

export interface StoryRingItem {
  id: string;
  label: string;
  subtitle: string;
  category: Category | "All";
  icon: LucideIcon;
  gradient: string;
  borderGlow: string;
  glowColor: string;
}

const STORY_ITEMS: StoryRingItem[] = [
  {
    id: "top-flash",
    label: "Top 60s Flash",
    subtitle: "Real-time global wire",
    category: "All",
    icon: Zap,
    gradient: "from-rose-500 via-fuchsia-500 to-indigo-500",
    borderGlow: "hover:border-rose-500/50",
    glowColor: "rgba(244, 63, 94, 0.4)",
  },
  {
    id: "tech-pulse",
    label: "Tech & AI",
    subtitle: "Silicon & Frontier",
    category: "Technology",
    icon: Cpu,
    gradient: "from-cyan-400 via-blue-500 to-indigo-600",
    borderGlow: "hover:border-cyan-500/50",
    glowColor: "rgba(6, 182, 212, 0.4)",
  },
  {
    id: "world-scoop",
    label: "World & Politics",
    subtitle: "Global & Policy briefs",
    category: "Politics & World",
    icon: Globe2,
    gradient: "from-pink-500 via-rose-500 to-amber-500",
    borderGlow: "hover:border-pink-500/50",
    glowColor: "rgba(244, 63, 94, 0.4)",
  },
  {
    id: "finance-pulse",
    label: "Markets & Deals",
    subtitle: "Sensex, Stocks & Macro",
    category: "Finance & Corporate",
    icon: TrendingUp,
    gradient: "from-emerald-400 via-teal-500 to-cyan-500",
    borderGlow: "hover:border-emerald-500/50",
    glowColor: "rgba(16, 185, 129, 0.4)",
  },
  {
    id: "sports-live",
    label: "Live Sports",
    subtitle: "Scores, F1 & Matches",
    category: "Sports",
    icon: Trophy,
    gradient: "from-amber-400 via-orange-500 to-rose-500",
    borderGlow: "hover:border-amber-500/50",
    glowColor: "rgba(245, 158, 11, 0.4)",
  },
];

interface StoryRingsProps {
  onSelectStory: (category: Category | "All") => void;
  activeCategory?: Category | null;
}

export default function StoryRings({
  onSelectStory,
  activeCategory,
}: StoryRingsProps) {
  return (
    <div className="relative mb-8">
      {/* Header */}
      <div className="flex items-center justify-between px-1 mb-3">
        <div className="flex items-center gap-2">
          <Zap size={14} className="text-rose-400 fill-rose-400/30" />
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-[0.14em] text-white/70">
            60-Second Flash Channels
          </h2>
        </div>
        <span className="text-[11px] text-white/40 hidden md:inline-flex items-center gap-1">
          <Play size={11} className="text-cyan-400 fill-cyan-400" /> Click any channel for visual briefing
        </span>
      </div>

      {/* ── Mobile & Tablet Layout (< md): Centered, Evenly Spaced Story Rings ── */}
      <div
        className="flex md:hidden items-start justify-start sm:justify-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar py-2 px-1"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 8px, black calc(100% - 8px), transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 8px, black calc(100% - 8px), transparent)",
        }}
      >
        {STORY_ITEMS.map((item, idx) => {
          const Icon = item.icon;
          const isCurrent =
            (item.category === "All" && !activeCategory) ||
            item.category === activeCategory;

          return (
            <motion.button
              key={item.id}
              onClick={() => onSelectStory(item.category)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.94 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04, duration: 0.25 }}
              className="flex flex-col items-center w-[74px] sm:w-[82px] shrink-0 group focus:outline-none text-center"
            >
              {/* Outer Ring Circle */}
              <div
                className={`relative flex items-center justify-center p-[2.5px] rounded-full transition-all duration-300 ${
                  isCurrent
                    ? "ring-2 ring-white/60 shadow-[0_0_18px_rgba(255,255,255,0.25)]"
                    : "hover:ring-1 hover:ring-white/30"
                }`}
                style={{
                  background: `linear-gradient(135deg, ${item.gradient.replace(
                    /from-|via-|to-/g,
                    ""
                  )})`,
                  boxShadow: `0 4px 14px ${item.glowColor}`,
                }}
              >
                {/* Inner Icon Container */}
                <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#0a0a14] border border-white/10 overflow-hidden">
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-20`}
                  />
                  <div className="relative flex items-center justify-center">
                    <Icon
                      size={22}
                      strokeWidth={2.2}
                      className="text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]"
                    />
                  </div>
                </div>
              </div>

              {/* Label */}
              <span
                className={`text-[10.5px] sm:text-[11px] leading-tight tracking-tight mt-2 line-clamp-2 w-full ${
                  isCurrent ? "text-white font-bold" : "text-white/70 font-medium group-hover:text-white"
                }`}
              >
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* ── Desktop Layout (>= md): Panoramic 5-Column Interactive Channel Cards ── */}
      <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-5 gap-3">
        {STORY_ITEMS.map((item, idx) => {
          const Icon = item.icon;
          const isCurrent =
            (item.category === "All" && !activeCategory) ||
            item.category === activeCategory;

          return (
            <motion.button
              key={item.id}
              onClick={() => onSelectStory(item.category)}
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.3 }}
              className={`group relative text-left p-3.5 rounded-2xl ios-glass-elevated border transition-all duration-300 overflow-hidden ${
                isCurrent
                  ? "border-white/30 shadow-[0_0_25px_rgba(255,255,255,0.1)] ring-1 ring-white/20"
                  : "border-white/10 hover:border-white/20 hover:bg-white/[0.04]"
              } ${item.borderGlow}`}
            >
              {/* Subtle top gradient accent */}
              <div
                className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r ${item.gradient} opacity-70 group-hover:opacity-100 group-hover:h-[3px] transition-all`}
              />

              <div className="flex items-center justify-between mb-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.06] border border-white/10 group-hover:scale-110 group-hover:bg-white/10 transition-all">
                  <Icon size={18} strokeWidth={2.2} className="text-white" />
                </div>

                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/5 group-hover:bg-cyan-500 group-hover:text-black text-white/40 transition-colors">
                  <Play size={10} className="ml-0.5" />
                </span>
              </div>

              <div>
                <h3 className="text-xs font-bold text-white group-hover:text-white transition-colors truncate">
                  {item.label}
                </h3>
                <p className="text-[10px] text-white/45 truncate mt-0.5">
                  {item.subtitle}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
