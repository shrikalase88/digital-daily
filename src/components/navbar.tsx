"use client";

import { useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { Bookmark, Activity, Zap, Newspaper } from "lucide-react";
import { CATEGORIES } from "@/lib/types";
import type { Category } from "@/lib/types";
import { getCategoryTheme } from "@/lib/themes";
import { timeAgo } from "@/lib/utils";
import CategoryPillList from "./CategoryPillList";

function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

interface NavbarProps {
  activeCategory?: Category | null;
  onCategoryChange?: (cat: Category | null) => void;
  lastUpdated?: string | null;
  onOpenPulse?: () => void;
  onOpenStories?: () => void;
}

export default function Navbar({
  activeCategory,
  onCategoryChange,
  lastUpdated,
  onOpenPulse,
  onOpenStories,
}: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const mounted = useHydrated();

  return (
    <header className="sticky top-2 z-50 mx-auto max-w-7xl 2xl:max-w-[1536px] px-4 sm:px-6 lg:px-8">
      <div className="ios-glass rounded-full px-4 py-2 sm:px-5">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex flex-shrink-0 items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.08] border border-white/15 text-white shadow-sm transition-transform duration-200 group-hover:scale-105 active:scale-95">
              <svg
                className="h-4 w-4 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
              >
                <rect x="3" y="8" width="18" height="13" rx="2" />
                <path d="M3 8l2-2M21 8l-2-2M8 12h8M8 16h8" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight text-white sm:text-base leading-none">
                Digital Daily
              </span>
              <span className="text-[9px] uppercase tracking-[0.18em] text-zinc-400 font-medium hidden sm:inline leading-none mt-1">
                Global Wire Edition
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-1.5 lg:flex" role="tablist">
            <button
              role="tab"
              aria-selected={activeCategory === null}
              onClick={() => onCategoryChange?.(null)}
              className={`ios-pill text-xs inline-flex items-center gap-1.5 active:scale-[0.98] ${
                activeCategory ? "ios-pill-inactive" : "ios-pill-active"
              } focus-visible:ring-2 focus-visible:ring-white`}
            >
              <Newspaper
                size={13}
                className={!activeCategory ? "text-current" : "text-zinc-400"}
              />
              <span>All</span>
            </button>
            <CategoryPillList
              activeCategory={activeCategory}
              onCategoryChange={onCategoryChange}
            />
          </nav>

          <div className="flex items-center gap-2">
            {/* Quick 60s Stories trigger button */}
            {onOpenStories && (
              <button
                onClick={onOpenStories}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 px-3 py-1 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 active:scale-[0.98] transition-all"
              >
                <Zap size={13} className="text-amber-400 fill-amber-400" />
                <span>60s Flash</span>
              </button>
            )}

            {/* Quick Live Pulse button */}
            {onOpenPulse && (
              <button
                onClick={onOpenPulse}
                className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 border border-rose-500/25 px-2.5 sm:px-3 py-1 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 active:scale-[0.98] transition-all"
              >
                <span className="flex h-1.5 w-1.5 rounded-full bg-rose-400 live-badge-beacon" />
                <span className="hidden sm:inline">Live Pulse</span>
                <Activity size={13} className="sm:hidden" />
              </button>
            )}

            {lastUpdated && (
              <span className="hidden text-[10px] text-zinc-400 xl:inline font-mono">
                {mounted ? timeAgo(lastUpdated) : "just now"}
              </span>
            )}

            <Link
              href="/bookmarks"
              className="ios-glass flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition-colors hover:text-white active:scale-95"
              aria-label="Bookmarks"
            >
              <Bookmark size={14} />
            </Link>

            <button
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen(!menuOpen)}
              className="ios-glass flex h-8 w-8 items-center justify-center rounded-full text-zinc-300 hover:text-white lg:hidden active:scale-95"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.75}
              >
                {menuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="ios-glass-elevated mt-2 overflow-hidden rounded-3xl lg:hidden p-3 border border-white/10"
          >
            <div className="space-y-1">
              <button
                onClick={() => {
                  onCategoryChange?.(null);
                  setMenuOpen(false);
                }}
                className={`flex items-center gap-2.5 w-full rounded-2xl px-3.5 py-2.5 text-left text-sm font-medium transition-colors ${
                  !activeCategory
                    ? "ios-pill-active"
                    : "text-zinc-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Newspaper size={15} />
                <span>All News</span>
              </button>
              {CATEGORIES.map((cat) => {
                const theme = getCategoryTheme(cat);
                const Icon = theme.icon;
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      onCategoryChange?.(cat);
                      setMenuOpen(false);
                    }}
                    className={`flex items-center gap-2.5 w-full rounded-2xl px-3.5 py-2.5 text-left text-sm font-medium transition-colors ${
                      isActive
                        ? theme.pillActive
                        : "text-zinc-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon size={15} />
                    <span>{cat}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
