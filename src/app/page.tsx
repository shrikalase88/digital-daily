"use client";

import { useState, useEffect, useTransition, useMemo, useCallback } from "react";
import Navbar from "@/components/navbar";
import HeroSection from "@/components/hero-section";
import CategorySection from "@/components/category-section";
import Sidebar from "@/components/sidebar";
import NewsCard from "@/components/news-card";
import Footer from "@/components/footer";
import SearchBar from "@/components/search-bar";
import { SkeletonHero, SkeletonGrid } from "@/components/skeleton-card";
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
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [disabledSources, setDisabledSources] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("digital-daily-disabled-sources");
      if (stored) setDisabledSources(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);
    const categoryParam = url.searchParams.get("category") as Category | null;
    if (categoryParam && CATEGORIES.includes(categoryParam)) {
      setActiveCategory(categoryParam);
    }
  }, []);

  const fetchNews = useCallback(async () => {
    try {
      const res = await fetch("/api/news");
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      startTransition(() => {
        setArticles(data.articles || []);
        setLastUpdated(new Date().toISOString());
        setError(null);
        setLoading(false);
      });
    } catch (error) {
      startTransition(() => {
        handleError(error, setError, "Could not load news.");
        setLoading(false);
      });
    }
  }, []);

  useEffect(() => { fetchNews(); }, [fetchNews]);

  useEffect(() => {
    if (articles.length === 0) return;
    const timer = setInterval(() => {
      setTickerIndex((i) => (i + 1) % Math.min(articles.length, MAX_ARTICLES));
    }, TICKER_INTERVAL);
    return () => clearInterval(timer);
  }, [articles]);

  const allSources = useMemo(() => {
    const sourceSet = new Set(articles.map((a) => a.source));
    return Array.from(sourceSet).sort();
  }, [articles]);

  const activeSources = useMemo(
    () => allSources.filter((s) => !disabledSources.includes(s)),
    [allSources, disabledSources]
  );

  const handleSourceToggle = useCallback((source: string) => {
    setDisabledSources((prev) => {
      const next = prev.includes(source) ? prev.filter((s) => s !== source) : [...prev, source];
      try { localStorage.setItem("digital-daily-disabled-sources", JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const searchFiltered = useMemo(() => {
    let result = articles;
    if (disabledSources.length > 0) {
      result = result.filter((a) => !disabledSources.includes(a.source));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.source.toLowerCase().includes(q)
      );
    }
    return result;
  }, [articles, searchQuery, disabledSources]);

  const filtered = useMemo(() => {
    if (!activeCategory) return searchFiltered;
    return searchFiltered.filter((a) => a.category === activeCategory);
  }, [searchFiltered, activeCategory]);

  const featured = useMemo(() => {
    const withImages = searchFiltered.filter((a) => a.imageUrl);
    // Prefer articles with images, but fill with imageless ones if few have images
    if (withImages.length >= FEATURED_COUNT) return withImages.slice(0, FEATURED_COUNT);
    const without = searchFiltered.filter((a) => !a.imageUrl);
    return [...withImages, ...without].slice(0, FEATURED_COUNT);
  }, [searchFiltered]);

  const trending = useMemo(
    () => searchFiltered.slice(0, MAX_ARTICLES),
    [searchFiltered]
  );

  const latest = trending;

  const categorized = useMemo(() => {
    const map: Record<string, Article[]> = {};
    for (const cat of CATEGORIES) map[cat] = [];
    for (const a of searchFiltered) {
      if (map[a.category]) map[a.category].push(a);
    }
    return map;
  }, [searchFiltered]);

  const breakingArticles = useMemo(
    () =>
      searchFiltered.filter(
        (a) =>
          BREAKING_KEYWORDS.some((kw) =>
            a.title.toLowerCase().includes(kw)
          ) ||
          a.category === "Politics & World"
      ),
    [searchFiltered]
  );

  return (
    <div className="relative min-h-screen">
      <Navbar
        activeCategory={activeCategory}
        lastUpdated={lastUpdated}
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
          {!loading && !activeCategory && (
            <div className="mb-6">
              <SearchBar
                onSearch={setSearchQuery}
                sources={allSources}
                activeSources={activeSources}
                onSourceToggle={handleSourceToggle}
              />
            </div>
          )}

          {!activeCategory && !loading && <HeroSection featured={featured} trending={trending} />}

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
              <SkeletonHero />
              <SkeletonGrid />
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

          {!loading && !error && !activeCategory && searchFiltered.length > 0 && (
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
