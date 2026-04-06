import { useMemo, useEffect } from 'react';
import { useCategories } from './useCategories';
import { useMemos } from './useMemos';
import { useNotes } from './useNotes';
import { SPECIAL_NOTE_IDS } from '../constants';
import { useKeybindings } from './useKeybindings';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';
import { useMemoActions } from './useMemoActions';
import { useNoteActions } from './useNoteActions';
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
    // メモとノートの操作ロジック
    // ==========================================
    const { createMemo, duplicateMemo, deleteMemo, exportMemo, emptyTrash } = useMemoActions({
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
    });

    const { exportNote, deleteNote, moveMemoToNote } = useNoteActions({
        activeNoteId,
        activeNote,
        loadedMemos,
        categories,
        exportSettings,
        deleteNoteRaw,
        deleteNoteToTrash,
        moveMemoToNoteRaw,
        selectNote
    });

    const actionHandlers = useMemo(() => ({
        createMemo: () => {
            createMemo(focusedMemoId ?? undefined);
        },
        exportMemo: () => {
            if (focusedMemoId) {
                exportMemo(focusedMemoId);
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
        createTaskList: () => {
            createMemo(focusedMemoId ?? undefined, 'tasklist');
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
        exportNote,
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
