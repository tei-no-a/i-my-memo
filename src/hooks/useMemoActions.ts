import { useCallback } from 'react';
import { SPECIAL_NOTE_IDS } from '../constants';
import { exportMemo as exportMemoToFile } from '../utils/export';
import type { MemoData, MemoType, ExportSettings, Note } from '../types';

interface UseMemoActionsProps {
    activeNoteId: string;
    activeNote: Note;
    loadedMemos: MemoData[];
    exportSettings?: ExportSettings;

    createMemoFile: (type?: MemoType) => Promise<MemoData | null>;
    duplicateMemoFile: (id: string) => Promise<MemoData | null>;
    deleteMemoFile: (id: string) => Promise<boolean>;

    addMemoToNote: (noteId: string, memoId: string) => void;
    insertMemoAfter: (noteId: string, targetMemoId: string, newMemoId: string) => void;
    removeMemoFromNote: (noteId: string, memoId: string) => void;
    moveMemoToNoteRaw: (fromNoteId: string, toNoteId: string, memoId: string) => void;
    reorderMemos: (noteId: string, newMemoIds: string[]) => void;
}

export function useMemoActions({
    activeNoteId,
    activeNote,
    loadedMemos,
    exportSettings,
    createMemoFile,
    duplicateMemoFile,
    deleteMemoFile,
    addMemoToNote,
    insertMemoAfter,
    removeMemoFromNote,
    moveMemoToNoteRaw,
    reorderMemos
}: UseMemoActionsProps) {
    const duplicateMemo = useCallback(async (memoId: string) => {
        try {
            const newMemo = await duplicateMemoFile(memoId);
            if (newMemo) {
                insertMemoAfter(activeNoteId, memoId, newMemo.id);
            }
        } catch (error) {
            console.error("Failed to duplicate memo", error);
        }
    }, [duplicateMemoFile, insertMemoAfter, activeNoteId]);

    const createMemo = useCallback(async (afterMemoId?: string, type?: MemoType) => {
        try {
            const newMemo = await createMemoFile(type);
            if (newMemo) {
                if (afterMemoId) {
                    insertMemoAfter(activeNoteId, afterMemoId, newMemo.id);
                } else {
                    await addMemoToNote(activeNoteId, newMemo.id);
                }
            }
        } catch (error) {
            console.error("Failed to add memo", error);
        }
    }, [createMemoFile, addMemoToNote, insertMemoAfter, activeNoteId]);

    const deleteMemo = useCallback(async (id: string) => {
        try {
            if (activeNoteId === SPECIAL_NOTE_IDS.TRASH) {
                // Permanently delete if in Trash
                const success = await deleteMemoFile(id);
                if (success) {
                    await removeMemoFromNote(activeNoteId, id);
                }
            } else {
                // Move to Trash if not in Trash
                await moveMemoToNoteRaw(activeNoteId, SPECIAL_NOTE_IDS.TRASH, id);
            }
        } catch (error) {
            console.error("Failed to delete memo", error);
        }
    }, [deleteMemoFile, removeMemoFromNote, activeNoteId, moveMemoToNoteRaw]);

    const emptyTrash = useCallback(async () => {
        if (activeNoteId !== SPECIAL_NOTE_IDS.TRASH) return;
        try {
            const trashMemoIds = [...activeNote.memoIds];
            if (trashMemoIds.length === 0) return;

            const promises = trashMemoIds.map(id => deleteMemoFile(id));
            await Promise.all(promises);

            reorderMemos(activeNoteId, []);
        } catch (error) {
            console.error("Failed to empty trash", error);
        }
    }, [activeNoteId, activeNote.memoIds, deleteMemoFile, reorderMemos]);

    // メモエクスポート: フォーマット→書き出し→Trash移動
    const exportMemo = useCallback(async (memoId: string) => {
        if (!exportSettings?.memoExportDir) {
            alert('エクスポート先フォルダが未設定です。\\nSettings > General からメモエクスポート先フォルダを設定してください。');
            return;
        }

        // loadedMemos からメモ内容を取得
        const memo = loadedMemos.find(m => m.id === memoId);
        if (!memo) {
            console.error('Memo not found:', memoId);
            return;
        }

        const success = await exportMemoToFile(memoId, memo.content, exportSettings.memoExportDir);
        if (success) {
            // クリップボードにメモの内容をコピー
            try {
                await navigator.clipboard.writeText(memo.content);
            } catch (error) {
                console.error('Failed to copy to clipboard:', error);
            }

            // 成功時はメモをTrashに移動
            await moveMemoToNoteRaw(activeNoteId, SPECIAL_NOTE_IDS.TRASH, memoId);
        } else {
            alert('エクスポートに失敗しました。');
        }
    }, [exportSettings?.memoExportDir, loadedMemos, moveMemoToNoteRaw, activeNoteId]);

    return {
        createMemo,
        duplicateMemo,
        deleteMemo,
        exportMemo,
        emptyTrash
    };
}
