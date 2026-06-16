"use client";

import type { Article } from "@/lib/types";
import { timeAgo } from "@/lib/utils";
import WeatherWidget from "./weather-widget";

export default function Sidebar({
  latestNews,
}: {
  latestNews: Article[];
}) {
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
                {article.source} · {timeAgo(article.publishedAt)}
              </p>
            </a>
          ))}
        </div>
      </div>
    </aside>
  );
}
