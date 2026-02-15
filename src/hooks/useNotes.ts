import { useState, useEffect, useCallback } from 'react';
import { BaseDirectory, readTextFile, writeTextFile, exists } from '@tauri-apps/plugin-fs';
import type { Note } from '../types';

const NOTES_FILE = 'notes.json';

const DEFAULT_NOTES: Note[] = [
    {
        id: 'board',
        title: 'Board',
        memoIds: []
    },
    {
        id: 'trash',
        title: 'Trash',
        memoIds: []
    },
    {
        id: '1739000000001',
        title: 'Ideas',
        categories: [],
        memoIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: '1739000000002',
        title: 'Work',
        categories: [],
        memoIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];

export function useNotes() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [activeNoteId, setActiveNoteId] = useState<string>('board');

    // Load notes on mount
    useEffect(() => {
        const loadNotes = async () => {
            try {
                const fileExists = await exists(NOTES_FILE, { baseDir: BaseDirectory.AppLocalData });

                if (!fileExists) {
                    // Initialize with default notes
                    await writeTextFile(NOTES_FILE, JSON.stringify(DEFAULT_NOTES, null, 2), { baseDir: BaseDirectory.AppLocalData });
                    setNotes(DEFAULT_NOTES);
                } else {
                    const content = await readTextFile(NOTES_FILE, { baseDir: BaseDirectory.AppLocalData });
                    setNotes(JSON.parse(content));
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
            await writeTextFile(NOTES_FILE, JSON.stringify(newNotes, null, 2), { baseDir: BaseDirectory.AppLocalData });
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

    // Helper to get active note object
    const activeNote = notes.find(n => n.id === activeNoteId) || DEFAULT_NOTES[0];

    return {
        notes,
        activeNoteId,
        setActiveNoteId,
        activeNote,
        addMemoToNote,
        removeMemoFromNote,
        addNote
    };
}
