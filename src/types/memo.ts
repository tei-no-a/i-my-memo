/** メモの種類 */
export type MemoType = 'text' | 'tasklist';

/** メモの全データ（本文を含む） */
export interface MemoData {
    id: string;
    content: string;
    createdAt: string;
    type?: MemoType;
}
