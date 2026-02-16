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

    const saveNotes = useCallback(async (newNotes: Note[]) => {
        try {
            await storage.writeJson(NOTES_FILE, newNotes);
            setNotes(newNotes);
        } catch (error) {
            console.error('Failed to save notes:', error);
        }
    }, []);

    // Helper: update a single note by ID with a partial update
    const updateNote = useCallback(async (
        noteId: string,
        updater: (note: Note) => Partial<Note>
    ) => {
        const updatedNotes = notes.map(note =>
            note.id === noteId
                ? { ...note, ...updater(note), updatedAt: new Date().toISOString() }
                : note
        );
        await saveNotes(updatedNotes);
    }, [notes, saveNotes]);

    // Helper: update multiple notes at once (atomic save)
    const updateMultipleNotes = useCallback(async (
        updates: Array<{ noteId: string; updater: (note: Note) => Partial<Note> }>
    ) => {
        const updateMap = new Map(updates.map(u => [u.noteId, u.updater]));
        const updatedNotes = notes.map(note => {
            const updater = updateMap.get(note.id);
            return updater
                ? { ...note, ...updater(note), updatedAt: new Date().toISOString() }
                : note;
        });
        await saveNotes(updatedNotes);
    }, [notes, saveNotes]);

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
        await saveNotes([...notes, newNote]);
    }, [notes, saveNotes]);

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
