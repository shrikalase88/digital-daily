"use client";

import Image from "next/image";
import { useState } from "react";
import { Sparkles, TrendingUp, ArrowUpRight } from "lucide-react";
import type { Article } from "@/lib/types";
import { timeAgo, useIsMounted } from "@/lib/utils";
import { getCategoryTheme } from "@/lib/themes";

export default function HeroSection({
  featured,
  trending,
}: {
  featured: Article[];
  trending: Article[];
}) {
  const main = featured[0];
  const isMounted = useIsMounted();
  const [imgFailed, setImgFailed] = useState(false);

  if (!main) return null;

  const showImage = main.imageUrl && !imgFailed;
  const theme = getCategoryTheme(main.category);

  return (
    <section className="mb-8" aria-label="Featured stories">
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Main Hero Featured Article */}
        <article className="ios-glass ios-card-interactive group relative overflow-hidden rounded-3xl lg:col-span-2 border border-white/10 shadow-xl transition-all">
          <a
            href={main.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block h-full relative"
          >
            {showImage ? (
              <div className="relative aspect-[16/9] overflow-hidden sm:aspect-[21/10] w-full bg-zinc-950">
                <Image
                  src={main.imageUrl!}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  priority
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                  onError={() => setImgFailed(true)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/60 to-transparent" />
              </div>
            ) : (
              <div className="relative aspect-[16/9] sm:aspect-[21/10] w-full bg-zinc-900/60 p-8 flex items-center justify-center border-b border-white/5">
                <Sparkles size={36} className="text-zinc-600" />
              </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7 z-10 space-y-2.5">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider backdrop-blur-md border ${
                    theme.badge
                  }`}
                >
                  <theme.icon size={12} className="text-current shrink-0" />
                  Featured · {main.category}
                </span>
                <span className="text-[10px] sm:text-xs text-zinc-400 font-medium">
                  {main.source}
                </span>
              </div>

              <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold leading-snug tracking-tight text-white group-hover:text-zinc-200 transition-colors line-clamp-2">
                {main.title}
              </h2>

              {main.description && (
                <p className="hidden sm:block line-clamp-2 text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-2xl font-normal">
                  {main.description}
                </p>
              )}

              <div className="flex items-center justify-between pt-1">
                <p className="text-[10px] sm:text-xs text-zinc-400 font-medium font-mono">
                  {isMounted ? timeAgo(main.publishedAt) : "just now"}
                </p>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-200 group-hover:text-white transition-colors">
                  Read full story <ArrowUpRight size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </span>
              </div>
            </div>
          </a>
        </article>

        {/* Trending Stream Column */}
        <aside className="ios-glass rounded-3xl p-5 border border-white/10 flex flex-col justify-between shadow-xl">
          <div>
            <div className="mb-3.5 flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-md bg-white/[0.06] text-zinc-300">
                  <TrendingUp size={12} />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-300">
                  Trending Stream
                </h3>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">
                Live Wire
              </span>
            </div>

            <div className="space-y-1">
              {trending.slice(0, 5).map((article, i) => (
                <a
                  key={article.id + i}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-3 rounded-2xl border border-transparent px-2.5 py-2.5 transition-colors hover:border-white/[0.06] hover:bg-white/[0.04]"
                >
                  <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md bg-white/[0.05] border border-white/10 font-mono text-[10px] font-bold text-zinc-400 group-hover:text-white transition-colors">
                    0{i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-xs font-medium leading-snug text-zinc-200 transition-colors group-hover:text-white">
                      {article.title}
                    </p>
                    <p className="mt-1 text-[10px] text-zinc-400 font-mono">
                      {article.source} · {isMounted ? timeAgo(article.publishedAt) : "just now"}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
