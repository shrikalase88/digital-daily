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
    <>
      {CATEGORIES.map((cat) => {
        const theme = getCategoryTheme(cat);
        const Icon = theme.icon;
        const isActive = activeCategory === cat;
        return (
          <button
            key={cat}
            role="tab"
            aria-selected={isActive}
            onClick={() => onCategoryChange?.(cat)}
            className={`ios-pill text-xs inline-flex items-center gap-1.5 ${
              isActive ? theme.pillActive : "ios-pill-inactive"
            } focus-visible:ring-2 focus-visible:ring-white`}
          >
            <Icon size={13} className={isActive ? "text-current" : "text-white/40"} />
            <span>{cat}</span>
          </button>
        );
      })}
    </>
  );
}
