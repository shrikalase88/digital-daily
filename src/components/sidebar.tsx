"use client";

import { Flame } from "lucide-react";
import type { Article } from "@/lib/types";
import { timeAgo, useIsMounted } from "@/lib/utils";
import { getCategoryTheme } from "@/lib/themes";

export default function Sidebar({
  latestNews,
}: {
  latestNews: Article[];
  onOpenPulse?: () => void;
}) {
  const isMounted = useIsMounted();

  const topStories = latestNews.slice(0, 6);
  const deepDives = latestNews.slice(6, 11);

  return (
    <aside className="space-y-6 lg:sticky lg:top-24 self-start">
      {/* ── 1. Live Wire / Fast Breaking Stream ── */}
      <div className="ios-glass rounded-3xl p-5 border border-white/10 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
            <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-white/80">
              Live Wire
            </h3>
          </div>
          <span className="text-[10px] text-white/35 font-semibold uppercase tracking-wider">
            Real-Time
          </span>
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
                className="group block border-b border-white/[0.04] py-3 last:border-0 transition-all hover:bg-white/[0.03] px-2 rounded-2xl"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`inline-flex items-center gap-1 text-[9px] font-extrabold border px-1.5 py-0.2 rounded-full uppercase ${theme.badge}`}>
                    <Icon size={9} className="text-current" />
                    {article.category}
                  </span>
                  <span className="text-[10px] text-white/30 truncate">
                    {article.source}
                  </span>
                </div>

                <p className="line-clamp-2 text-xs sm:text-[13px] font-semibold leading-snug text-white/80 transition-colors group-hover:text-white">
                  {article.title}
                </p>

                <p className="mt-1 text-[10px] text-white/30 font-medium">
                  {isMounted ? timeAgo(article.publishedAt) : "just now"}
                </p>
              </a>
            );
          })}
        </div>
      </div>

      {/* ── 2. Top Ranked Reading List (Apple News 01-05 Style) ── */}
      {deepDives.length > 0 && (
        <div className="ios-glass rounded-3xl p-5 border border-white/10 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame size={14} className="text-amber-400" />
              <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-white/80">
                Most Discussed
              </h3>
            </div>
            <span className="text-[10px] text-amber-400/80 font-bold uppercase tracking-wider">
              Trending
            </span>
          </div>

          <div className="space-y-2">
            {deepDives.map((article, i) => (
              <a
                key={article.id + i}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-3.5 py-2.5 px-2 rounded-2xl hover:bg-white/[0.03] transition-all"
              >
                <span className="font-mono text-lg font-black text-white/20 group-hover:text-amber-400 transition-colors shrink-0">
                  0{i + 1}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-xs font-medium text-white/70 group-hover:text-white leading-snug transition-colors">
                    {article.title}
                  </p>
                  <p className="mt-1 text-[10px] text-white/30">
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
