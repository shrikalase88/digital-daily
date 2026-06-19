import { CATEGORIES } from "@/lib/types";
import type { Category } from "@/lib/types";
import { getCategoryTheme } from "@/lib/themes";

interface CategoryPillListProps {
  activeCategory?: Category | null;
  onCategoryChange?: (cat: Category | null) => void;
}

export default function CategoryPillList({
  activeCategory,
  onCategoryChange,
}: CategoryPillListProps) {
  return (
    <>{
      CATEGORIES.map((cat) => {
        const theme = getCategoryTheme(cat);
        const isActive = activeCategory === cat;
        return (
          <button
            key={cat}
            role="tab"
            aria-selected={isActive}
            onClick={() => onCategoryChange?.(cat)}
            className={`ios-pill text-xs ${
              isActive ? theme.pillActive : "ios-pill-inactive"
            } focus-visible:ring-2 focus-visible:ring-white`}
          >
            {cat}
          </button>
        );
      })
    }</>
  );
}
