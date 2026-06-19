"use client";

import { useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { Bookmark } from "lucide-react";
import { CATEGORIES } from "@/lib/types";
import type { Category } from "@/lib/types";
import { getCategoryTheme } from "@/lib/themes";
import { timeAgo } from "@/lib/utils";
import CategoryPillList from "./CategoryPillList";

function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export default function Navbar({
  activeCategory,
  onCategoryChange,
  lastUpdated,
}: {
  activeCategory?: Category | null;
  onCategoryChange?: (cat: Category | null) => void;
  lastUpdated?: string | null;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const mounted = useHydrated();

  return (
    <header className="sticky top-3 z-50 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="ios-glass ios-shimmer rounded-full px-4 py-1.5 sm:px-5 sm:py-2">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex flex-shrink-0 items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500/30 to-cyan-500/30">
              <svg className="h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="8" width="18" height="13" rx="2" />
                <path d="M3 8l2-2M21 8l-2-2M8 12h8M8 16h8" />
              </svg>
            </div>
            <span className="text-sm font-semibold tracking-tight text-white/90 sm:text-base">
              Digital Daily
            </span>
          </Link>

          <nav className="hidden items-center gap-1.5 lg:flex" role="tablist">
            <button
              role="tab"
              aria-selected={activeCategory === null}
              onClick={() => onCategoryChange?.(null)}
              className={`ios-pill text-xs ${activeCategory ? "ios-pill-inactive" : "ios-pill-active"} focus-visible:ring-2 focus-visible:ring-white`}
            >
              All
            </button>
            <CategoryPillList activeCategory={activeCategory} onCategoryChange={onCategoryChange} />
          </nav>

          <div className="flex items-center gap-2.5">
            {lastUpdated && (
              <span className="hidden text-[10px] text-white/25 sm:inline">
                Updated {mounted ? timeAgo(lastUpdated) : "just now"}
              </span>
            )}
            <Link
              href="/bookmarks"
              className="ios-glass flex h-7 w-7 items-center justify-center rounded-full text-white/40 transition-colors hover:text-white/70"
              aria-label="Bookmarks"
            >
              <Bookmark size={13} />
            </Link>

            <button
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen(!menuOpen)}
              className="ios-glass flex h-8 w-8 items-center justify-center rounded-full text-white/40 lg:hidden"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="ios-glass mt-2 overflow-hidden rounded-2xl lg:hidden"
          >
            <div className="space-y-1 px-4 py-3">
              <button
                onClick={() => { onCategoryChange?.(null); setMenuOpen(false); }}
                className={`block w-full rounded-xl px-3 py-2.5 text-left text-sm ${
                  !activeCategory ? "ios-pill-active" : "text-white/50"
                }`}
              >
                All News
              </button>
              {CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => { onCategoryChange?.(cat); setMenuOpen(false); }}
                    className={`block w-full rounded-xl px-3 py-2.5 text-left text-sm ${
                      isActive ? getCategoryTheme(cat).pillActive : "text-white/50"
                    }`}
                  >
                    {cat}
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
