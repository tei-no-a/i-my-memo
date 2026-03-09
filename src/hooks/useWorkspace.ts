import { useMemo, useCallback, useEffect } from 'react';
import { useCategories } from './useCategories';
import { useMemos } from './useMemos';
import { useNotes } from './useNotes';
import { SPECIAL_NOTE_IDS } from '../constants';
import { useKeybindings } from './useKeybindings';
import { exportMemo as exportMemoToFile, exportNote as exportNoteToFile } from '../utils/export';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';
import type { MemoData } from '../types';
import type { ExportSettings } from '../types';

export function useWorkspace(exportSettings?: ExportSettings, allowShortcuts: boolean = true, focusedMemoId: string | null = null, onStartCreatingNote?: () => void) {
    const { keybindings, updateKeybinding, resetKeybindings } = useKeybindings();
    const {
        notes,
        activeNoteId,
        setActiveNoteId: selectNote,
        activeNote,
        addMemoToNote,
        insertMemoAfter,
        removeMemoFromNote,
        reorderMemos,
        reorderNotes,
        moveMemoToNote: moveMemoToNoteRaw,
        addNote,
        renameNote,
        toggleCategory,
        deleteNote: deleteNoteRaw,
        deleteNoteToTrash
    } = useNotes();

    const {
        categories,
        addCategory,
        updateCategory,
        deleteCategory: deleteCategoryRaw
    } = useCategories();

    const {
        loadedMemos,
        isLoadingMemos,
        lastCreatedId,
        loadMemosForNote,
        createMemoFile,
        duplicateMemoFile,
        updateMemo,
        deleteMemoFile
    } = useMemos();

    // ノート切り替え時にメモの本文を読み込む
    useEffect(() => {
        loadMemosForNote(activeNote.memoIds);
    }, [activeNote.memoIds, loadMemosForNote]);

    // loadedMemos からアクティブノートのメモを順序付きで取得
    const memos = useMemo(() => {
        const memoMap = new Map(loadedMemos.map(m => [m.id, m]));
        return activeNote.memoIds
            .map(id => memoMap.get(id))
            .filter((m): m is MemoData => m !== undefined);
    }, [loadedMemos, activeNote]);

    // ==========================================
    // メモの操作ロジック
    // ==========================================

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

    const createMemo = useCallback(async () => {
        try {
            const newMemo = await createMemoFile();
            if (newMemo) {
                await addMemoToNote(activeNoteId, newMemo.id);
            }
        } catch (error) {
            console.error("Failed to add memo", error);
        }
    }, [createMemoFile, addMemoToNote, activeNoteId]);

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
            alert('エクスポート先フォルダが未設定です。\nSettings > General からメモエクスポート先フォルダを設定してください。');
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

    // ノートエクスポート: フォーマット→書き出し→ノート削除(メモをTrash移動)→Board遷移
    const exportNoteHandler = useCallback(async () => {
        if (!exportSettings?.noteExportDir) {
            alert('エクスポート先フォルダが未設定です。\nSettings > General からノートエクスポート先フォルダを設定してください。');
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

    const actionHandlers = useMemo(() => ({
        createMemo,
        exportMemo: () => {
            if (memos.length > 0) {
                exportMemo(memos[memos.length - 1].id);
            }
        },
        deleteMemo: () => {
            if (focusedMemoId) {
                deleteMemo(focusedMemoId);
            }
        },
        copyMemo: () => {
            if (focusedMemoId) {
                const memo = memos.find(m => m.id === focusedMemoId);
                if (memo) {
                    navigator.clipboard.writeText(memo.content).catch(err => {
                        console.error('Failed to copy to clipboard:', err);
                    });
                }
            }
        },
        addNote: () => {
            onStartCreatingNote?.();
        },
        openBoard: () => {
            selectNote(SPECIAL_NOTE_IDS.BOARD);
        },
    }), [createMemo, exportMemo, deleteMemo, memos, focusedMemoId, onStartCreatingNote, selectNote]);

    useKeyboardShortcuts(keybindings, actionHandlers, allowShortcuts);

    return {
        // Notes
        notes,
        activeNote,
        activeNoteId,
        selectNote,
        addNote,
        renameNote,
        toggleCategory,
        // Categories
        categories,
        addCategory,
        updateCategory,
        deleteCategory: deleteCategoryRaw,
        // Memos
        memos,
        isLoadingMemos,
        lastCreatedId,
        createMemo,
        duplicateMemo,
        updateMemo,
        deleteMemo,
        exportMemo,
        exportNote: exportNoteHandler,
        emptyTrash,
        deleteNote,
        // DnD operations
        reorderMemos,
        reorderNotes,
        moveMemoToNote,
        // Keybindings
        keybindings,
        updateKeybinding,
        resetKeybindings,
    };
}

