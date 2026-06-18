"use client";

import Image from "next/image";
import { useState } from "react";
import { Bookmark, BookmarkCheck, ArrowRight } from "lucide-react";
import type { Article } from "@/lib/types";
import { getCategoryTheme } from "@/lib/themes";
import { timeAgo, useIsMounted, estimateReadTime } from "@/lib/utils";
import { useBookmarks } from "@/hooks/use-bookmarks";

export default function NewsCard({ article }: { article: Article }) {
  const theme = getCategoryTheme(article.category);
  const isMounted = useIsMounted();
  const { bookmarks, toggleBookmark } = useBookmarks();
  const isBookmarked = bookmarks.includes(article.id);
  const readTime = estimateReadTime(article.description || article.title);
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = article.imageUrl && !imgFailed;

  return (
    <article className={`news-card group relative flex flex-col w-full ios-glass-elevated rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl ${theme.borderHover}`}>
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute inset-0 z-0"
        aria-label={article.title}
      />

      {showImage && (
        <div className="relative w-full bg-slate-950/60 overflow-hidden shrink-0 z-10">
          <div className="relative aspect-[16/9] w-full">
            <Image
              src={article.imageUrl!}
              alt={article.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              loading="eager"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => setImgFailed(true)}
            />
          </div>
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
        </div>
      )}

      <div className="relative p-4 sm:p-5 flex flex-col flex-1 min-w-0 z-10">
        
        <div className="space-y-2 min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className={`inline-flex items-center gap-1.5 text-[10px] font-extrabold border px-2 py-0.5 rounded-full tracking-wider uppercase ${theme.badge}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${theme.dotBg}`} />
              {article.category}
            </div>
            <span className="text-[10px] text-white/30">{readTime} min read</span>
          </div>
          
          <h3 className={`font-bold text-white leading-snug tracking-tight transition-colors duration-200 ${theme.textHover}
            ${showImage ? 'text-[13px] line-clamp-2' : 'text-sm line-clamp-3'} hover:text-white/90`}
          >
            {article.title}
          </h3>

          {article.description && (
            <p className={`text-white/40 leading-relaxed ${showImage ? 'text-[11px] line-clamp-1' : 'text-xs line-clamp-2'}`}>
              {article.description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 mt-auto">
          <span className="text-[11px] text-white/25 truncate mr-2">
            {article.source} · {isMounted ? timeAgo(article.publishedAt) : "just now"}
          </span>
          <div className="flex items-center gap-3 shrink-0 relative z-20">
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className={`inline-flex items-center gap-1 text-[11px] font-medium transition-all duration-200 ${theme.readMore}`}
            >
              Read more <ArrowRight size={10} className="transition-transform group-hover:translate-x-0.5" />
            </a>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleBookmark(article.id); }}
              className={`transition-opacity ${isBookmarked ? 'text-amber-400 opacity-100' : 'text-white/30 opacity-60 hover:opacity-100'}`}
              aria-label={isBookmarked ? "Remove bookmark" : "Bookmark article"}
            >
              {isBookmarked ? <BookmarkCheck size={12} /> : <Bookmark size={12} />}
            </button>
          </div>
        </div>

      </div>
    </article>
  );
}
