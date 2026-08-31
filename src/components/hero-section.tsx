"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
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
    <section className="mb-10" aria-label="Featured stories">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Hero Featured Article */}
        <motion.article
          whileHover={{ y: -2 }}
          className="ios-glass ios-card-glow group relative overflow-hidden rounded-3xl lg:col-span-2 border border-white/10 shadow-2xl"
        >
          <a
            href={main.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block h-full relative"
          >
            {showImage ? (
              <div className="relative aspect-[16/9] overflow-hidden sm:aspect-[21/10] w-full bg-slate-950">
                <Image
                  src={main.imageUrl!}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  priority
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={() => setImgFailed(true)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#06060a] via-[#06060a]/60 to-transparent" />
              </div>
            ) : (
              <div className="relative aspect-[16/9] sm:aspect-[21/10] w-full bg-gradient-to-br from-indigo-950/40 via-purple-950/30 to-[#06060a] p-8 flex items-center justify-center">
                <Sparkles size={48} className="text-white/10" />
              </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 z-10 space-y-2.5">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider backdrop-blur-md border ${
                    theme.badge
                  }`}
                >
                  <theme.icon size={12} className="text-current shrink-0" />
                  Featured · {main.category}
                </span>
                <span className="text-[10px] sm:text-xs text-white/40 font-medium">{main.source}</span>
              </div>

              <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold leading-tight text-white group-hover:text-white/90 transition-colors line-clamp-2">
                {main.title}
              </h2>

              {main.description && (
                <p className="hidden sm:block line-clamp-2 text-xs sm:text-sm text-white/60 leading-relaxed max-w-2xl">
                  {main.description}
                </p>
              )}

              <div className="flex items-center justify-between pt-1">
                <p className="text-[10px] sm:text-xs text-white/35 font-medium">
                  {isMounted ? timeAgo(main.publishedAt) : "just now"}
                </p>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-400 group-hover:translate-x-1 transition-transform">
                  Full Story <ArrowUpRight size={14} />
                </span>
              </div>
            </div>
          </a>
        </motion.article>

        {/* Trending Column */}
        <aside className="ios-glass rounded-3xl p-5 border border-white/10 flex flex-col justify-between shadow-xl">
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400">
                  <TrendingUp size={12} />
                </div>
                <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/60">
                  Trending Stream
                </h3>
              </div>
              <span className="text-[10px] text-white/30 font-medium">Live Ranked</span>
            </div>

            <div className="space-y-1">
              {trending.slice(0, 5).map((article, i) => (
                <a
                  key={article.id + i}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-3 rounded-2xl border border-transparent px-3 py-2.5 transition-all hover:border-white/[0.06] hover:bg-white/[0.03]"
                >
                  <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ios-glass text-[11px] font-bold text-white/40 group-hover:text-white group-hover:bg-white/10 transition-colors">
                    0{i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-xs sm:text-[13px] font-medium leading-snug text-white/70 transition-colors group-hover:text-white">
                      {article.title}
                    </p>
                    <p className="mt-1 text-[10px] text-white/30">
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
