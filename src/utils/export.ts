import { writeTextFile, readTextFile } from '@tauri-apps/plugin-fs';
import type { Note, MemoData } from '../types';
import type { Category } from '../types/category';

/**
 * メモIDから日付部分を抽出してエクスポート用ファイル名を生成
 * @example getMemoExportFileName('2026-02-27-11-10-25') → '2026-02-27.md'
 */
export function getMemoExportFileName(memoId: string): string {
    const datePart = memoId.substring(0, 10); // 'YYYY-MM-DD'
    return `${datePart}.md`;
}

/**
 * メモIDから時刻を抽出し、エクスポート用フォーマットに整形
 * @example formatMemoForExport('2026-02-27-11-10-25', 'メモ本文') → '\n\n##### 11:10\nメモ本文'
 */
export function formatMemoForExport(memoId: string, content: string): string {
    // memoId: 'YYYY-MM-DD-HH-mm-ss' → HH:mm を取得（秒は切り捨て）
    const parts = memoId.split('-');
    const hours = parts[3] || '00';
    const minutes = parts[4] || '00';
    const time = `${hours}:${minutes}`;

    return `\n\n##### ${time}\n${content}`;
}

/**
 * メモを指定フォルダにエクスポート（追記対応）
 *
 * - ファイルが存在する場合は末尾に追記
 * - ファイルが存在しない場合は新規作成
 */
export async function exportMemo(
    memoId: string,
    content: string,
    exportDir: string
): Promise<boolean> {
    try {
        const fileName = getMemoExportFileName(memoId);
        const filePath = `${exportDir}/${fileName}`;
        const formatted = formatMemoForExport(memoId, content);

        // 既存ファイルの読み込みを試行
        let existingContent = '';
        try {
            existingContent = await readTextFile(filePath);
        } catch {
            // ファイルが存在しない場合は空文字
        }

        // 既存内容 + 新しいメモを書き込み
        await writeTextFile(filePath, existingContent + formatted);

        return true;
    } catch (error) {
        console.error('Failed to export memo:', error);
        return false;
    }
}

/**
 * ファイル名に使用不可能な文字を除去するサニタイズ処理
 */
export function sanitizeFileName(name: string): string {
    return name.replace(/[\\/:*?"<>|]/g, '_').trim() || 'untitled';
}

// ===================================================
// ノートエクスポート
// ===================================================

/** Date から共通の日付パーツを取得 */
function formatDateParts(d: Date) {
    return {
        yyyy: d.getFullYear(),
        mm: String(d.getMonth() + 1).padStart(2, '0'),
        dd: String(d.getDate()).padStart(2, '0'),
        hh: String(d.getHours()).padStart(2, '0'),
        min: String(d.getMinutes()).padStart(2, '0'),
    };
}

/**
 * ノートの createdAt からフロントマター用の日時文字列を生成
 * @example formatDateForFrontmatter('2026-02-27T11:10:00Z') → '2026-02-27 11:10'
 */
function formatDateForFrontmatter(isoString?: string): string {
    if (!isoString) return '';
    const { yyyy, mm, dd, hh, min } = formatDateParts(new Date(isoString));
    return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}



/**
 * ノート全体をMarkdown形式にフォーマット
 *
 * フォーマット:
 * ```
 * ---
 * date: YYYY-MM-DD hh:mm
 * tags:
 *   - カテゴリ1
 *   - カテゴリ2
 * ---
 *
 * # ノートタイトル
 *
 * メモ本文1
 *
 * ***
 *
 * メモ本文2
 * ```
 */
export function formatNoteForExport(
    note: Note,
    memos: MemoData[],
    categories: Category[]
): string {
    const date = formatDateForFrontmatter(note.createdAt);

    // カテゴリをタグとして取得
    const noteCategories = note.categories || [];
    const tagNames = noteCategories
        .map(catId => {
            const cat = categories.find(c => String(c.id) === catId);
            return cat ? cat.name : null;
        })
        .filter(Boolean);

    // フロントマター
    let frontmatter = `---\ndate: ${date}`;
    if (tagNames.length > 0) {
        frontmatter += '\ntags:';
        for (const tag of tagNames) {
            frontmatter += `\n  - ${tag}`;
        }
    }
    frontmatter += '\n---';

    // 見出し
    const heading = `# ${note.title}`;

    // メモ連結
    const memoContents = memos
        .map(m => m.content)
        .join('\n\n***\n\n');

    // 組み立て
    const parts = [frontmatter, heading, memoContents];

    return parts.join('\n\n');
}

/**
 * ノートを指定フォルダにエクスポート
 */
export async function exportNote(
    note: Note,
    memos: MemoData[],
    categories: Category[],
    exportDir: string
): Promise<boolean> {
    try {
        const { yyyy, mm, dd } = formatDateParts(new Date(note.createdAt!));
        const yy = String(yyyy).slice(2);
        const fileName = `${yy}${mm}${dd}_${sanitizeFileName(note.title)}.md`;
        const filePath = `${exportDir}/${fileName}`;
        const content = formatNoteForExport(note, memos, categories);

        await writeTextFile(filePath, content);
        return true;
    } catch (error) {
        console.error('Failed to export note:', error);
        return false;
    }
}
