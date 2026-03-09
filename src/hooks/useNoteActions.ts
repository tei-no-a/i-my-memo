import { useCallback } from 'react';
import { SPECIAL_NOTE_IDS } from '../constants';
import { exportNote as exportNoteToFile } from '../utils/export';
import type { MemoData, ExportSettings, Note, Category } from '../types';

interface UseNoteActionsProps {
    activeNoteId: string;
    activeNote: Note;
    loadedMemos: MemoData[];
    categories: Category[];
    exportSettings?: ExportSettings;

    deleteNoteRaw: (noteId: string) => boolean;
    deleteNoteToTrash: (noteId: string) => boolean;
    moveMemoToNoteRaw: (fromNoteId: string, toNoteId: string, memoId: string) => void;
    selectNote: (noteId: string) => void;
}

export function useNoteActions({
    activeNoteId,
    activeNote,
    loadedMemos,
    categories,
    exportSettings,
    deleteNoteRaw,
    deleteNoteToTrash,
    moveMemoToNoteRaw,
    selectNote
}: UseNoteActionsProps) {
    // ノートエクスポート: フォーマット→書き出し→ノート削除(メモをTrash移動)→Board遷移
    const exportNoteHandler = useCallback(async () => {
        if (!exportSettings?.noteExportDir) {
            alert('エクスポート先フォルダが未設定です。\\nSettings > General からノートエクスポート先フォルダを設定してください。');
            return;
        }

        // ノート内のメモをloadedMemosから取得
        const noteMemos = activeNote.memoIds
            .map(id => loadedMemos.find(m => m.id === id))
            .filter((m): m is MemoData => m !== undefined);

        const success = await exportNoteToFile(
            activeNote,
            noteMemos,
            categories,
            exportSettings.noteExportDir
        );

        if (success) {
            // ノートを削除し、メモをTrashに移動
            deleteNoteToTrash(activeNoteId);
            selectNote(SPECIAL_NOTE_IDS.BOARD);
        } else {
            alert('ノートのエクスポートに失敗しました。');
        }
    }, [exportSettings?.noteExportDir, activeNote, loadedMemos, categories, deleteNoteToTrash, activeNoteId, selectNote]);

    const deleteNote = useCallback((noteId: string) => {
        const deleted = deleteNoteRaw(noteId);
        if (deleted) {
            selectNote(SPECIAL_NOTE_IDS.BOARD);
        }
    }, [deleteNoteRaw, selectNote]);

    const moveMemoToNote = useCallback(async (memoId: string, targetNoteId: string) => {
        try {
            await moveMemoToNoteRaw(activeNoteId, targetNoteId, memoId);
        } catch (error) {
            console.error("Failed to move memo", error);
        }
    }, [moveMemoToNoteRaw, activeNoteId]);

    return {
        exportNote: exportNoteHandler,
        deleteNote,
        moveMemoToNote
    };
}
