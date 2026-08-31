"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Bookmark, BookmarkCheck, ExternalLink, Share2, Sparkles, Clock, Pause, Play } from "lucide-react";
import type { Article, Category } from "@/lib/types";
import { getCategoryTheme } from "@/lib/themes";
import { timeAgo, estimateReadTime } from "@/lib/utils";
import { useBookmarks } from "@/hooks/use-bookmarks";

interface StoryViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  articles: Article[];
  initialCategory?: Category | "All";
}

const STORY_DURATION_MS = 6000;

function StoryViewerContent({
  onClose,
  articles,
  initialCategory = "All",
}: {
  onClose: () => void;
  articles: Article[];
  initialCategory?: Category | "All";
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const { bookmarks, toggleBookmark } = useBookmarks();
  const startTimeRef = useRef<number>(0);
  const pauseTimeRef = useRef<number | null>(null);

  const filteredStories = articles
    .filter((a) => {
      if (initialCategory === "All" || !initialCategory) return true;
      return a.category === initialCategory;
    })
    .slice(0, 12);

  const totalStories = filteredStories.length;
  const currentArticle = filteredStories[currentIndex] || filteredStories[0];
  const isBookmarked = currentArticle ? bookmarks.includes(currentArticle.id) : false;
  const theme = currentArticle ? getCategoryTheme(currentArticle.category) : null;

  useEffect(() => {
    startTimeRef.current = Date.now();
  }, []);

  const handleNext = useCallback(() => {
    setCurrentIndex((curr) => {
      if (curr < totalStories - 1) {
        setProgress(0);
        startTimeRef.current = Date.now();
        return curr + 1;
      } else {
        onClose();
        return curr;
      }
    });
  }, [totalStories, onClose]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((curr) => {
      if (curr > 0) {
        setProgress(0);
        startTimeRef.current = Date.now();
        return curr - 1;
      }
      return curr;
    });
  }, []);

  // Progress ticker & auto advance
  useEffect(() => {
    if (isPaused || totalStories === 0) return;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min(100, (elapsed / STORY_DURATION_MS) * 100);
      setProgress(pct);

      if (pct >= 100) {
        handleNext();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isPaused, handleNext, totalStories]);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === " ") {
        e.preventDefault();
        setIsPaused((p) => !p);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev, onClose]);

  const handleHoldStart = () => {
    setIsPaused(true);
    pauseTimeRef.current = Date.now();
  };

  const handleHoldEnd = () => {
    if (pauseTimeRef.current) {
      const pausedDuration = Date.now() - pauseTimeRef.current;
      startTimeRef.current += pausedDuration;
    }
    setIsPaused(false);
    pauseTimeRef.current = null;
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentArticle) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: currentArticle.title,
          url: currentArticle.url,
        });
      } else {
        await navigator.clipboard.writeText(currentArticle.url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      /* ignore */
    }
  };

  if (totalStories === 0 || !currentArticle) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 md:p-6 bg-black/85 backdrop-blur-2xl">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[800px] rounded-full bg-gradient-to-tr from-fuchsia-600/20 via-rose-500/15 to-cyan-400/20 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: "spring", damping: 26, stiffness: 320 }}
        className="relative w-full h-full sm:h-[88vh] md:h-[600px] sm:max-w-md md:max-w-4xl bg-[#090910] sm:rounded-3xl border border-white/15 overflow-hidden flex flex-col shadow-2xl"
        onMouseDown={handleHoldStart}
        onMouseUp={handleHoldEnd}
        onTouchStart={handleHoldStart}
        onTouchEnd={handleHoldEnd}
      >
        {/* Top Story Progress Bars */}
        <div className="absolute top-3 left-0 right-0 z-30 px-4 flex gap-1.5">
          {filteredStories.map((_, idx) => {
            let fillWidth = "0%";
            if (idx < currentIndex) fillWidth = "100%";
            else if (idx === currentIndex) fillWidth = `${progress}%`;

            return (
              <div
                key={idx}
                className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                  setProgress(0);
                  startTimeRef.current = Date.now();
                }}
              >
                <div
                  className="h-full bg-white transition-all duration-75 ease-linear rounded-full shadow-[0_0_8px_rgba(255,255,255,0.9)]"
                  style={{ width: fillWidth }}
                />
              </div>
            );
          })}
        </div>

        {/* Top Bar Header Controls */}
        <div className="absolute top-7 left-0 right-0 z-30 px-4 md:px-6 flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/15">
              <Sparkles size={13} className="text-cyan-300" />
            </div>
            <div>
              <span className="text-xs font-bold text-white tracking-wide block leading-none">
                {currentArticle.source}
              </span>
              <span className="text-[10px] text-white/50">
                {timeAgo(currentArticle.publishedAt)} · Story {currentIndex + 1} of {totalStories}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPaused((p) => !p)}
              className="hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-black/40 backdrop-blur-md border border-white/15 text-white/80 hover:text-white"
              aria-label={isPaused ? "Play" : "Pause"}
            >
              {isPaused ? <Play size={13} className="ml-0.5" /> : <Pause size={13} />}
            </button>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 backdrop-blur-md border border-white/15 text-white/80 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ── Desktop & Tablet Split View (>= md) vs Mobile Full Stack (< md) ── */}
        <div className="relative flex-1 w-full overflow-hidden flex flex-col md:flex-row pt-12 md:pt-14">
          {/* Left Column: Visual Image Cover */}
          <div className="relative flex-1 md:w-[55%] h-[55%] md:h-full bg-slate-950 overflow-hidden flex flex-col justify-end">
            {currentArticle.imageUrl ? (
              <Image
                src={currentArticle.imageUrl}
                alt={currentArticle.title}
                fill
                priority
                className="object-cover transition-transform duration-700"
                sizes="(max-width: 768px) 100vw, 550px"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 flex items-center justify-center p-8">
                <Sparkles size={64} className="text-white/15 animate-pulse" />
              </div>
            )}

            {/* Gradient Dark Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#090910] via-[#090910]/40 to-transparent md:bg-gradient-to-r md:from-transparent md:to-[#090910] z-10" />

            {/* Tap Navigation Zones */}
            <div
              className="absolute inset-y-0 left-0 w-1/3 z-20 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
            />
            <div
              className="absolute inset-y-0 right-0 w-2/3 z-20 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
            />

            {/* Floating Navigation Arrows */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              disabled={currentIndex === 0}
              className={`absolute left-3 top-1/2 -translate-y-1/2 z-30 h-10 w-10 items-center justify-center rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-white transition-opacity ${
                currentIndex === 0 ? "opacity-0 pointer-events-none" : "opacity-75 hover:opacity-100 flex"
              }`}
              aria-label="Previous story"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-30 h-10 w-10 items-center justify-center rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-white opacity-75 hover:opacity-100 transition-opacity flex"
              aria-label="Next story"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Right Column: Details & Actions */}
          <div className="relative z-30 flex-1 md:w-[45%] p-5 md:p-8 flex flex-col justify-between overflow-y-auto no-scrollbar pointer-events-auto bg-[#090910]">
            <div className="space-y-3.5">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 text-[11px] font-bold border px-2.5 py-0.5 rounded-full tracking-wider uppercase backdrop-blur-md ${
                    theme?.badge || "bg-white/10 text-white border-white/20"
                  }`}
                >
                  {theme?.icon ? (
                    <theme.icon size={12} className="text-current shrink-0" />
                  ) : (
                    <Sparkles size={12} className="text-current shrink-0" />
                  )}
                  {currentArticle.category}
                </span>

                <span className="flex items-center gap-1 text-[11px] text-white/50 font-medium">
                  <Clock size={11} />
                  {estimateReadTime(currentArticle.description || currentArticle.title)} min read
                </span>
              </div>

              <h2 className="text-base sm:text-lg md:text-2xl font-bold text-white leading-snug tracking-tight">
                {currentArticle.title}
              </h2>

              {currentArticle.description && (
                <p className="text-xs sm:text-sm text-white/70 leading-relaxed line-clamp-4 md:line-clamp-6">
                  {currentArticle.description}
                </p>
              )}
            </div>

            {/* Bottom Actions and Keyboard hints on desktop */}
            <div className="pt-4 border-t border-white/10 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <a
                  href={currentArticle.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-white text-black px-4 py-2.5 text-xs sm:text-sm font-bold hover:bg-white/90 transition-all shadow-lg shadow-white/10"
                >
                  Read Full Source <ExternalLink size={14} />
                </a>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleBookmark(currentArticle.id);
                  }}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border backdrop-blur-md transition-all ${
                    isBookmarked
                      ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                      : "bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                  aria-label="Bookmark"
                >
                  {isBookmarked ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                </button>

                <button
                  onClick={handleShare}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 backdrop-blur-md text-white/70 hover:text-white hover:bg-white/10 transition-all relative"
                  aria-label="Share story"
                >
                  <Share2 size={18} />
                  {copied && (
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 rounded bg-cyan-500 px-1.5 py-0.5 text-[9px] font-bold text-black whitespace-nowrap">
                      Copied!
                    </span>
                  )}
                </button>
              </div>

              {/* Desktop Keyboard Hints */}
              <div className="hidden md:flex items-center justify-between text-[10px] text-white/30 pt-1">
                <span>Navigate: <kbd className="rounded bg-white/10 px-1 py-0.5 text-white/60">←</kbd> <kbd className="rounded bg-white/10 px-1 py-0.5 text-white/60">→</kbd></span>
                <span>Pause: <kbd className="rounded bg-white/10 px-1 py-0.5 text-white/60">Space</kbd></span>
                <span>Close: <kbd className="rounded bg-white/10 px-1 py-0.5 text-white/60">Esc</kbd></span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function StoryViewerModal(props: StoryViewerModalProps) {
  if (!props.isOpen) return null;
  return (
    <AnimatePresence>
      <StoryViewerContent
        key={`${props.isOpen}-${props.initialCategory}`}
        onClose={props.onClose}
        articles={props.articles}
        initialCategory={props.initialCategory}
      />
    </AnimatePresence>
  );
}
