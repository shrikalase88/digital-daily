import type { LucideIcon } from "lucide-react";
import { Globe2, Cpu, TrendingUp, Trophy, Zap, Newspaper } from "lucide-react";
import type { Category } from "./types";

export interface CategoryTheme {
  badge: string;
  borderHover: string;
  textHover: string;
  readMore: string;
  accentBg: string;
  dotBg: string;
  pillActive: string;
  icon: LucideIcon;
  emoji: string;
  subtitle: string;
  gradient: string;
  borderGlow: string;
  glowColor: string;
}

export const CATEGORY_THEMES: Record<Category | "default", CategoryTheme> = {
  "Politics & World": {
    badge: "text-rose-300 bg-rose-500/10 border-rose-500/25",
    borderHover: "hover:border-rose-500/40",
    textHover: "group-hover:text-rose-300",
    readMore: "text-rose-400/70 hover:text-rose-300",
    accentBg: "from-rose-950/20 to-zinc-950/60",
    dotBg: "bg-rose-400",
    pillActive: "border-rose-500/40 text-rose-200 bg-rose-500/15 shadow-sm",
    icon: Globe2,
    emoji: "🌐",
    subtitle: "Geopolitics, World Affairs & Global Wire",
    gradient: "from-rose-500/80 to-rose-700/80",
    borderGlow: "hover:border-rose-500/40",
    glowColor: "rgba(244, 63, 94, 0.15)",
  },
  Technology: {
    badge: "text-sky-300 bg-sky-500/10 border-sky-500/25",
    borderHover: "hover:border-sky-500/40",
    textHover: "group-hover:text-sky-300",
    readMore: "text-sky-400/70 hover:text-sky-300",
    accentBg: "from-sky-950/20 to-zinc-950/60",
    dotBg: "bg-sky-400",
    pillActive: "border-sky-500/40 text-sky-200 bg-sky-500/15 shadow-sm",
    icon: Cpu,
    emoji: "⚡",
    subtitle: "AI, Silicon, Cloud & Frontier Tech",
    gradient: "from-sky-500/80 to-blue-700/80",
    borderGlow: "hover:border-sky-500/40",
    glowColor: "rgba(56, 189, 248, 0.15)",
  },
  "Finance & Corporate": {
    badge: "text-emerald-300 bg-emerald-500/10 border-emerald-500/25",
    borderHover: "hover:border-emerald-500/40",
    textHover: "group-hover:text-emerald-300",
    readMore: "text-emerald-400/70 hover:text-emerald-300",
    accentBg: "from-emerald-950/20 to-zinc-950/60",
    dotBg: "bg-emerald-400",
    pillActive: "border-emerald-500/40 text-emerald-200 bg-emerald-500/15 shadow-sm",
    icon: TrendingUp,
    emoji: "📈",
    subtitle: "Markets, Sensex, Earnings & Macro Deals",
    gradient: "from-emerald-500/80 to-teal-700/80",
    borderGlow: "hover:border-emerald-500/40",
    glowColor: "rgba(16, 185, 129, 0.15)",
  },
  Sports: {
    badge: "text-amber-300 bg-amber-500/10 border-amber-500/25",
    borderHover: "hover:border-amber-500/40",
    textHover: "group-hover:text-amber-300",
    readMore: "text-amber-400/70 hover:text-amber-300",
    accentBg: "from-amber-950/20 to-zinc-950/60",
    dotBg: "bg-amber-400",
    pillActive: "border-amber-500/40 text-amber-200 bg-amber-500/15 shadow-sm",
    icon: Trophy,
    emoji: "🏆",
    subtitle: "Scores, F1, Cricket, Football & Match Pulse",
    gradient: "from-amber-500/80 to-orange-700/80",
    borderGlow: "hover:border-amber-500/40",
    glowColor: "rgba(245, 158, 11, 0.15)",
  },
  default: {
    badge: "text-zinc-300 bg-zinc-800/60 border-zinc-700/40",
    borderHover: "hover:border-zinc-500/40",
    textHover: "group-hover:text-white",
    readMore: "text-zinc-400 hover:text-white",
    accentBg: "from-zinc-900/30 to-zinc-950/70",
    dotBg: "bg-zinc-400",
    pillActive: "border-zinc-500/40 text-zinc-100 bg-zinc-800/80 shadow-sm",
    icon: Newspaper,
    emoji: "📰",
    subtitle: "Global Wire Headlines & Stories",
    gradient: "from-zinc-600/80 to-zinc-800/80",
    borderGlow: "hover:border-zinc-600/40",
    glowColor: "rgba(255, 255, 255, 0.08)",
  },
};

export const FLASH_STORY_THEME = {
  icon: Zap,
  emoji: "⚡",
  label: "Top 60s Flash",
  subtitle: "Real-time Top Global Wire",
  gradient: "from-amber-500/80 to-rose-600/80",
  borderGlow: "hover:border-amber-500/40",
  glowColor: "rgba(245, 158, 11, 0.15)",
};

export function getCategoryTheme(category: string): CategoryTheme {
  return CATEGORY_THEMES[category as Category] || CATEGORY_THEMES.default;
}
