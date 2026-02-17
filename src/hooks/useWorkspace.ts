import { useMemo, useCallback } from 'react';
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
        removeMemoFromNote,
        reorderMemos,
        moveMemoToNote: moveMemoToNoteRaw,
        addNote,
        deleteNote: deleteNoteRaw
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

    const deleteNote = useCallback(async (noteId: string) => {
        console.log('[useWorkspace] deleteNote called for:', noteId);
        try {
            await deleteNoteRaw(noteId);
            console.log('[useWorkspace] Note deleted. Scheduling switch to board...');
            // Force separate render cycle
            setTimeout(() => {
                console.log('[useWorkspace] Switching to board (delayed)');
                selectNote(SPECIAL_NOTE_IDS.BOARD);
            }, 0);
        } catch (error) {
            console.error("Failed to delete note", error);
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
        // Memos
        memos,
        lastCreatedId,
        createMemo,
        updateMemo,
        deleteMemo,
        deleteNote,
        // DnD operations
        reorderMemos,
        moveMemoToNote,
    };
}

