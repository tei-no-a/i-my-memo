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

    useEffect(() => {
        console.log('[useNotes] notes state updated. count:', notes.length, 'IDs:', notes.map(n => n.id));
    }, [notes]);

    useEffect(() => {
        console.log('[useNotes] activeNoteId updated:', activeNoteId);
    }, [activeNoteId]);

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

    const deleteNote = useCallback(async (noteId: string) => {
        console.log('[useNotes] deleteNote called with:', noteId);
        console.log('[useNotes] Current notes IDs:', notes.map(n => n.id));
        // Prevent deleting special notes
        if (noteId === SPECIAL_NOTE_IDS.BOARD || noteId === SPECIAL_NOTE_IDS.TRASH) {
            console.log('[useNotes] Attempted to delete special note, aborting.');
            return;
        }

        const targetNote = notes.find(n => n.id === noteId);
        if (!targetNote) {
            console.log('[useNotes] Target note not found:', noteId);
            return;
        }

        console.log('[useNotes] Deleting note, moving memos to board. Target memos:', targetNote.memoIds);

        // Move memos from the deleted note to the Board
        const updatedNotes = notes
            .filter(n => n.id !== noteId)
            .map(n => n.id === SPECIAL_NOTE_IDS.BOARD
                ? { ...n, memoIds: [...n.memoIds, ...targetNote.memoIds], updatedAt: new Date().toISOString() }
                : n
            );

        console.log('[useNotes] Saving updated notes:', updatedNotes);
        await saveNotes(updatedNotes);
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
        addNote,
        deleteNote
    };
}
