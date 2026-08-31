"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { Bookmark, Sparkles, ArrowLeft } from "lucide-react";
import NewsCard from "@/components/news-card";
import type { Article } from "@/lib/types";

const STORAGE_KEY = "digital-daily-bookmarks";

function loadIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export default function BookmarksPage() {
  const [bookmarkIds] = useState<string[]>(loadIds);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(() => loadIds().length > 0);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (bookmarkIds.length === 0) return;

    let cancelled = false;
    fetch("/api/news")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        const all: Article[] = data.articles || [];
        startTransition(() => {
          setArticles(all.filter((a) => bookmarkIds.includes(a.id)));
          setLoading(false);
        });
      })
      .catch(() => {
        if (!cancelled) {
          startTransition(() => setLoading(false));
        }
      });

    return () => { cancelled = true; };
  }, [bookmarkIds, startTransition]);

  return (
    <div className="relative min-h-screen pb-mobile-dock">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex h-9 w-9 items-center justify-center rounded-full ios-glass text-white/70 hover:text-white transition-colors"
              aria-label="Back to home"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <Bookmark size={20} className="text-amber-400" />
                Saved Bookmarks
              </h1>
              <p className="text-xs text-white/40">
                {bookmarkIds.length} {bookmarkIds.length === 1 ? "story" : "stories"} saved for offline reading
              </p>
            </div>
          </div>
        </div>

        {loading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="ios-glass-elevated h-64 animate-pulse rounded-3xl" />
            ))}
          </div>
        )}

        {!loading && bookmarkIds.length === 0 && (
          <div className="ios-glass-elevated rounded-3xl p-16 text-center border border-white/10 max-w-md mx-auto my-12">
            <Bookmark size={36} className="mx-auto mb-3 text-amber-400/40" />
            <h3 className="text-base font-bold text-white mb-1">No bookmarks yet</h3>
            <p className="text-xs text-white/40 mb-5">Tap the bookmark icon on any story to save it here for quick access.</p>
            <Link href="/" className="inline-flex items-center gap-2 ios-pill ios-pill-active text-xs font-semibold px-5 py-2">
              Browse Live Feed
            </Link>
          </div>
        )}

        {!loading && bookmarkIds.length > 0 && articles.length === 0 && (
          <div className="ios-glass rounded-3xl p-12 text-center border border-white/10 max-w-md mx-auto my-12">
            <Sparkles size={32} className="mx-auto mb-3 text-white/20" />
            <p className="text-sm text-white/40">Some saved articles have expired or are no longer in the active stream.</p>
            <Link href="/" className="mt-4 inline-block ios-pill ios-pill-inactive text-xs">
              Back to News
            </Link>
          </div>
        )}

        {!loading && articles.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {articles.map((article, i) => (
              <NewsCard key={article.id + i} article={article} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
