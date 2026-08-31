import NewsCard from "@/components/news-card";
import type { Article, Category } from "@/lib/types";
import { getCategoryTheme } from "@/lib/themes";
import type { ViewMode } from "./view-mode-toggle";

const CATEGORY_ACCENTS: Record<Category, string> = {
  "Politics & World": "cat-politics-world",
  Technology: "cat-technology",
  "Finance & Corporate": "cat-finance-corporate",
  Sports: "cat-sports",
};

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

  const main = articles[0];
  const rest = articles.slice(1, 4);
  const theme = getCategoryTheme(category);
  const Icon = theme.icon;

  const gridClass =
    viewMode === "compact"
      ? "news-compact-grid"
      : viewMode === "visual"
      ? "news-visual-grid"
      : "news-grid";

  return (
    <section className="mb-12">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`ios-pill ${CATEGORY_ACCENTS[category]} backdrop-blur-2xl text-white/90 font-semibold shadow-lg inline-flex items-center gap-1.5`}>
            <Icon size={13} className="text-current" />
            <span>{category}</span>
          </div>
          <span className="text-[11px] font-medium text-white/30">
            {articles.length} {articles.length === 1 ? "story" : "stories"}
          </span>
        </div>
        <button
          onClick={() => onCategoryChange?.(category)}
          className="ios-pill ios-pill-inactive text-[12px] hover:text-white"
        >
          View all →
        </button>
      </div>

      <div className={gridClass}>
        <NewsCard key={main.id} article={main} viewMode={viewMode} />
        {rest.map((article, i) => (
          <NewsCard key={article.id + i} article={article} viewMode={viewMode} />
        ))}
      </div>
    </section>
  );
}
