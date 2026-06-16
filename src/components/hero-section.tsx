import Image from "next/image";
import type { Article } from "@/lib/types";
import { timeAgo } from "@/lib/utils";

export default function HeroSection({
  featured,
  trending,
}: {
  featured: Article[];
  trending: Article[];
}) {
  const main = featured[0];

  if (!main) return null;

  return (
    <section className="mb-10">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="ios-glass ios-card-glow group relative overflow-hidden rounded-3xl lg:col-span-2">
          <a
            href={main.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            {main.imageUrl ? (
              <div className="relative aspect-[16/9] overflow-hidden sm:aspect-[21/9]">
                <Image
                  src={main.imageUrl || ""}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  loading="eager"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              </div>
            ) : (
              <div className="flex aspect-[16/9] items-end bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-6 sm:aspect-[21/9]">
                <div>
                  <span className="mb-3 inline-block rounded-full border border-white/[0.06] bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white/50">
                    {main.category}
                  </span>
                  <h2 className="mb-2 text-xl font-bold leading-tight text-white sm:text-2xl lg:text-3xl">
                    {main.title}
                  </h2>
                  {main.description && (
                    <p className="line-clamp-2 text-sm text-white/50">
                      {main.description}
                    </p>
                  )}
                  <p className="mt-3 text-xs text-white/25">
                    {main.source} · {timeAgo(main.publishedAt)}
                  </p>
                </div>
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
              <div className="mb-3 flex items-center gap-2">
                <span className="rounded-full border border-white/[0.1] bg-black/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white/80 backdrop-blur-2xl">
                  {main.category}
                </span>
                <span className="text-xs text-white/40">{main.source}</span>
              </div>
              <h2 className="mb-2 text-xl font-bold leading-tight text-white sm:text-2xl lg:text-3xl">
                {main.title}
              </h2>
              {main.description && (
                <p className="line-clamp-2 text-sm text-white/60">
                  {main.description}
                </p>
              )}
              <p className="mt-3 text-xs text-white/30">
                {timeAgo(main.publishedAt)}
              </p>
            </div>
          </a>
        </div>

        <div className="ios-glass rounded-3xl p-5">
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
                <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white/[0.04] text-[11px] font-bold text-white/20">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm leading-snug text-white/70 transition-colors group-hover:text-white">
                    {article.title}
                  </p>
                  <p className="mt-0.5 text-[11px] text-white/30">
                    {article.source} · {timeAgo(article.publishedAt)}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
