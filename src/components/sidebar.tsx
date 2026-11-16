"use client";

import { Flame, ArrowUpRight } from "lucide-react";
import type { Article } from "@/lib/types";
import { timeAgo, useIsMounted } from "@/lib/utils";
import { getCategoryTheme } from "@/lib/themes";
import WeatherWidget from "@/components/weather-widget";

export default function Sidebar({
  latestNews,
  onOpenPulse,
}: {
  latestNews: Article[];
  onOpenPulse?: () => void;
}) {
  const isMounted = useIsMounted();

  const topStories = latestNews.slice(0, 5);
  const deepDives = latestNews.slice(5, 10);

  return (
    <aside className="space-y-5 lg:sticky lg:top-24 self-start">
      {/* ── 1. Weather Widget with One-Click Location Picker ── */}
      <WeatherWidget />

      {/* ── 2. Live Wire / Fast Breaking Stream ── */}
      <div className="ios-glass rounded-3xl p-5 border border-white/10 shadow-xl">
        <div className="mb-3.5 flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 live-badge-beacon" />
            <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-300">
              Live Wire
            </h3>
          </div>
          {onOpenPulse ? (
            <button
              onClick={onOpenPulse}
              className="inline-flex items-center gap-0.5 text-[10px] text-zinc-400 hover:text-white font-mono uppercase tracking-wider transition-colors"
            >
              <span>Pulse Hub</span>
              <ArrowUpRight size={11} />
            </button>
          ) : (
            <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">
              Real-Time
            </span>
          )}
        </div>

        <div className="space-y-1">
          {topStories.map((article, i) => {
            const theme = getCategoryTheme(article.category);
            const Icon = theme.icon;

            return (
              <a
                key={article.id + i}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block border-b border-white/[0.04] py-2.5 last:border-0 transition-colors hover:bg-white/[0.03] px-2 rounded-2xl"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span
                    className={`inline-flex items-center gap-1 text-[9px] font-bold border px-1.5 py-0.2 rounded-full uppercase ${theme.badge}`}
                  >
                    <Icon size={9} className="text-current" />
                    {article.category}
                  </span>
                  <span className="text-[10px] text-zinc-400 truncate">
                    {article.source}
                  </span>
                </div>

                <p className="line-clamp-2 text-xs font-medium leading-snug text-zinc-200 transition-colors group-hover:text-white">
                  {article.title}
                </p>

                <p className="mt-1 text-[10px] text-zinc-500 font-mono">
                  {isMounted ? timeAgo(article.publishedAt) : "just now"}
                </p>
              </a>
            );
          })}
        </div>
      </div>

      {/* ── 3. Top Ranked Reading List ── */}
      {deepDives.length > 0 && (
        <div className="ios-glass rounded-3xl p-5 border border-white/10 shadow-xl">
          <div className="mb-3.5 flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <Flame size={13} className="text-amber-400" />
              <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-300">
                Most Discussed
              </h3>
            </div>
            <span className="text-[10px] text-amber-300/80 font-mono uppercase tracking-wider">
              Trending
            </span>
          </div>

          <div className="space-y-1.5">
            {deepDives.map((article, i) => (
              <a
                key={article.id + i}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-3 py-2 px-2 rounded-2xl hover:bg-white/[0.03] transition-colors"
              >
                <span className="font-mono text-base font-bold text-zinc-600 group-hover:text-amber-400 transition-colors shrink-0 mt-0.5">
                  0{i + 1}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-xs font-medium text-zinc-300 group-hover:text-white leading-snug transition-colors">
                    {article.title}
                  </p>
                  <p className="mt-1 text-[10px] text-zinc-500 font-mono">
                    {article.source}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
