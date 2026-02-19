import { MEMO_DIR } from '../constants';

/**
 * メモファイルのパスを生成する
 */
export function getMemoPath(id: string): string {
    return `${MEMO_DIR}/${id}.md`;
}

/**
 * 日時からメモID（ファイル名）を生成する
 * 形式: YYYY-MM-DD-HH-mm-ss
 */
export function generateMemoId(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
    return `${year}-${month}-${day}-${hours}-${minutes}-${seconds}`;
}

/**
 * メモIDを人間が読める日時文字列にパースする
 * 例: "2026-02-19-23-30-00" → "2026/02/19 23:30:00"
 */
export function parseMemoId(id: string): string {
    const parts = id.split('-');
    if (parts.length >= 6) {
        const [year, month, day, hour, minute, second] = parts;
        return `${year}/${month}/${day} ${hour}:${minute}:${second}`;
    }
    return 'Unknown';
}
