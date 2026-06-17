"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
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
    <div className="relative min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center gap-4">
          <Link
            href="/"
            className="ios-pill ios-pill-inactive text-xs hover:bg-white/[0.04] hover:text-white/80"
          >
            ← Back
          </Link>
          <h1 className="text-lg font-bold text-white/90">Bookmarks</h1>
          <span className="text-xs text-white/30">{bookmarkIds.length} saved</span>
        </div>

        {loading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="ios-glass h-52 animate-pulse rounded-3xl" />
            ))}
          </div>
        )}

        {!loading && bookmarkIds.length === 0 && (
          <div className="ios-glass rounded-3xl p-12 text-center">
            <p className="text-sm text-white/30">No bookmarks yet. Save articles to read later.</p>
            <Link href="/" className="mt-4 inline-block ios-pill ios-pill-inactive text-xs">
              Browse news
            </Link>
          </div>
        )}

        {!loading && bookmarkIds.length > 0 && articles.length === 0 && (
          <div className="ios-glass rounded-3xl p-12 text-center">
            <p className="text-sm text-white/30">Some bookmarked articles may no longer be available.</p>
            <Link href="/" className="mt-4 inline-block ios-pill ios-pill-inactive text-xs">
              Browse news
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
