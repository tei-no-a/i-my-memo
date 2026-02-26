/** メモのメタデータのみ（本文を持たない軽量版） */
export interface MemoMeta {
    id: string;
    createdAt: string;
}

/** メモの全データ（本文を含む） */
export interface MemoData {
    id: string;
    content: string;
    createdAt: string;
}
