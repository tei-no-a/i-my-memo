import { useState, useEffect, useRef, useCallback } from 'react';
import { storage } from '../utils/storage';
import { MEMO_DIR } from '../constants';
import type { MemoData } from '../types';

const getMemoPath = (id: string) => `${MEMO_DIR}/${id}.md`;

// Generate filename/ID from date (YYYY-MM-DD-HH-mm-ss)
function generateMemoId(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
    return `${year}-${month}-${day}-${hours}-${minutes}-${seconds}`;
}

function parseMemoId(id: string): string {
    const parts = id.split('-');
    if (parts.length >= 6) {
        const [year, month, day, hour, minute, second] = parts;
        return `${year}/${month}/${day} ${hour}:${minute}:${second}`;
    }
    return 'Unknown';
}

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
        updateMemo,
        deleteMemoFile
    };
}
