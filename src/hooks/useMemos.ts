import { useState, useEffect, useRef, useCallback } from 'react';
import { storage } from '../utils/storage';
import { MEMO_DIR } from '../constants';
import { getMemoPath, generateMemoId, parseMemoId } from '../utils/memo';
import type { MemoData, MemoType } from '../types';

/**
 * メモの状態管理フック（遅延読み込み対応版）
 *
 * 設計方針:
 * - 起動時はファイル名からメタデータ（id, createdAt）だけを取得し、本文は読まない
 * - ノート選択時に必要なメモだけ Promise.all で並列に本文を読み込む
 * - 一度読み込んだ本文は contentCache に保持し、再読み込みを防止する
 * - メモの作成・編集・削除時にキャッシュも同期的に更新する
 */
const TASKLIST_MARKER = '<!--tasklist-->\n';

export function useMemos() {
    const [loadedMemos, setLoadedMemos] = useState<MemoData[]>([]);
    const [isLoadingMemos, setIsLoadingMemos] = useState(false);
    const [lastCreatedId, setLastCreatedId] = useState<string | null>(null);
    const saveTimeoutRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
    const contentCache = useRef<Map<string, string>>(new Map());
    const typeCache = useRef<Map<string, MemoType>>(new Map());

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
                        if (r.content.startsWith(TASKLIST_MARKER)) {
                            typeCache.current.set(r.id, 'tasklist');
                            contentCache.current.set(r.id, r.content.slice(TASKLIST_MARKER.length));
                        } else {
                            typeCache.current.set(r.id, 'text');
                            contentCache.current.set(r.id, r.content);
                        }
                    }
                });
            }

            // キャッシュからMemoData[]を構築（memoIdsの順序を維持）
            const loaded: MemoData[] = memoIds
                .filter(id => contentCache.current.has(id))
                .map(id => ({
                    id,
                    content: contentCache.current.get(id)!,
                    createdAt: parseMemoId(id),
                    type: typeCache.current.get(id) || 'text'
                }));
            setLoadedMemos(loaded);
        } finally {
            setIsLoadingMemos(false);
        }
    }, []);

    const createMemoFile = useCallback(async (type: MemoType = 'text') => {
        const id = generateMemoId(new Date());
        const newMemo: MemoData = {
            id,
            content: '',
            createdAt: parseMemoId(id),
            type
        };

        const fileContent = type === 'tasklist' ? TASKLIST_MARKER : '';
        const success = await storage.writeText(getMemoPath(id), fileContent);
        if (success) {
            contentCache.current.set(id, '');
            typeCache.current.set(id, type);
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

        const sourceType = typeCache.current.get(sourceId) || 'text';
        const id = generateMemoId(new Date());
        const newMemo: MemoData = {
            id,
            content,
            createdAt: parseMemoId(id),
            type: sourceType
        };

        const fileContent = sourceType === 'tasklist' ? TASKLIST_MARKER + content : content;
        const success = await storage.writeText(getMemoPath(id), fileContent);
        if (success) {
            contentCache.current.set(id, content);
            typeCache.current.set(id, sourceType);
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
            const type = typeCache.current.get(id) || 'text';
            const fileContent = type === 'tasklist' ? TASKLIST_MARKER + content : content;
            await storage.writeText(getMemoPath(id), fileContent);
            delete saveTimeoutRef.current[id];
        }, 500);
    }, []);

    const deleteMemoFile = useCallback(async (id: string) => {
        const success = await storage.remove(getMemoPath(id));
        if (success) {
            contentCache.current.delete(id);
            typeCache.current.delete(id);
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
