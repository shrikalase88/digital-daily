import NewsCard from "@/components/news-card";
import type { Article, Category } from "@/lib/types";
import { getCategoryTheme } from "@/lib/themes";
import type { ViewMode } from "./view-mode-toggle";
import { ArrowRight } from "lucide-react";

export default function CategorySection({
  category,
  articles,
  onCategoryChange,
  viewMode = "bento",
}: {
  category: Category;
  articles: Article[];
  onCategoryChange?: (cat: Category) => void;
  viewMode?: ViewMode;
}) {
  if (articles.length === 0) return null;

  // Take an even count (4 articles) to cleanly fill a 2x2 grid without dangling cards
  const displayArticles = articles.slice(0, 4);
  const theme = getCategoryTheme(category);
  const Icon = theme.icon;

  const gridClass =
    viewMode === "compact"
      ? "news-compact-grid"
      : viewMode === "visual"
      ? "news-visual-grid"
      : "news-grid";

  return (
    <section className="mb-10">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className={`ios-pill ${theme.pillActive} font-semibold text-xs inline-flex items-center gap-1.5`}
          >
            <Icon size={13} className="text-current" />
            <span>{category}</span>
          </div>
          <span className="text-[11px] font-mono text-zinc-500">
            {articles.length} {articles.length === 1 ? "story" : "stories"}
          </span>
        </div>

        <button
          onClick={() => onCategoryChange?.(category)}
          className="group inline-flex items-center gap-1 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
        >
          <span>View all</span>
          <ArrowRight
            size={12}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </button>
      </div>

      <div className={gridClass}>
        {displayArticles.map((article, i) => (
          <NewsCard key={article.id + i} article={article} viewMode={viewMode} />
        ))}
      </div>
    </section>
  );
}
