import type { Category } from '../../types';
import { CATEGORY_COLOR_MAP } from '../../constants';

interface CategoryBarProps {
    categories: Category[];
    activeCategoryIds: string[];
    onToggle: (categoryId: string) => void;
}

export function CategoryBar({ categories, activeCategoryIds, onToggle }: CategoryBarProps) {
    if (categories.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-2 px-8 py-2 bg-theme-bg/50 border-b border-theme-border/30">
            {categories.map((category) => {
                const categoryIdStr = category.id.toString();
                const isActive = activeCategoryIds.includes(categoryIdStr);
                const colorClass = CATEGORY_COLOR_MAP[category.color];

                return (
                    <button
                        key={category.id}
                        onClick={() => onToggle(categoryIdStr)}
                        className={`
                            px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 border
                            ${isActive
                                ? `${colorClass} shadow-sm scale-105`
                                : 'bg-theme-bg text-theme-fg/40 border-theme-border hover:bg-theme-bg-soft hover:text-theme-fg/60'
                            }
                        `}
                    >
                        {category.name}
                    </button>
                );
            })}
        </div>
    );
}
