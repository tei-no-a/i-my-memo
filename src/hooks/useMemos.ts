import { useState, useEffect, useRef, useCallback } from 'react';
import { storage } from '../utils/storage';
import { MEMO_DIR } from '../constants';
import { getMemoPath, generateMemoId, parseMemoId } from '../utils/memo';
import type { MemoData } from '../types';

export function useMemos() {
    const [memos, setMemos] = useState<MemoData[]>([]);
    const [lastCreatedId, setLastCreatedId] = useState<string | null>(null);
    const saveTimeoutRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

    useEffect(() => {
        const load = async () => {
            await storage.ensureDir(MEMO_DIR);
            const entries = await storage.list(MEMO_DIR);
            const loadedMemos: MemoData[] = [];

            for (const entry of entries) {
                if (entry.isFile && entry.name.endsWith('.md')) {
                    const id = entry.name.replace('.md', '');
                    const content = await storage.readText(`${MEMO_DIR}/${entry.name}`);
                    if (content !== null) {
                        loadedMemos.push({
                            id,
                            content,
                            createdAt: parseMemoId(id)
                        });
                    }
                }
            }
            setMemos(loadedMemos.sort((a, b) => b.id.localeCompare(a.id)));
        };
        load();
    }, []);

    const createMemoFile = useCallback(async () => {
        const id = generateMemoId(new Date());
        const newMemo: MemoData = {
            id,
            content: '',
            createdAt: parseMemoId(id)
        };

        const success = await storage.writeText(getMemoPath(id), '');
        if (success) {
            setMemos(prev => [newMemo, ...prev]);
            setLastCreatedId(id);
            return newMemo;
        }
        return null;
    }, []);

    const duplicateMemoFile = useCallback(async (sourceId: string) => {
        const content = await storage.readText(getMemoPath(sourceId));
        if (content === null) return null;

        const id = generateMemoId(new Date());
        const newMemo: MemoData = {
            id,
            content,
            createdAt: parseMemoId(id)
        };

        const success = await storage.writeText(getMemoPath(id), content);
        if (success) {
            setMemos(prev => [newMemo, ...prev]);
            setLastCreatedId(id);
            return newMemo;
        }
        return null;
    }, []);

    const updateMemo = useCallback((id: string, content: string) => {
        // Optimistic update
        setMemos(prev => prev.map(memo => memo.id === id ? { ...memo, content } : memo));

        if (saveTimeoutRef.current[id]) {
            clearTimeout(saveTimeoutRef.current[id]);
        }

        saveTimeoutRef.current[id] = setTimeout(async () => {
            await storage.writeText(getMemoPath(id), content);
            delete saveTimeoutRef.current[id];
        }, 500);
    }, []);

    const deleteMemoFile = useCallback(async (id: string) => {
        const success = await storage.remove(getMemoPath(id));
        if (success) {
            setMemos(prev => prev.filter(memo => memo.id !== id));
            return true;
        }
        return false;
    }, []);

    return {
        memos,
        lastCreatedId,
        createMemoFile,
        duplicateMemoFile,
        updateMemo,
        deleteMemoFile
    };
}
