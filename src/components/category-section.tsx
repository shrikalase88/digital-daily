import NewsCard from "@/components/news-card";
import type { Article, Category } from "@/lib/types";
import { getCategoryTheme } from "@/lib/themes";

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
}: {
  category: Category;
  articles: Article[];
  onCategoryChange?: (cat: Category) => void;
}) {
  if (articles.length === 0) return null;

  const main = articles[0];
  const rest = articles.slice(1, 4);
  const theme = getCategoryTheme(category);

  return (
    <section className="mb-12">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`ios-pill ${CATEGORY_ACCENTS[category]} backdrop-blur-2xl text-white/90`}>
            <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${theme.dotBg}`} />
            {category}
          </div>
          <span className="text-[11px] font-medium text-white/25">
            {articles.length} {articles.length === 1 ? "story" : "stories"}
          </span>
        </div>
        <button
          onClick={() => onCategoryChange?.(category)}
          className="ios-pill ios-pill-inactive text-[12px]"
        >
          View all →
        </button>
      </div>

      <div className="news-grid">
        <NewsCard key={main.id} article={main} />
        {rest.map((article, i) => (
          <NewsCard key={article.id + i} article={article} />
        ))}
      </div>
    </section>
  );
}
