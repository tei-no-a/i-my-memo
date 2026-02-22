import { useMemo } from 'react';
import type { Category, MemoData } from '../types';

/**
 * カスタムフック：メモ内容に基づくカテゴリのソート機能を提供します
 * 今後、各メモの `content` 内に含まれるカテゴリの `aliases` をカウントし、
 * その出現頻度によって `categories` を並べ替えるロジックをここに実装します。
 */
export function useCategorySorter(categories: Category[], _memos: MemoData[]) {
    // 現在は受け取ったカテゴリの配列をそのまま返却します。
    // 後日、ここにエイリアスの出現回数カウント＆ソートロジックを追記します。
    const sortedCategories = useMemo(() => {
        return [...categories];
    }, [categories/*, _memos*/]);

    return sortedCategories;
}
