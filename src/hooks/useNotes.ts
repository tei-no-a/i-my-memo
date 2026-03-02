import { useState, useEffect, useCallback, useRef } from 'react';
import type { Note } from '../types';
import { NOTES_FILE, DEFAULT_NOTES, SPECIAL_NOTE_IDS } from '../constants';
import { storage } from '../utils/storage';

/**
 * notes の状態管理と永続化を行うフック。
 *
 * 設計方針:
 * - 全ての更新関数で setNotes(prev => ...) の関数型更新を使用し、
 *   常に最新の state を参照する（ステールクロージャ問題の防止）
 * - notes の変更は useEffect で検知し、自動的にファイルへ永続化する
 *   （React StrictMode でのアップデータ関数2回呼び出し問題を回避）
 * - 初期ロード完了前の書き込みを防ぐため isLoaded フラグを使用
 */
export function useNotes() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [activeNoteId, setActiveNoteId] = useState<string>(SPECIAL_NOTE_IDS.BOARD);
    const isLoaded = useRef(false);

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
            isLoaded.current = true;
        };

        loadNotes();
    }, []);

    // notes が変わるたびにファイルへ永続化（初期ロード完了後のみ）
    useEffect(() => {
        if (!isLoaded.current) return;
        if (notes.length === 0) return;

        storage.writeJson(NOTES_FILE, notes).catch(error => {
            console.error('Failed to save notes:', error);
        });
    }, [notes]);

    // Helper: update a single note by ID with a partial update
    const updateNote = useCallback((
        noteId: string,
        updater: (note: Note) => Partial<Note>
    ) => {
        setNotes(prev => prev.map(note =>
            note.id === noteId
                ? { ...note, ...updater(note), updatedAt: new Date().toISOString() }
                : note
        ));
    }, []);

    // Helper: update multiple notes at once (atomic save)
    const updateMultipleNotes = useCallback((
        updates: Array<{ noteId: string; updater: (note: Note) => Partial<Note> }>
    ) => {
        const updateMap = new Map(updates.map(u => [u.noteId, u.updater]));
        setNotes(prev => prev.map(note => {
            const updater = updateMap.get(note.id);
            return updater
                ? { ...note, ...updater(note), updatedAt: new Date().toISOString() }
                : note;
        }));
    }, []);

    const addMemoToNote = useCallback((noteId: string, memoId: string) => {
        updateNote(noteId, note => ({
            memoIds: [...note.memoIds, memoId]
        }));
    }, [updateNote]);

    const insertMemoAfter = useCallback((noteId: string, targetMemoId: string, newMemoId: string) => {
        updateNote(noteId, note => {
            const index = note.memoIds.indexOf(targetMemoId);
            if (index === -1) {
                return { memoIds: [...note.memoIds, newMemoId] };
            }
            const newMemoIds = [...note.memoIds];
            newMemoIds.splice(index + 1, 0, newMemoId);
            return { memoIds: newMemoIds };
        });
    }, [updateNote]);

    const removeMemoFromNote = useCallback((noteId: string, memoId: string) => {
        updateNote(noteId, note => ({
            memoIds: note.memoIds.filter(id => id !== memoId)
        }));
    }, [updateNote]);

    const reorderMemos = useCallback((noteId: string, newMemoIds: string[]) => {
        updateNote(noteId, () => ({ memoIds: newMemoIds }));
    }, [updateNote]);

    const reorderNotes = useCallback((newNotes: Note[]) => {
        setNotes(newNotes);
    }, []);

    const moveMemoToNote = useCallback((fromNoteId: string, toNoteId: string, memoId: string) => {
        updateMultipleNotes([
            { noteId: fromNoteId, updater: note => ({ memoIds: note.memoIds.filter(id => id !== memoId) }) },
            { noteId: toNoteId, updater: note => ({ memoIds: [...note.memoIds, memoId] }) },
        ]);
    }, [updateMultipleNotes]);

    const addNote = useCallback((title: string) => {
        const newNote: Note = {
            id: Date.now().toString(),
            title,
            categories: [],
            memoIds: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        setNotes(prev => [...prev, newNote]);
    }, []);

    const renameNote = useCallback((noteId: string, newTitle: string) => {
        const trimmed = newTitle.trim();
        if (!trimmed) return;
        updateNote(noteId, () => ({ title: trimmed }));
    }, [updateNote]);

    const toggleCategory = useCallback((noteId: string, categoryId: string) => {
        updateNote(noteId, (note) => {
            const currentCategories = note.categories || [];
            const newCategories = currentCategories.includes(categoryId)
                ? currentCategories.filter(id => id !== categoryId)
                : [...currentCategories, categoryId];
            return { categories: newCategories };
        });
    }, [updateNote]);

    const deleteNote = useCallback((noteId: string): boolean => {
        // Prevent deleting special notes
        if (noteId === SPECIAL_NOTE_IDS.BOARD || noteId === SPECIAL_NOTE_IDS.TRASH) {
            return false;
        }

        let found = false;
        setNotes(prev => {
            const targetNote = prev.find(n => n.id === noteId);
            if (!targetNote) {
                return prev;
            }
            found = true;
            // Move memos from the deleted note to the Board
            return prev
                .filter(n => n.id !== noteId)
                .map(n => n.id === SPECIAL_NOTE_IDS.BOARD
                    ? { ...n, memoIds: [...n.memoIds, ...targetNote.memoIds], updatedAt: new Date().toISOString() }
                    : n
                );
        });
        return found;
    }, []);

    /** ノート削除（メモをTrashに移動するバージョン、エクスポート後用） */
    const deleteNoteToTrash = useCallback((noteId: string): boolean => {
        if (noteId === SPECIAL_NOTE_IDS.BOARD || noteId === SPECIAL_NOTE_IDS.TRASH) {
            return false;
        }

        let found = false;
        setNotes(prev => {
            const targetNote = prev.find(n => n.id === noteId);
            if (!targetNote) {
                return prev;
            }
            found = true;
            return prev
                .filter(n => n.id !== noteId)
                .map(n => n.id === SPECIAL_NOTE_IDS.TRASH
                    ? { ...n, memoIds: [...n.memoIds, ...targetNote.memoIds], updatedAt: new Date().toISOString() }
                    : n
                );
        });
        return found;
    }, []);

    const activeNote = notes.find(n => n.id === activeNoteId) || DEFAULT_NOTES[0];

    return {
        notes,
        activeNoteId,
        setActiveNoteId,
        activeNote,
        addMemoToNote,
        insertMemoAfter,
        removeMemoFromNote,
        reorderMemos,
        reorderNotes,
        moveMemoToNote,
        addNote,
        renameNote,
        toggleCategory,
        deleteNote,
        deleteNoteToTrash
    };
}
