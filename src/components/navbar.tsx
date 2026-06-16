"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { CATEGORIES } from "@/lib/types";
import type { Category } from "@/lib/types";
import { getCategoryTheme } from "@/lib/themes";

export default function Navbar({
  activeCategory,
  onCategoryChange,
}: {
  activeCategory?: Category | null;
  onCategoryChange?: (cat: Category | null) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const activePillClass = activeCategory
    ? `ios-pill ${getCategoryTheme(activeCategory).pillActive} backdrop-blur-xl`
    : "ios-pill ios-pill-active";

  return (
    <header className="sticky top-3 z-50 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="ios-glass ios-shimmer rounded-full px-5 py-2">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500/30 to-cyan-500/30 backdrop-blur-xl">
              <svg className="h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="8" width="18" height="13" rx="2" />
                <path d="M3 8l2-2M21 8l-2-2M8 12h8M8 16h8" />
              </svg>
            </div>
            <span className="text-base font-semibold tracking-tight text-white/90">
              Digital Daily
            </span>
          </Link>

          <nav className="hidden items-center gap-2 lg:flex">
            <button
              onClick={() => onCategoryChange?.(null)}
              className={activePillClass}
            >
              All
            </button>
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              const pillClass = isActive
                ? `ios-pill ${getCategoryTheme(cat).pillActive} backdrop-blur-xl`
                : "ios-pill ios-pill-inactive";
              return (
                <button
                  key={cat}
                  onClick={() => onCategoryChange?.(cat)}
                  className={pillClass}
                >
                  {cat}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-1.5 sm:flex">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400/70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-400" />
              </span>
              <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-white/30">
                Live
              </span>
            </div>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.06] bg-white/[0.04] text-white/40 backdrop-blur-xl lg:hidden"
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
            <div className="space-y-0.5 px-4 py-3">
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
