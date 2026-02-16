import { useState, useEffect, useCallback } from 'react';
import type { Note } from '../types';
import { NOTES_FILE, DEFAULT_NOTES, SPECIAL_NOTE_IDS } from '../constants';
import { storage } from '../utils/storage';

export function useNotes() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [activeNoteId, setActiveNoteId] = useState<string>(SPECIAL_NOTE_IDS.BOARD);

    // Load notes on mount
    useEffect(() => {
        const loadNotes = async () => {
            try {
                const fileExists = await storage.exists(NOTES_FILE);

                if (!fileExists) {
                    // Initialize with default notes
                    await storage.writeJson(NOTES_FILE, DEFAULT_NOTES);
                    setNotes(DEFAULT_NOTES);
                } else {
                    const content = await storage.readJson<Note[]>(NOTES_FILE);
                    setNotes(content || DEFAULT_NOTES);
                }
            } catch (error) {
                console.error('Failed to load notes:', error);
                // Fallback to defaults to prevent app crash
                setNotes(DEFAULT_NOTES);
            }
        };

        loadNotes();
    }, []);

    const saveNotes = useCallback(async (newNotes: Note[]) => {
        try {
            await storage.writeJson(NOTES_FILE, newNotes);
            setNotes(newNotes);
        } catch (error) {
            console.error('Failed to save notes:', error);
        }
    }, []);

    const addMemoToNote = useCallback(async (noteId: string, memoId: string) => {
        const updatedNotes = notes.map(note => {
            if (note.id === noteId) {
                return {
                    ...note,
                    memoIds: [...note.memoIds, memoId], // Add to end
                    updatedAt: new Date().toISOString()
                };
            }
            return note;
        });

        await saveNotes(updatedNotes);
    }, [notes, saveNotes]);

    const removeMemoFromNote = useCallback(async (noteId: string, memoId: string) => {
        const updatedNotes = notes.map(note => {
            if (note.id === noteId) {
                return {
                    ...note,
                    memoIds: note.memoIds.filter(id => id !== memoId),
                    updatedAt: new Date().toISOString()
                };
            }
            return note;
        });

        await saveNotes(updatedNotes);
    }, [notes, saveNotes]);

    const addNote = useCallback(async (title: string) => {
        const newNote: Note = {
            id: Date.now().toString(),
            title,
            categories: [],
            memoIds: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const updatedNotes = [...notes, newNote];
        await saveNotes(updatedNotes);
    }, [notes, saveNotes]);

    const reorderMemos = useCallback(async (noteId: string, newMemoIds: string[]) => {
        const updatedNotes = notes.map(note => {
            if (note.id === noteId) {
                return {
                    ...note,
                    memoIds: newMemoIds,
                    updatedAt: new Date().toISOString()
                };
            }
            return note;
        });

        await saveNotes(updatedNotes);
    }, [notes, saveNotes]);

    const moveMemoToNote = useCallback(async (fromNoteId: string, toNoteId: string, memoId: string) => {
        const updatedNotes = notes.map(note => {
            if (note.id === fromNoteId) {
                return {
                    ...note,
                    memoIds: note.memoIds.filter(id => id !== memoId),
                    updatedAt: new Date().toISOString()
                };
            }
            if (note.id === toNoteId) {
                return {
                    ...note,
                    memoIds: [...note.memoIds, memoId],
                    updatedAt: new Date().toISOString()
                };
            }
            return note;
        });

        await saveNotes(updatedNotes);
    }, [notes, saveNotes]);

    // Helper to get active note object
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
        addNote
    };
}
