"use client";

import Image from "next/image";
import { useState } from "react";
import type { Article } from "@/lib/types";
import { timeAgo, useIsMounted } from "@/lib/utils";

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

  return (
    <section className="mb-10" aria-label="Featured stories">
      <div className="grid gap-6 lg:grid-cols-3">
        <article className="ios-glass ios-card-glow group relative overflow-hidden rounded-3xl lg:col-span-2">
          <a
            href={main.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            {showImage && (
              <div className="relative aspect-[16/9] overflow-hidden sm:aspect-[21/9]">
                <Image
                  src={main.imageUrl!}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  loading="eager"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={() => setImgFailed(true)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8" style={{ background: showImage ? undefined : "linear-gradient(135deg, rgba(18,18,24,0.6), rgba(18,18,24,0.4))" }}>
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-full ios-glass px-2.5 py-0.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-white/80">
                  {main.category}
                </span>
                <span className="text-[10px] sm:text-xs text-white/40">{main.source}</span>
              </div>
              <h2 className="mb-1 text-base sm:text-xl font-bold leading-tight text-white sm:text-2xl lg:text-3xl line-clamp-2">
                {main.title}
              </h2>
              {main.description && (
                <p className="hidden sm:block line-clamp-1 text-xs sm:text-sm text-white/60">
                  {main.description}
                </p>
              )}
              <p className="mt-1 text-[10px] sm:text-xs text-white/30">
                {isMounted ? timeAgo(main.publishedAt) : "just now"}
              </p>
            </div>
          </a>
        </article>

        <aside className="ios-glass rounded-3xl p-5">
          <div className="mb-4 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/40">
              Trending Now
            </h3>
          </div>

          <div className="space-y-0.5">
            {trending.slice(0, 5).map((article, i) => (
              <a
                key={article.id + i}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-3 rounded-2xl border border-transparent px-3 py-2.5 transition-all hover:border-white/[0.04] hover:bg-white/[0.03]"
              >
                <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ios-glass text-[11px] font-bold text-white/20">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm leading-snug text-white/70 transition-colors group-hover:text-white">
                    {article.title}
                  </p>
                  <p className="mt-0.5 text-[11px] text-white/30">
                    {article.source} · {isMounted ? timeAgo(article.publishedAt) : "just now"}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}
