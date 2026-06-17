"use client";

import { useSyncExternalStore } from "react";
import type { Article } from "@/lib/types";
import WeatherWidget from "./weather-widget";

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(diff / 3600000);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export default function Sidebar({
  latestNews,
}: {
  latestNews: Article[];
}) {
  const isMounted = useIsMounted();

  return (
    <aside className="space-y-6">
      {/* Reusable Weather Widget */}
      <WeatherWidget />

      {/* Latest News Section */}
      <div className="ios-glass rounded-3xl p-5">
        <div className="mb-4 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/40">
            Latest
          </h3>
        </div>

        <div className="space-y-1">
          {latestNews.slice(0, 5).map((article, i) => (
            <a
              key={article.id + i}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block border-b border-white/[0.03] py-2.5 last:border-0"
            >
              <p className="line-clamp-2 text-sm leading-snug text-white/65 transition-colors group-hover:text-white">
                {article.title}
              </p>
              <p className="mt-1 text-[11px] text-white/25">
                {article.source} · {isMounted ? timeAgo(article.publishedAt) : "just now"}
              </p>
            </a>
          ))}
        </div>
      </div>
    </aside>
  );
}
