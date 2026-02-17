import { useState, useEffect, useCallback } from 'react';
import type { Note } from '../types';
import { NOTES_FILE, DEFAULT_NOTES, SPECIAL_NOTE_IDS } from '../constants';
import { storage } from '../utils/storage';

/**
 * notes の状態管理と永続化を行うフック。
 *
 * 設計方針:
 * - 全ての更新関数で setNotes(prev => ...) の関数型更新を使用し、
 *   常に最新の state を参照する（ステールクロージャ問題の防止）
 * - ファイル書き込みは更新後の値で実行する
 */
export function useNotes() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [activeNoteId, setActiveNoteId] = useState<string>(SPECIAL_NOTE_IDS.BOARD);

    // Load notes on mount
    useEffect(() => {
        const loadNotes = async () => {
            try {
                const fileExists = await storage.exists(NOTES_FILE);

                if (!fileExists) {
                    await storage.writeJson(NOTES_FILE, DEFAULT_NOTES);
                    setNotes(DEFAULT_NOTES);
                } else {
                    const content = await storage.readJson<Note[]>(NOTES_FILE);
                    setNotes(content || DEFAULT_NOTES);
                }
            } catch (error) {
                console.error('Failed to load notes:', error);
                setNotes(DEFAULT_NOTES);
            }
        };

        loadNotes();
    }, []);

    // ファイルへの永続化のみを行うヘルパー
    const persistNotes = useCallback(async (updatedNotes: Note[]) => {
        try {
            await storage.writeJson(NOTES_FILE, updatedNotes);
        } catch (error) {
            console.error('Failed to save notes:', error);
        }
    }, []);

    // Helper: update a single note by ID with a partial update
    const updateNote = useCallback(async (
        noteId: string,
        updater: (note: Note) => Partial<Note>
    ) => {
        let result: Note[] = [];
        setNotes(prev => {
            result = prev.map(note =>
                note.id === noteId
                    ? { ...note, ...updater(note), updatedAt: new Date().toISOString() }
                    : note
            );
            return result;
        });
        await persistNotes(result);
    }, [persistNotes]);

    // Helper: update multiple notes at once (atomic save)
    const updateMultipleNotes = useCallback(async (
        updates: Array<{ noteId: string; updater: (note: Note) => Partial<Note> }>
    ) => {
        let result: Note[] = [];
        const updateMap = new Map(updates.map(u => [u.noteId, u.updater]));
        setNotes(prev => {
            result = prev.map(note => {
                const updater = updateMap.get(note.id);
                return updater
                    ? { ...note, ...updater(note), updatedAt: new Date().toISOString() }
                    : note;
            });
            return result;
        });
        await persistNotes(result);
    }, [persistNotes]);

    const addMemoToNote = useCallback(async (noteId: string, memoId: string) => {
        await updateNote(noteId, note => ({
            memoIds: [...note.memoIds, memoId]
        }));
    }, [updateNote]);

    const removeMemoFromNote = useCallback(async (noteId: string, memoId: string) => {
        await updateNote(noteId, note => ({
            memoIds: note.memoIds.filter(id => id !== memoId)
        }));
    }, [updateNote]);

    const reorderMemos = useCallback(async (noteId: string, newMemoIds: string[]) => {
        await updateNote(noteId, () => ({ memoIds: newMemoIds }));
    }, [updateNote]);

    const moveMemoToNote = useCallback(async (fromNoteId: string, toNoteId: string, memoId: string) => {
        await updateMultipleNotes([
            { noteId: fromNoteId, updater: note => ({ memoIds: note.memoIds.filter(id => id !== memoId) }) },
            { noteId: toNoteId, updater: note => ({ memoIds: [...note.memoIds, memoId] }) },
        ]);
    }, [updateMultipleNotes]);

    const addNote = useCallback(async (title: string) => {
        const newNote: Note = {
            id: Date.now().toString(),
            title,
            categories: [],
            memoIds: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        let result: Note[] = [];
        setNotes(prev => {
            result = [...prev, newNote];
            return result;
        });
        await persistNotes(result);
    }, [persistNotes]);

    const deleteNote = useCallback(async (noteId: string): Promise<boolean> => {
        // Prevent deleting special notes
        if (noteId === SPECIAL_NOTE_IDS.BOARD || noteId === SPECIAL_NOTE_IDS.TRASH) {
            return false;
        }

        let result: Note[] = [];
        let found = false;

        setNotes(prev => {
            const targetNote = prev.find(n => n.id === noteId);
            if (!targetNote) {
                result = prev;
                return prev;
            }
            found = true;
            // Move memos from the deleted note to the Board
            result = prev
                .filter(n => n.id !== noteId)
                .map(n => n.id === SPECIAL_NOTE_IDS.BOARD
                    ? { ...n, memoIds: [...n.memoIds, ...targetNote.memoIds], updatedAt: new Date().toISOString() }
                    : n
                );
            return result;
        });

        if (found) {
            await persistNotes(result);
        }
        return found;
    }, [persistNotes]);

    const activeNote = notes.find(n => n.id === activeNoteId) || DEFAULT_NOTES[0];

    return {
        notes,
        activeNoteId,
        setActiveNoteId,
        activeNote,
        addMemoToNote,
        removeMemoFromNote,
        reorderMemos,
        moveMemoToNote,
        addNote,
        deleteNote
    };
}
