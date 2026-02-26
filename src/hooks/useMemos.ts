import { useState, useEffect, useRef, useCallback } from 'react';
import { storage } from '../utils/storage';
import { MEMO_DIR } from '../constants';
import { getMemoPath, generateMemoId, parseMemoId } from '../utils/memo';
import type { MemoData } from '../types';

/**
 * メモの状態管理フック（遅延読み込み対応版）
 *
 * 設計方針:
 * - 起動時はファイル名からメタデータ（id, createdAt）だけを取得し、本文は読まない
 * - ノート選択時に必要なメモだけ Promise.all で並列に本文を読み込む
 * - 一度読み込んだ本文は contentCache に保持し、再読み込みを防止する
 * - メモの作成・編集・削除時にキャッシュも同期的に更新する
 */
export function useMemos() {
    const [loadedMemos, setLoadedMemos] = useState<MemoData[]>([]);
    const [isLoadingMemos, setIsLoadingMemos] = useState(false);
    const [lastCreatedId, setLastCreatedId] = useState<string | null>(null);
    const saveTimeoutRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
    const contentCache = useRef<Map<string, string>>(new Map());

    // 起動時: メモ保存ディレクトリの存在を保証
    useEffect(() => {
        storage.ensureDir(MEMO_DIR);
    }, []);

    // 指定されたメモIDの本文を並列で読み込み、loadedMemosを更新する
    const loadMemosForNote = useCallback(async (memoIds: string[]) => {
        setIsLoadingMemos(true);
        try {
            // キャッシュにないメモだけファイルから読み込む
            const uncachedIds = memoIds.filter(id => !contentCache.current.has(id));

            if (uncachedIds.length > 0) {
                const results = await Promise.all(
                    uncachedIds.map(async id => ({
                        id,
                        content: await storage.readText(getMemoPath(id))
                    }))
                );
                results.forEach(r => {
                    if (r.content !== null) {
                        contentCache.current.set(r.id, r.content);
                    }
                });
            }

            // キャッシュからMemoData[]を構築（memoIdsの順序を維持）
            const loaded: MemoData[] = memoIds
                .filter(id => contentCache.current.has(id))
                .map(id => ({
                    id,
                    content: contentCache.current.get(id)!,
                    createdAt: parseMemoId(id)
                }));
            setLoadedMemos(loaded);
        } finally {
            setIsLoadingMemos(false);
        }
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
            contentCache.current.set(id, '');
            setLoadedMemos(prev => [...prev, newMemo]);
            setLastCreatedId(id);
            return newMemo;
        }
        return null;
    }, []);

    const duplicateMemoFile = useCallback(async (sourceId: string) => {
        const content = contentCache.current.get(sourceId)
            ?? await storage.readText(getMemoPath(sourceId));
        if (content === null) return null;

        const id = generateMemoId(new Date());
        const newMemo: MemoData = {
            id,
            content,
            createdAt: parseMemoId(id)
        };

        const success = await storage.writeText(getMemoPath(id), content);
        if (success) {
            contentCache.current.set(id, content);
            setLoadedMemos(prev => [...prev, newMemo]);
            setLastCreatedId(id);
            return newMemo;
        }
        return null;
    }, []);

    const updateMemo = useCallback((id: string, content: string) => {
        // キャッシュとstateを即座に更新（オプティミスティック更新）
        contentCache.current.set(id, content);
        setLoadedMemos(prev => prev.map(memo =>
            memo.id === id ? { ...memo, content } : memo
        ));

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
            contentCache.current.delete(id);
            setLoadedMemos(prev => prev.filter(memo => memo.id !== id));
            return true;
        }
        return false;
    }, []);

    return {
        loadedMemos,
        isLoadingMemos,
        lastCreatedId,
        loadMemosForNote,
        createMemoFile,
        duplicateMemoFile,
        updateMemo,
        deleteMemoFile
    };
}
