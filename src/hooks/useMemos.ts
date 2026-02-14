import { useState, useEffect, useRef, useCallback } from 'react';
import { loadMemos, saveMemo as saveMemoToFile, deleteMemo as deleteMemoFromFile } from '../utils/fileStorage';
import type { MemoData } from '../types';

export function useMemos() {
    const [memos, setMemos] = useState<MemoData[]>([]);
    const [lastCreatedId, setLastCreatedId] = useState<string | null>(null);
    const saveTimeoutRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

    useEffect(() => {
        loadMemos().then(setMemos).catch(console.error);
    }, []);

    const createMemoFile = useCallback(async () => {
        try {
            const newMemo = await saveMemoToFile('');
            setMemos(prev => [...prev, newMemo]);
            setLastCreatedId(newMemo.id);
            return newMemo;
        } catch (error) {
            console.error('Failed to create memo:', error);
            alert('Failed to create memo. See console for details.');
            return null;
        }
    }, []);

    const updateMemo = useCallback((id: string, content: string) => {
        // Optimistic update for immediate UI response
        setMemos(prev => prev.map(memo => memo.id === id ? { ...memo, content } : memo));

        // Debounce the file save
        if (saveTimeoutRef.current[id]) {
            clearTimeout(saveTimeoutRef.current[id]);
        }

        saveTimeoutRef.current[id] = setTimeout(() => {
            saveMemoToFile(content, id).catch(console.error);
            delete saveTimeoutRef.current[id];
        }, 500);
    }, []);

    const deleteMemoFile = useCallback(async (id: string) => {
        try {
            await deleteMemoFromFile(id);
            setMemos(prev => prev.filter(memo => memo.id !== id));
            return true;
        } catch (error) {
            console.error('Failed to delete memo:', error);
            return false;
        }
    }, []);

    return {
        memos,
        lastCreatedId,
        createMemoFile,
        updateMemo,
        deleteMemoFile
    };
}
