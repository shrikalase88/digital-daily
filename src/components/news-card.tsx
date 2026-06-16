import Image from "next/image";
import type { Article } from "@/lib/types";
import { timeAgo } from "@/lib/utils";
import { getCategoryTheme } from "@/lib/themes";

export default function NewsCard({ article }: { article: Article }) {
  const hasImage = !!article.imageUrl;
  const theme = getCategoryTheme(article.category);

  return (
    <div className={`group flex flex-col w-full border border-white/10 rounded-2xl overflow-hidden bg-slate-900/40 backdrop-blur-md shadow-sm transition-all duration-300 hover:shadow-lg ${theme.borderHover}`}>
      
      {hasImage && article.imageUrl ? (
        <div className="relative w-full bg-slate-950 overflow-hidden shrink-0 border-b border-white/5">
          <div className="relative aspect-[16/9] w-full">
            <Image
              src={article.imageUrl}
              alt={article.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              loading="eager"
              className="object-cover transition-transform duration-500 group-hover:scale-102"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement?.classList.add('hidden');
              }}
            />
          </div>
        </div>
      ) : null}

      <div className={`p-5 sm:p-6 flex flex-col justify-between flex-1 min-w-0 bg-gradient-to-b ${!hasImage ? theme.accentBg : 'from-transparent to-slate-950/40'}`}>
        
        <div className="space-y-3 min-w-0">
          <div className={`inline-flex items-center gap-1.5 text-[11px] font-extrabold border px-2.5 py-1 rounded-full tracking-wider uppercase ${theme.badge}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${theme.dotBg}`} />
            {article.category}
          </div>
          
          <h3 className={`font-bold text-white leading-snug tracking-tight transition-colors duration-200 ${theme.textHover}
            ${hasImage ? 'text-base line-clamp-3' : 'text-lg line-clamp-4'}`}
          >
            {article.title}
          </h3>

          {article.description && (
            <p className={`text-slate-400 leading-relaxed ${hasImage ? 'text-xs line-clamp-2' : 'text-sm line-clamp-3'}`}>
              {article.description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto shrink-0">
          <span className="text-xs text-slate-500 font-medium">
            {article.source} · {timeAgo(article.publishedAt)}
          </span>
          <a 
            href={article.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className={`text-xs font-semibold opacity-80 hover:opacity-100 hover:underline shrink-0 transition-opacity ${theme.textHover}`}
          >
            Read more
          </a>
        </div>

      </div>
    </div>
  );
}
