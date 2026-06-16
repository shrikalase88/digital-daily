import type { Category } from "./types";

export interface CategoryTheme {
  badge: string;
  borderHover: string;
  textHover: string;
  accentBg: string;
  dotBg: string;
  pillActive: string;
}

export const CATEGORY_THEMES: Record<Category | "default", CategoryTheme> = {
  "Politics & World": {
    badge: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    borderHover: "hover:border-rose-500/30",
    textHover: "group-hover:text-rose-400",
    accentBg: "from-rose-950/20 to-slate-950/60",
    dotBg: "bg-rose-400",
    pillActive: "border-rose-500/30 text-rose-400 bg-rose-500/10 shadow-rose-500/15",
  },
  Technology: {
    badge: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    borderHover: "hover:border-cyan-500/30",
    textHover: "group-hover:text-cyan-400",
    accentBg: "from-cyan-950/20 to-slate-950/60",
    dotBg: "bg-cyan-400",
    pillActive: "border-cyan-500/30 text-cyan-400 bg-cyan-500/10 shadow-cyan-500/15",
  },
  "Finance & Corporate": {
    badge: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    borderHover: "hover:border-emerald-500/30",
    textHover: "group-hover:text-emerald-400",
    accentBg: "from-emerald-950/20 to-slate-950/60",
    dotBg: "bg-emerald-400",
    pillActive: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10 shadow-emerald-500/15",
  },
  Sports: {
    badge: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    borderHover: "hover:border-amber-500/30",
    textHover: "group-hover:text-amber-400",
    accentBg: "from-amber-950/20 to-slate-950/60",
    dotBg: "bg-amber-400",
    pillActive: "border-amber-500/30 text-amber-400 bg-amber-500/10 shadow-amber-500/15",
  },
  default: {
    badge: "text-slate-400 bg-slate-500/10 border-slate-500/20",
    borderHover: "hover:border-slate-500/30",
    textHover: "group-hover:text-white",
    accentBg: "from-slate-900/20 to-slate-950/60",
    dotBg: "bg-slate-400",
    pillActive: "border-slate-500/30 text-slate-400 bg-slate-500/10 shadow-slate-500/15",
  },
};

export function getCategoryTheme(category: string): CategoryTheme {
  return CATEGORY_THEMES[category as Category] || CATEGORY_THEMES.default;
}
