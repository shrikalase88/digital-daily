"use client";

import { useState, useEffect, useTransition, useMemo, useCallback } from "react";
import { Sparkles, ArrowRight, Globe2 } from "lucide-react";
import Navbar from "@/components/navbar";
import HeroSection from "@/components/hero-section";
import CategorySection from "@/components/category-section";
import Sidebar from "@/components/sidebar";
import NewsCard from "@/components/news-card";
import Footer from "@/components/footer";
import SearchBar from "@/components/search-bar";
import StoryRings from "@/components/story-rings";
import StoryViewerModal from "@/components/story-viewer-modal";
import PulseDrawer from "@/components/pulse-drawer";
import MobileBottomDock from "@/components/mobile-bottom-dock";
import ViewModeToggle, { type ViewMode } from "@/components/view-mode-toggle";
import { SkeletonHero, SkeletonGrid } from "@/components/skeleton-card";
import { LiveSportsTicker } from "@/components/live-sports-ticker";
import type { Article, Category, Region } from "@/lib/types";
import { CATEGORIES, REGIONS } from "@/lib/types";
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

const REGION_LABELS: Record<Region, string> = {
  India: "🇮🇳 India",
  USA: "🇺🇸 USA",
  Europe: "🇪🇺 Europe",
  Global: "🌐 Global",
};

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [activeRegion, setActiveRegion] = useState<Region | "All">("All");
  const [, startTransition] = useTransition();
  const [tickerIndex, setTickerIndex] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [disabledSources, setDisabledSources] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("bento");

  // Interactive Modal & Drawer States
  const [storyModalOpen, setStoryModalOpen] = useState(false);
  const [storyInitialCategory, setStoryInitialCategory] = useState<Category | "All">("All");
  const [pulseDrawerOpen, setPulseDrawerOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("digital-daily-disabled-sources");
      if (stored) setDisabledSources(JSON.parse(stored));
      const storedView = localStorage.getItem("digital-daily-view-mode");
      if (storedView) setViewMode(storedView as ViewMode);
      const storedRegion = localStorage.getItem("digital-daily-region");
      if (storedRegion) setActiveRegion(storedRegion as Region | "All");
    } catch { /* ignore */ }
  }, []);

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    try {
      localStorage.setItem("digital-daily-view-mode", mode);
    } catch { /* ignore */ }
  };

  const handleRegionChange = (region: Region | "All") => {
    setActiveRegion(region);
    try {
      localStorage.setItem("digital-daily-region", region);
    } catch { /* ignore */ }
  };

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
    if (activeRegion !== "All") {
      result = result.filter((a) => a.region === activeRegion);
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
  }, [articles, searchQuery, disabledSources, activeRegion]);

  const filtered = useMemo(() => {
    if (!activeCategory) return searchFiltered;
    return searchFiltered.filter((a) => a.category === activeCategory);
  }, [searchFiltered, activeCategory]);

  const featured = useMemo(() => {
    const withImages = searchFiltered.filter((a) => a.imageUrl);
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

  const handleOpenStoryRing = (category: Category | "All") => {
    setStoryInitialCategory(category);
    setStoryModalOpen(true);
  };

  const handleScrollToSearch = () => {
    const searchEl = document.getElementById("main-search-bar");
    if (searchEl) {
      searchEl.scrollIntoView({ behavior: "smooth", block: "center" });
      const input = searchEl.querySelector("input");
      input?.focus();
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="relative min-h-screen pb-mobile-dock">
      {/* 2026 Responsive Navbar */}
      <Navbar
        activeCategory={activeCategory}
        lastUpdated={lastUpdated}
        onCategoryChange={(cat) => {
          setActiveCategory(cat);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onOpenPulse={() => setPulseDrawerOpen(true)}
        onOpenStories={() => {
          setStoryInitialCategory("All");
          setStoryModalOpen(true);
        }}
      />

      {/* Sticky All-in-One Live Pulse Ticker (Weather, Stocks & Sports) */}
      <div className="sticky top-[58px] z-40">
        <LiveSportsTicker onOpenPulse={() => setPulseDrawerOpen(true)} />
      </div>

      <div className="relative">
        {/* Dynamic Breaking News Alert Bar */}
        {!loading && breakingArticles.length > 0 && (
          <div className="mx-auto mb-4 mt-2 max-w-7xl 2xl:max-w-[1536px] px-4 sm:px-6 lg:px-8">
            <div className="ios-glass rounded-full px-3.5 py-1.5 sm:px-5 sm:py-2 border border-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.1)] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <span className="flex-shrink-0 rounded-full bg-rose-500/20 border border-rose-500/30 px-2.5 py-0.5 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-400 live-badge-beacon" />
                  Breaking
                </span>
                <div className="overflow-hidden min-w-0 flex-1">
                  <p
                    key={tickerIndex}
                    className="animate-fadeIn truncate text-xs sm:text-sm text-white/70 font-medium"
                  >
                    <a
                      href={breakingArticles[tickerIndex]?.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-white transition-colors"
                    >
                      {breakingArticles[tickerIndex]?.title}
                    </a>
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleOpenStoryRing("All")}
                className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 hover:text-rose-300 transition-colors shrink-0"
              >
                Watch 60s <ArrowRight size={11} />
              </button>
            </div>
          </div>
        )}

        <div className="mx-auto max-w-7xl 2xl:max-w-[1536px] px-4 py-4 sm:px-6 lg:px-8">
          {/* Interactive Story Rings / Channel Deck Bar */}
          {!loading && (
            <StoryRings
              onSelectStory={handleOpenStoryRing}
              activeCategory={activeCategory}
            />
          )}

          {/* Search, Region Filter & View Mode Controls */}
          {!loading && (
            <div className="mb-6 space-y-3" id="main-search-bar">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <SearchBar
                    onSearch={setSearchQuery}
                    sources={allSources}
                    activeSources={activeSources}
                    onSourceToggle={handleSourceToggle}
                  />
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-2">
                  <span className="text-[11px] text-white/40 sm:hidden">Layout:</span>
                  <ViewModeToggle
                    viewMode={viewMode}
                    onViewModeChange={handleViewModeChange}
                  />
                </div>
              </div>

              {/* ── Regional Filter Pills (India, USA, Europe, Global) ── */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                <div className="flex items-center gap-1 text-[11px] font-bold text-white/40 uppercase tracking-wider mr-1 shrink-0">
                  <Globe2 size={12} className="text-cyan-400" />
                  <span>Region:</span>
                </div>
                <button
                  onClick={() => handleRegionChange("All")}
                  className={`ios-pill text-xs font-semibold shrink-0 ${
                    activeRegion === "All" ? "ios-pill-active" : "ios-pill-inactive"
                  }`}
                >
                  All Regions
                </button>
                {REGIONS.map((region) => {
                  const isActive = activeRegion === region;
                  return (
                    <button
                      key={region}
                      onClick={() => handleRegionChange(region)}
                      className={`ios-pill text-xs font-semibold shrink-0 ${
                        isActive ? "ios-pill-active" : "ios-pill-inactive"
                      }`}
                    >
                      {REGION_LABELS[region]}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Hero Section */}
          {!activeCategory && !loading && searchFiltered.length > 0 && (
            <HeroSection featured={featured} trending={trending} />
          )}

          {/* Active Category Page View */}
          {activeCategory && !loading && (
            <div className="mb-8">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => setActiveCategory(null)}
                  className="ios-pill ios-pill-inactive text-xs hover:bg-white/[0.06] hover:text-white"
                >
                  ← All Stories
                </button>
                <div className="flex items-center gap-3">
                  <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                    {activeCategory} {activeRegion !== "All" ? `(${REGION_LABELS[activeRegion]})` : ""}
                  </h1>
                </div>
              </div>

              {filtered.length === 0 ? (
                <div className="ios-glass rounded-3xl p-12 text-center border border-white/10">
                  <Sparkles size={32} className="mx-auto mb-3 text-white/20" />
                  <p className="text-sm text-white/40">No stories found matching the current filters.</p>
                </div>
              ) : (
                <div
                  className={
                    viewMode === "compact"
                      ? "news-compact-grid"
                      : viewMode === "visual"
                      ? "news-visual-grid"
                      : "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  }
                >
                  {filtered.map((article, i) => (
                    <NewsCard key={article.id + i} article={article} viewMode={viewMode} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Skeletons while loading */}
          {loading && (
            <div className="space-y-8">
              <SkeletonHero />
              <SkeletonGrid />
            </div>
          )}

          {/* Error display */}
          {error && (
            <div className="ios-glass rounded-3xl p-8 text-center border border-red-500/20">
              <p className="text-sm text-red-400/80">{error}</p>
              <button
                onClick={() => { setLoading(true); fetchNews(); }}
                className="mt-4 ios-pill ios-pill-inactive text-xs hover:text-white"
              >
                Retry News Stream
              </button>
            </div>
          )}

          {/* Category Sections & Sticky Sidebar */}
          {!loading && !error && !activeCategory && searchFiltered.length > 0 && (
            <div className="grid gap-10 lg:grid-cols-3">
              <div className="space-y-10 lg:col-span-2">
                {CATEGORIES.map((cat) => (
                  <CategorySection
                    key={cat}
                    category={cat}
                    articles={categorized[cat] || []}
                    onCategoryChange={setActiveCategory}
                    viewMode={viewMode}
                  />
                ))}
              </div>

              <div className="lg:col-span-1">
                <Sidebar
                  latestNews={latest}
                  onOpenPulse={() => setPulseDrawerOpen(true)}
                />
              </div>
            </div>
          )}
        </div>

        <Footer />
      </div>

      {/* 2026 60s Vertical & Panoramic Story Viewer Modal */}
      <StoryViewerModal
        isOpen={storyModalOpen}
        onClose={() => setStoryModalOpen(false)}
        articles={searchFiltered}
        initialCategory={storyInitialCategory}
      />

      {/* Live Pulse Mobile Drawer (Sports, Markets, Weather) */}
      <PulseDrawer
        isOpen={pulseDrawerOpen}
        onClose={() => setPulseDrawerOpen(false)}
      />

      {/* Floating 2026 Dynamic Glass Dock for Mobile */}
      <MobileBottomDock
        onOpenStories={() => {
          setStoryInitialCategory("All");
          setStoryModalOpen(true);
        }}
        onOpenPulse={() => setPulseDrawerOpen(true)}
        onOpenSearch={handleScrollToSearch}
      />
    </div>
  );
}
