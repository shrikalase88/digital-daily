"use client";

import { Globe2, Cpu, TrendingUp, Trophy, Zap, Play, LucideIcon } from "lucide-react";
import type { Category } from "@/lib/types";

export interface StoryRingItem {
  id: string;
  label: string;
  subtitle: string;
  category: Category | "All";
  icon: LucideIcon;
  badgeColor: string;
  accentBorder: string;
}

const STORY_ITEMS: StoryRingItem[] = [
  {
    id: "top-flash",
    label: "Top 60s Flash",
    subtitle: "Real-time global wire",
    category: "All",
    icon: Zap,
    badgeColor: "text-amber-400 bg-amber-500/15 border-amber-500/30",
    accentBorder: "border-amber-500/50",
  },
  {
    id: "tech-pulse",
    label: "Tech & AI",
    subtitle: "Silicon & Frontier",
    category: "Technology",
    icon: Cpu,
    badgeColor: "text-sky-300 bg-sky-500/15 border-sky-500/30",
    accentBorder: "border-sky-500/50",
  },
  {
    id: "world-scoop",
    label: "World & Politics",
    subtitle: "Global & Policy briefs",
    category: "Politics & World",
    icon: Globe2,
    badgeColor: "text-rose-300 bg-rose-500/15 border-rose-500/30",
    accentBorder: "border-rose-500/50",
  },
  {
    id: "finance-pulse",
    label: "Markets & Deals",
    subtitle: "Sensex, Stocks & Macro",
    category: "Finance & Corporate",
    icon: TrendingUp,
    badgeColor: "text-emerald-300 bg-emerald-500/15 border-emerald-500/30",
    accentBorder: "border-emerald-500/50",
  },
  {
    id: "sports-live",
    label: "Live Sports",
    subtitle: "Scores, F1 & Matches",
    category: "Sports",
    icon: Trophy,
    badgeColor: "text-amber-300 bg-amber-500/15 border-amber-500/30",
    accentBorder: "border-amber-500/50",
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
    <div className="relative mb-6">
      {/* Header */}
      <div className="flex items-center justify-between px-1 mb-2.5">
        <div className="flex items-center gap-2">
          <Zap size={13} className="text-amber-400 fill-amber-400/40" />
          <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-300">
            60-Second Flash Briefings
          </h2>
        </div>
        <span className="text-[11px] text-zinc-400 hidden md:inline-flex items-center gap-1 font-mono">
          <Play size={10} className="text-zinc-300 fill-zinc-300" /> Tap any briefing to launch full screen
        </span>
      </div>

      {/* ── Mobile Layout (< md): Clean Touch Rings ── */}
      <div
        className="flex md:hidden items-start justify-start gap-3 overflow-x-auto no-scrollbar py-1 px-1"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 8px, black calc(100% - 8px), transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 8px, black calc(100% - 8px), transparent)",
        }}
      >
        {STORY_ITEMS.map((item) => {
          const Icon = item.icon;
          const isCurrent =
            (item.category === "All" && !activeCategory) ||
            item.category === activeCategory;

          return (
            <button
              key={item.id}
              onClick={() => onSelectStory(item.category)}
              className="flex flex-col items-center w-[74px] shrink-0 group focus:outline-none text-center active:scale-95 transition-transform"
            >
              {/* Outer Ring Circle */}
              <div
                className={`relative flex items-center justify-center p-[2px] rounded-full transition-all duration-200 ${
                  isCurrent
                    ? "ring-2 ring-white/60 bg-white/20"
                    : "ring-1 ring-white/10 group-hover:ring-white/25"
                }`}
              >
                {/* Inner Icon Container */}
                <div className="relative flex h-13 w-13 items-center justify-center rounded-full bg-[#121217] border border-white/10 overflow-hidden">
                  <Icon
                    size={20}
                    strokeWidth={2}
                    className="text-white drop-shadow-sm"
                  />
                </div>
              </div>

              {/* Label */}
              <span
                className={`text-[10px] leading-tight tracking-tight mt-1.5 line-clamp-1 w-full ${
                  isCurrent
                    ? "text-white font-semibold"
                    : "text-zinc-400 font-medium group-hover:text-zinc-200"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Desktop Layout (>= md): Editorial Channel Cards ── */}
      <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {STORY_ITEMS.map((item) => {
          const Icon = item.icon;
          const isCurrent =
            (item.category === "All" && !activeCategory) ||
            item.category === activeCategory;

          return (
            <button
              key={item.id}
              onClick={() => onSelectStory(item.category)}
              className={`group relative text-left p-3 rounded-2xl ios-glass-elevated border transition-all duration-200 active:scale-[0.98] ${
                isCurrent
                  ? "border-white/30 bg-white/[0.08] ring-1 ring-white/15"
                  : "border-white/[0.08] hover:border-white/20 hover:bg-white/[0.04]"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-xl border ${item.badgeColor} transition-transform group-hover:scale-105`}
                >
                  <Icon size={16} strokeWidth={2.2} />
                </div>

                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/5 group-hover:bg-white group-hover:text-black text-zinc-400 transition-colors">
                  <Play size={8} className="ml-0.5" />
                </span>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-zinc-100 group-hover:text-white transition-colors truncate">
                  {item.label}
                </h3>
                <p className="text-[10px] text-zinc-400 truncate mt-0.5 font-normal">
                  {item.subtitle}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
