import type { Category, CategoryColor } from '../types';

export const CATEGORIES_FILE = 'categories.json';

export const DEFAULT_CATEGORIES: Category[] = [
    { id: 1, name: '学習', aliases: ['勉強', 'study'], color: 'rose' },
    { id: 2, name: '仕事', aliases: ['work', 'タスク'], color: 'sky' },
    { id: 3, name: 'アイデア', aliases: ['idea', 'ひらめき'], color: 'amber' }
];

export const CATEGORY_COLOR_MAP: Record<CategoryColor, string> = {
    rose: 'bg-rose-100 text-rose-800 border-rose-200 hover:bg-rose-200',
    sky: 'bg-sky-100 text-sky-800 border-sky-200 hover:bg-sky-200',
    amber: 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200',
    emerald: 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200',
    violet: 'bg-violet-100 text-violet-800 border-violet-200 hover:bg-violet-200',
};
