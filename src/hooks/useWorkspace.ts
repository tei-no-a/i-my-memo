import { useMemo, useCallback, useEffect } from 'react';
import { useCategories } from './useCategories';
import { useMemos } from './useMemos';
import { useNotes } from './useNotes';
import { SPECIAL_NOTE_IDS } from '../constants';
import type { MemoData } from '../types';

export function useWorkspace() {
    const {
        notes,
        activeNoteId,
        setActiveNoteId: selectNote,
        activeNote,
        addMemoToNote,
        insertMemoAfter,
        removeMemoFromNote,
        reorderMemos,
        moveMemoToNote: moveMemoToNoteRaw,
        addNote,
        renameNote,
        toggleCategory,
        deleteNote: deleteNoteRaw
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
    // Memo Operations (メモの操作ロジック)
    // ==========================================

    // [Feature Extension Point]: duplicateMemo
    // 今後「メモの複製」機能を追加する際は、ここに以下のようなメソッドを追加します。
    // 1. useMemos 側に duplicateMemoFile(content) を生やす
    // 2. このフック内でそれを利用し、新しいメモを useNotes の insertMemoAfter 等で直下に配置する。

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

    // [Feature Extension Point]: exportMemo
    // 今後「指定フォルダへのメモエクスポート」機能を追加する際は、ここにメソッドを追加します。
    // Tauriの @tauri-apps/plugin-dialog (save) を用いて保存先を取得し、
    // plugin-fs (writeTextFile) を使って対象メモの内容を出力する想定です。

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
        emptyTrash,
        deleteNote,
        // DnD operations
        reorderMemos,
        moveMemoToNote,
    };
}

