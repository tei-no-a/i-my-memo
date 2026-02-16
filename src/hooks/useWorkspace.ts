import { useMemo, useCallback } from 'react';
import { useMemos } from './useMemos';
import { useNotes } from './useNotes';
import type { MemoData } from '../types';

export function useWorkspace() {
    const {
        notes,
        activeNoteId,
        setActiveNoteId: selectNote,
        activeNote,
        addMemoToNote,
        removeMemoFromNote,
        reorderMemos,
        moveMemoToNote: moveMemoToNoteRaw,
        addNote
    } = useNotes();

    const {
        memos: allMemos,
        lastCreatedId,
        createMemoFile,
        updateMemo,
        deleteMemoFile
    } = useMemos();

    // Filter memos belonging to the active note and preserve order
    const memos = useMemo(() => {
        const memoMap = new Map(allMemos.map(m => [m.id, m]));
        return activeNote.memoIds
            .map(id => memoMap.get(id))
            .filter((m): m is MemoData => m !== undefined);
    }, [allMemos, activeNote]);

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
            const success = await deleteMemoFile(id);
            if (success) {
                await removeMemoFromNote(activeNoteId, id);
            }
        } catch (error) {
            console.error("Failed to delete memo", error);
        }
    }, [deleteMemoFile, removeMemoFromNote, activeNoteId]);

    const moveMemoToNote = useCallback(async (memoId: string, targetNoteId: string) => {
        try {
            await moveMemoToNoteRaw(activeNoteId, targetNoteId, memoId);
        } catch (error) {
            console.error("Failed to move memo", error);
        }
    }, [moveMemoToNoteRaw, activeNoteId]);

    return {
        notes,
        activeNote,
        activeNoteId,
        selectNote,
        memos,
        lastCreatedId,
        addNote,
        createMemo,
        updateMemo,
        deleteMemo,
        reorderMemos,
        moveMemoToNote
    };
}
