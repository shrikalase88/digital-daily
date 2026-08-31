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
    badge: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    borderHover: "hover:border-rose-500/30",
    textHover: "group-hover:text-rose-400",
    readMore: "text-rose-400/50 hover:text-rose-400",
    accentBg: "from-rose-950/20 to-slate-950/60",
    dotBg: "bg-rose-400",
    pillActive: "border-rose-500/30 text-rose-400 bg-rose-500/10 shadow-rose-500/15",
    icon: Globe2,
    emoji: "🌐",
    subtitle: "Geopolitics, World Affairs & Global Wire",
    gradient: "from-pink-500 via-rose-500 to-amber-500",
    borderGlow: "hover:border-pink-500/50",
    glowColor: "rgba(244, 63, 94, 0.4)",
  },
  Technology: {
    badge: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    borderHover: "hover:border-cyan-500/30",
    textHover: "group-hover:text-cyan-400",
    readMore: "text-cyan-400/50 hover:text-cyan-400",
    accentBg: "from-cyan-950/20 to-slate-950/60",
    dotBg: "bg-cyan-400",
    pillActive: "border-cyan-500/30 text-cyan-400 bg-cyan-500/10 shadow-cyan-500/15",
    icon: Cpu,
    emoji: "🚀",
    subtitle: "AI, Silicon, Cloud & Frontier Tech",
    gradient: "from-cyan-400 via-blue-500 to-indigo-600",
    borderGlow: "hover:border-cyan-500/50",
    glowColor: "rgba(6, 182, 212, 0.4)",
  },
  "Finance & Corporate": {
    badge: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    borderHover: "hover:border-emerald-500/30",
    textHover: "group-hover:text-emerald-400",
    readMore: "text-emerald-400/50 hover:text-emerald-400",
    accentBg: "from-emerald-950/20 to-slate-950/60",
    dotBg: "bg-emerald-400",
    pillActive: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10 shadow-emerald-500/15",
    icon: TrendingUp,
    emoji: "📈",
    subtitle: "Markets, Sensex, Earnings & Macro Deals",
    gradient: "from-emerald-400 via-teal-500 to-cyan-500",
    borderGlow: "hover:border-emerald-500/50",
    glowColor: "rgba(16, 185, 129, 0.4)",
  },
  Sports: {
    badge: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    borderHover: "hover:border-amber-500/30",
    textHover: "group-hover:text-amber-400",
    readMore: "text-amber-400/50 hover:text-amber-400",
    accentBg: "from-amber-950/20 to-slate-950/60",
    dotBg: "bg-amber-400",
    pillActive: "border-amber-500/30 text-amber-400 bg-amber-500/10 shadow-amber-500/15",
    icon: Trophy,
    emoji: "🏆",
    subtitle: "Scores, F1, Cricket, Football & Match Pulse",
    gradient: "from-amber-400 via-orange-500 to-rose-500",
    borderGlow: "hover:border-amber-500/50",
    glowColor: "rgba(245, 158, 11, 0.4)",
  },
  default: {
    badge: "text-slate-400 bg-slate-500/10 border-slate-500/20",
    borderHover: "hover:border-slate-500/30",
    textHover: "group-hover:text-white",
    readMore: "text-slate-400/50 hover:text-slate-400",
    accentBg: "from-slate-900/20 to-slate-950/60",
    dotBg: "bg-slate-400",
    pillActive: "border-slate-500/30 text-slate-400 bg-slate-500/10 shadow-slate-500/15",
    icon: Newspaper,
    emoji: "📰",
    subtitle: "Global Wire Headlines & Stories",
    gradient: "from-rose-500 via-fuchsia-500 to-indigo-500",
    borderGlow: "hover:border-rose-500/50",
    glowColor: "rgba(244, 63, 94, 0.4)",
  },
};

export const FLASH_STORY_THEME = {
  icon: Zap,
  emoji: "⚡",
  label: "Top 60s Flash",
  subtitle: "Real-time Top Global Wire",
  gradient: "from-rose-500 via-fuchsia-500 to-indigo-500",
  borderGlow: "hover:border-rose-500/50",
  glowColor: "rgba(244, 63, 94, 0.4)",
};

export function getCategoryTheme(category: string): CategoryTheme {
  return CATEGORY_THEMES[category as Category] || CATEGORY_THEMES.default;
}
