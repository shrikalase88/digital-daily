"use client";

import { useState, useEffect, useTransition, useMemo } from "react";
import Navbar from "@/components/navbar";
import HeroSection from "@/components/hero-section";
import CategorySection from "@/components/category-section";
import Sidebar from "@/components/sidebar";
import NewsCard from "@/components/news-card";
import Footer from "@/components/footer";
import { LiveSportsTicker } from "@/components/live-sports-ticker";
import type { Article, Category } from "@/lib/types";
import { CATEGORIES } from "@/lib/types";
import { handleError } from "@/lib/utils";

const BREAKING_KEYWORDS = [
  "breaking",
  "just in",
  "urgent",
  "exclusive",
  "developing",
];

const MAX_ARTICLES = 8;
const TICKER_INTERVAL = 5000;
const FEATURED_COUNT = 4;

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [, startTransition] = useTransition();
  const [tickerIndex, setTickerIndex] = useState(0);

  useEffect(() => {
    const url = new URL(window.location.href);
    const categoryParam = url.searchParams.get("category") as Category | null;
    if (categoryParam && CATEGORIES.includes(categoryParam)) {
      setActiveCategory(categoryParam);
    }
  }, []);

  async function fetchNews() {
    try {
      const res = await fetch("/api/news");
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      startTransition(() => {
        setArticles(data.articles || []);
        setError(null);
        setLoading(false);
      });
    } catch (error) {
      startTransition(() => {
        handleError(error, setError, "Could not load news.");
        setLoading(false);
      });
    }
  }

  useEffect(() => { fetchNews(); }, []);

  useEffect(() => {
    if (articles.length === 0) return;
    const timer = setInterval(() => {
      setTickerIndex((i) => (i + 1) % Math.min(articles.length, MAX_ARTICLES));
    }, TICKER_INTERVAL);
    return () => clearInterval(timer);
  }, [articles]);

  const filtered = useMemo(() => {
    if (!activeCategory) return articles;
    return articles.filter((a) => a.category === activeCategory);
  }, [articles, activeCategory]);

  const featured = useMemo(
    () => articles.filter((a) => a.imageUrl).slice(0, FEATURED_COUNT),
    [articles]
  );

  const trending = useMemo(
    () => articles.slice(0, MAX_ARTICLES),
    [articles]
  );

  const latest = trending;

  const categorized = useMemo(() => {
    const map: Record<string, Article[]> = {};
    for (const cat of CATEGORIES) map[cat] = [];
    for (const a of articles) {
      if (map[a.category]) map[a.category].push(a);
    }
    return map;
  }, [articles]);

  const breakingArticles = useMemo(
    () =>
      articles.filter(
        (a) =>
          BREAKING_KEYWORDS.some((kw) =>
            a.title.toLowerCase().includes(kw)
          ) ||
          a.category === "Politics & World"
      ),
    [articles]
  );

  return (
    <div className="relative min-h-screen">
      <Navbar
        activeCategory={activeCategory}
        onCategoryChange={(cat) => {
          setActiveCategory(cat);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />

      <div className="sticky top-[56px] z-40">
        <LiveSportsTicker />
      </div>

      <div className="relative">
        {!loading && breakingArticles.length > 0 && (
          <div className="ios-glass mx-auto mb-6 mt-4 max-w-7xl rounded-full px-4 py-2 sm:px-6">
            <div className="flex items-center gap-3">
              <span className="flex-shrink-0 rounded-full bg-rose-500/20 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-300 backdrop-blur-2xl">
                Breaking
              </span>
              <div className="overflow-hidden">
                <p
                  key={tickerIndex}
                  className="animate-fadeIn truncate text-sm text-white/60"
                >
                  <a
                    href={breakingArticles[tickerIndex]?.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white"
                  >
                    {breakingArticles[tickerIndex]?.title}
                  </a>
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {!activeCategory && !loading && (
            <HeroSection featured={featured} trending={trending} />
          )}

          {activeCategory && !loading && (
            <div className="mb-6">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => setActiveCategory(null)}
                  className="ios-pill ios-pill-inactive text-xs hover:bg-white/[0.04] hover:text-white/80"
                >
                  ← All News
                </button>
                <h1 className="text-lg font-bold text-white/90">
                  {activeCategory}
                </h1>
              </div>

              {filtered.length === 0 ? (
                <div className="ios-glass rounded-3xl p-8 text-center">
                  <p className="text-sm text-white/30">No stories in this category yet.</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filtered.map((article, i) => (
                    <NewsCard key={article.id + i} article={article} />
                  ))}
                </div>
              )}
            </div>
          )}

          {loading && (
            <div className="space-y-8">
              <div className="ios-glass h-64 animate-pulse rounded-3xl" />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="ios-glass h-52 animate-pulse rounded-3xl"
                  />
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="ios-glass rounded-3xl p-8 text-center">
              <p className="text-sm text-red-400/70">{error}</p>
              <button
                onClick={() => { setLoading(true); fetchNews(); }}
                className="mt-3 ios-pill ios-pill-inactive text-xs"
              >
                Try again
              </button>
            </div>
          )}

          {!loading && !error && !activeCategory && articles.length > 0 && (
            <div className="grid gap-12 lg:grid-cols-3">
              <div className="space-y-12 lg:col-span-2">
                {CATEGORIES.map((cat) => (
                  <CategorySection
                    key={cat}
                    category={cat}
                    articles={categorized[cat] || []}
                    onCategoryChange={setActiveCategory}
                  />
                ))}
              </div>

              <div className="lg:col-span-1">
                <Sidebar latestNews={latest} />
              </div>
            </div>
          )}
        </div>

        <Footer />
      </div>
    </div>
  );
}
