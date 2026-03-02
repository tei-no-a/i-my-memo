import { useState, useCallback, useRef } from 'react';
import { pointerWithin, closestCenter } from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent, CollisionDetection } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { DND_PREFIX, DND_ITEM_TYPES } from '../constants';
import type { MemoData, Note } from '../types';

interface UseDragAndDropOptions {
    memos: MemoData[];
    activeNote: Note;
    activeNoteId: string;
    notes: Note[];
    reorderMemos: (noteId: string, newMemoIds: string[]) => void;
    reorderNotes: (newNotes: Note[]) => void;
    moveMemoToNote: (memoId: string, targetNoteId: string) => void;
}

export function useDragAndDrop({
    memos,
    activeNote,
    activeNoteId,
    notes,
    reorderMemos,
    reorderNotes,
    moveMemoToNote,
}: UseDragAndDropOptions) {
    const [activeDragMemo, setActiveDragMemo] = useState<MemoData | null>(null);
    const [activeDragNote, setActiveDragNote] = useState<Note | null>(null);

    // ドラッグ中のアイテム種別を保持（collisionDetection内で参照）
    const dragTypeRef = useRef<string | null>(null);

    /**
     * Custom collision detection strategy:
     * - メモドラッグ中: サイドバーのノートドロップ先(pointerWithin)を優先、なければclosestCenter
     * - ノートドラッグ中: closestCenterのみ（サイドバー内の並べ替え）
     */
    const collisionDetection: CollisionDetection = useCallback((args) => {
        if (dragTypeRef.current === DND_ITEM_TYPES.SORTABLE_NOTE) {
            return closestCenter(args);
        }

        // メモドラッグ: サイドバーのノートドロップ先を優先
        const pointerCollisions = pointerWithin(args);
        const noteCollision = pointerCollisions.find(c =>
            typeof c.id === 'string' && c.id.startsWith(DND_PREFIX.NOTE)
        );
        if (noteCollision) {
            return [noteCollision];
        }
        return closestCenter(args);
    }, []);

    const handleDragStart = useCallback((event: DragStartEvent) => {
        const type = event.active.data.current?.type;
        dragTypeRef.current = type || null;

        if (type === DND_ITEM_TYPES.SORTABLE_NOTE) {
            const noteId = event.active.data.current?.noteId as string;
            const note = notes.find(n => n.id === noteId);
            setActiveDragNote(note || null);
        } else {
            const draggedMemo = memos.find(m => m.id === event.active.id);
            setActiveDragMemo(draggedMemo || null);
        }
    }, [memos, notes]);

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const type = dragTypeRef.current;
        dragTypeRef.current = null;
        setActiveDragMemo(null);
        setActiveDragNote(null);

        const { active, over } = event;
        if (!over) return;

        // --- ノートの並べ替え ---
        if (type === DND_ITEM_TYPES.SORTABLE_NOTE) {
            const overId = over.id as string;
            if (!overId.startsWith(DND_PREFIX.SORTABLE_NOTE)) return;
            if (active.id === over.id) return;

            const activeNoteId_ = (active.id as string).slice(DND_PREFIX.SORTABLE_NOTE.length);
            const overNoteId = overId.slice(DND_PREFIX.SORTABLE_NOTE.length);

            const oldIndex = notes.findIndex(n => n.id === activeNoteId_);
            const newIndex = notes.findIndex(n => n.id === overNoteId);
            if (oldIndex !== -1 && newIndex !== -1) {
                const newNotes = arrayMove(notes, oldIndex, newIndex);
                reorderNotes(newNotes);
            }
            return;
        }

        // --- メモの操作 ---
        const overId = over.id as string;

        // メモをサイドバーのノートにドロップ → ノート間移動
        if (overId.startsWith(DND_PREFIX.NOTE)) {
            const targetNoteId = overId.slice(DND_PREFIX.NOTE.length);
            if (targetNoteId !== activeNoteId) {
                moveMemoToNote(active.id as string, targetNoteId);
            }
            return;
        }

        // メモ同士の並べ替え
        if (active.id !== over.id) {
            const oldIndex = activeNote.memoIds.indexOf(active.id as string);
            const newIndex = activeNote.memoIds.indexOf(over.id as string);
            if (oldIndex !== -1 && newIndex !== -1) {
                const newMemoIds = arrayMove(activeNote.memoIds, oldIndex, newIndex);
                reorderMemos(activeNoteId, newMemoIds);
            }
        }
    }, [activeNote.memoIds, activeNoteId, notes, reorderMemos, reorderNotes, moveMemoToNote]);

    const handleDragCancel = useCallback(() => {
        dragTypeRef.current = null;
        setActiveDragMemo(null);
        setActiveDragNote(null);
    }, []);

    return {
        activeDragMemo,
        activeDragNote,
        collisionDetection,
        onDragStart: handleDragStart,
        onDragEnd: handleDragEnd,
        onDragCancel: handleDragCancel,
    };
}

