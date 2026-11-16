"use client";

import Image from "next/image";
import { useState, useSyncExternalStore } from "react";
import { Bookmark, BookmarkCheck, ArrowRight, Share2, Check } from "lucide-react";
import type { Article } from "@/lib/types";
import { getCategoryTheme } from "@/lib/themes";
import { timeAgo, estimateReadTime } from "@/lib/utils";
import { useBookmarks } from "@/hooks/use-bookmarks";
import type { ViewMode } from "./view-mode-toggle";

function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

const REGION_BADGES: Record<string, string> = {
  India: "🇮🇳 India",
  USA: "🇺🇸 USA",
  Europe: "🇪🇺 Europe",
  Global: "🌐 Global",
};

interface NewsCardProps {
  article: Article;
  viewMode?: ViewMode;
  priority?: boolean;
}

export default function NewsCard({
  article,
  viewMode = "bento",
  priority = false,
}: NewsCardProps) {
  const theme = getCategoryTheme(article.category);
  const CategoryIcon = theme.icon;
  const mounted = useHydrated();
  const { bookmarks, toggleBookmark } = useBookmarks();
  const isBookmarked = bookmarks.includes(article.id);
  const readTime = estimateReadTime(article.description || article.title);
  const [imgFailed, setImgFailed] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [copied, setCopied] = useState(false);
  const showImage = article.imageUrl && !imgFailed;

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (navigator.share) {
        await navigator.share({
          title: article.title,
          url: article.url,
        });
      } else {
        await navigator.clipboard.writeText(article.url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      /* ignore */
    }
  };

  /* ═══════════════════════════════════════════════════════════════
     1. COMPACT MAGAZINE LIST VIEW MODE
     ═══════════════════════════════════════════════════════════════ */
  if (viewMode === "compact") {
    return (
      <article className="group relative flex items-center justify-between gap-3 rounded-2xl ios-glass-elevated p-3 sm:p-4 transition-all duration-200 hover:bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.14]">
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 z-0"
          aria-label={article.title}
        />

        <div className="flex-1 min-w-0 z-10">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span
              className={`inline-flex items-center gap-1.5 text-[9px] font-bold border px-2 py-0.5 rounded-full uppercase ${theme.badge}`}
            >
              <CategoryIcon size={11} className="text-current shrink-0" />
              {article.category}
            </span>
            {article.region && (
              <span className="text-[9px] font-medium text-zinc-400 bg-white/[0.04] border border-white/[0.08] px-1.5 py-0.5 rounded-md">
                {REGION_BADGES[article.region] || article.region}
              </span>
            )}
            <span className="text-[10px] text-zinc-400 truncate">
              {article.source}
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">
              · {mounted ? timeAgo(article.publishedAt) : "just now"}
            </span>
          </div>

          <h3
            className={`text-xs sm:text-sm font-semibold text-zinc-100 leading-snug line-clamp-2 transition-colors ${theme.textHover}`}
          >
            {article.title}
          </h3>
        </div>

        <div className="flex items-center gap-1 shrink-0 z-20">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleBookmark(article.id);
            }}
            className={`p-1.5 rounded-lg transition-all active:scale-90 ${
              isBookmarked
                ? "text-amber-300 bg-amber-500/15"
                : "text-zinc-500 hover:text-zinc-200 hover:bg-white/5"
            }`}
            aria-label="Bookmark"
          >
            {isBookmarked ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
          </button>
        </div>
      </article>
    );
  }

  /* ═══════════════════════════════════════════════════════════════
     2. VISUAL CARD VIEW MODE (Image-dominant format)
     ═══════════════════════════════════════════════════════════════ */
  if (viewMode === "visual") {
    return (
      <article className="group relative flex flex-col aspect-[4/5] sm:aspect-[3/4] rounded-3xl overflow-hidden ios-glass-elevated border border-white/[0.08] hover:border-white/[0.18] shadow-xl transition-all duration-300">
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 z-0"
          aria-label={article.title}
        />

        {showImage ? (
          <>
            {!imgLoaded && (
              <div className="absolute inset-0 bg-zinc-950 animate-pulse" />
            )}
            <Image
              src={article.imageUrl!}
              alt={article.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={priority}
              loading={priority ? "eager" : "lazy"}
              className={`object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] ${
                imgLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgFailed(true)}
            />
          </>
        ) : (
          <div className="absolute inset-0 bg-zinc-900 border-b border-white/5" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20 z-10" />

        {/* Top Badges */}
        <div className="relative z-20 p-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`inline-flex items-center gap-1.5 text-[10px] font-bold border px-2.5 py-0.5 rounded-full uppercase backdrop-blur-md ${theme.badge}`}
            >
              <CategoryIcon size={12} className="text-current shrink-0" />
              {article.category}
            </span>
            {article.region && (
              <span className="text-[9px] font-medium text-zinc-300 bg-black/50 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded-full">
                {REGION_BADGES[article.region] || article.region}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleShare}
              className="p-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-zinc-300 hover:text-white active:scale-90 transition-all"
              aria-label="Share"
            >
              {copied ? <Check size={12} className="text-emerald-400" /> : <Share2 size={12} />}
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleBookmark(article.id);
              }}
              className={`p-1.5 rounded-full backdrop-blur-md border transition-all active:scale-90 ${
                isBookmarked
                  ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                  : "bg-black/50 border-white/10 text-zinc-300 hover:text-white"
              }`}
              aria-label="Bookmark"
            >
              {isBookmarked ? <BookmarkCheck size={12} /> : <Bookmark size={12} />}
            </button>
          </div>
        </div>

        {/* Bottom Details */}
        <div className="relative z-20 mt-auto p-4 sm:p-5 space-y-1.5">
          <span className="text-[10px] text-zinc-400 block font-mono">
            {article.source} · {mounted ? timeAgo(article.publishedAt) : "just now"}
          </span>
          <h3 className="text-sm sm:text-base font-semibold text-white leading-snug line-clamp-3">
            {article.title}
          </h3>
        </div>
      </article>
    );
  }

  /* ═══════════════════════════════════════════════════════════════
     3. DEFAULT BENTO GRID VIEW MODE
     ═══════════════════════════════════════════════════════════════ */
  return (
    <article
      className={`news-card ios-card-interactive group relative flex flex-col w-full ios-glass-elevated rounded-3xl overflow-hidden transition-all duration-200 border border-white/[0.08] hover:border-white/[0.18]`}
    >
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute inset-0 z-0"
        aria-label={article.title}
      />

      {showImage && (
        <div className="relative w-full bg-zinc-950 overflow-hidden shrink-0 z-10">
          <div className="relative aspect-[16/9] w-full">
            {!imgLoaded && (
              <div className="absolute inset-0 bg-zinc-900 animate-pulse" />
            )}
            <Image
              src={article.imageUrl!}
              alt={article.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1536px) 33vw, 25vw"
              priority={priority}
              loading={priority ? "eager" : "lazy"}
              className={`object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] ${
                imgLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgFailed(true)}
            />
          </div>
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
        </div>
      )}

      <div className="relative p-4 sm:p-5 flex flex-col flex-1 min-w-0 z-10">
        <div className="space-y-2 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <div
              className={`inline-flex items-center gap-1.5 text-[10px] font-bold border px-2 py-0.5 rounded-full tracking-wider uppercase backdrop-blur-sm ${theme.badge}`}
            >
              <CategoryIcon size={12} className="text-current shrink-0" />
              {article.category}
            </div>

            {article.region && (
              <span className="text-[9px] font-medium text-zinc-400 bg-white/[0.04] border border-white/[0.08] px-2 py-0.5 rounded-full">
                {REGION_BADGES[article.region] || article.region}
              </span>
            )}

            <span className="text-[10px] text-zinc-500 font-mono">
              {readTime} min read
            </span>
          </div>

          <h3
            className={`font-semibold text-zinc-100 leading-snug tracking-tight transition-colors duration-200 ${theme.textHover}
            ${showImage ? "text-xs sm:text-[13px] line-clamp-2" : "text-sm sm:text-[15px] line-clamp-3"} group-hover:text-white`}
          >
            {article.title}
          </h3>

          {article.description && (
            <p
              className={`text-zinc-400 leading-relaxed font-normal ${
                showImage
                  ? "text-[11px] sm:text-xs line-clamp-1"
                  : "text-xs sm:text-[13px] line-clamp-2"
              }`}
            >
              {article.description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 mt-auto border-t border-white/[0.05]">
          <span className="text-[10px] text-zinc-500 truncate mr-2 font-mono">
            {article.source} · {mounted ? timeAgo(article.publishedAt) : "just now"}
          </span>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 relative z-20">
            <button
              onClick={handleShare}
              className="p-1.5 text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-white/5 active:scale-90 relative"
              aria-label="Share story"
            >
              {copied ? <Check size={13} className="text-emerald-400" /> : <Share2 size={13} />}
              {copied && (
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 rounded bg-emerald-500 px-1.5 py-0.5 text-[9px] font-bold text-black whitespace-nowrap shadow-lg">
                  Copied!
                </span>
              )}
            </button>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleBookmark(article.id);
              }}
              className={`p-1.5 rounded-lg transition-all active:scale-90 ${
                isBookmarked
                  ? "text-amber-300 bg-amber-500/15"
                  : "text-zinc-500 hover:text-zinc-200 hover:bg-white/5"
              }`}
              aria-label={isBookmarked ? "Remove bookmark" : "Bookmark article"}
            >
              {isBookmarked ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
            </button>

            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className={`inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold transition-all duration-200 py-1 pl-1 ${theme.readMore}`}
            >
              Read <ArrowRight size={10} className="transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
