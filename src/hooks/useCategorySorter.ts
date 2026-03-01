import { useMemo } from 'react';
import type { Category, MemoData } from '../types';

/**
 * カスタムフック：メモ内容に基づくカテゴリのソート機能を提供します
 * 各メモの `content` 内に含まれるカテゴリの `name` および `aliases` をカウントし、
 * その出現頻度によって `categories` を並べ替えます。
 */
export interface CategoryWithScore {
    category: Category;
    score: number;
}

export function useCategorySorter(categories: Category[], memos: MemoData[], noteTitle: string = ''): CategoryWithScore[] {
    const sortedCategories = useMemo(() => {
        if (!categories || categories.length === 0) return [];

        // 1. ノートタイトルと全メモのテキストを結合
        const memosText = (memos || []).map(m => m.content).join('\n');
        const allText = noteTitle ? `${noteTitle}\n${memosText}` : memosText;

        if (!allText.trim()) {
            return categories.map(category => ({ category, score: 0 }));
        }

        // 2. 各カテゴリごとにスコアを計算
        const categoriesWithScore = categories.map(category => {
            let score = 0;

            // カウント対象となる文字列群 (名前 + エイリアス)
            const searchTerms = [
                category.name,
                ...(category.aliases || [])
            ].map(term => term.trim()).filter(term => term.length > 0);

            // 各対象文字列がテキスト内に何回出現するかカウント
            searchTerms.forEach(term => {
                try {
                    // 正規表現でエスケープ処理(特殊文字によるエラー回避)
                    const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    const regex = new RegExp(escapedTerm, 'gi');
                    const matches = allText.match(regex);
                    if (matches) {
                        score += matches.length;
                    }
                } catch (e) {
                    console.warn(`Failed to execute regex for term: ${term}`, e);
                }
            });

            return { category, score };
        });

        // 3. スコア降順にソート（スコアが同じ場合は元の順序やid等で安定させるため、今回はid昇順）
        categoriesWithScore.sort((a, b) => {
            if (b.score !== a.score) {
                return b.score - a.score; // スコアが高い順
            }
            return a.category.id - b.category.id; // 同点の場合はid順
        });

        // ソート済みの Category とスコアをセットで返す
        return categoriesWithScore;

    }, [categories, memos, noteTitle]);

    return sortedCategories;
}
