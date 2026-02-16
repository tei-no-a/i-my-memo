import { useState, useCallback } from 'react';
import { pointerWithin, closestCenter } from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent, CollisionDetection } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { DND_PREFIX } from '../constants';
import type { MemoData, Note } from '../types';

interface UseDragAndDropOptions {
    memos: MemoData[];
    activeNote: Note;
    activeNoteId: string;
    reorderMemos: (noteId: string, newMemoIds: string[]) => void;
    moveMemoToNote: (memoId: string, targetNoteId: string) => void;
}

/**
 * Custom collision detection strategy:
 * Sidebar note droppables (detected via pointerWithin) take priority.
 * If the pointer is not over a sidebar note, fall back to closestCenter
 * for sortable reorder within the memo list.
 */
const collisionDetection: CollisionDetection = (args) => {
    const pointerCollisions = pointerWithin(args);
    const noteCollision = pointerCollisions.find(c =>
        typeof c.id === 'string' && c.id.startsWith(DND_PREFIX.NOTE)
    );
    if (noteCollision) {
        return [noteCollision];
    }
    return closestCenter(args);
};

export function useDragAndDrop({
    memos,
    activeNote,
    activeNoteId,
    reorderMemos,
    moveMemoToNote,
}: UseDragAndDropOptions) {
    const [activeDragMemo, setActiveDragMemo] = useState<MemoData | null>(null);

    const handleDragStart = useCallback((event: DragStartEvent) => {
        const draggedMemo = memos.find(m => m.id === event.active.id);
        setActiveDragMemo(draggedMemo || null);
    }, [memos]);

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        setActiveDragMemo(null);
        const { active, over } = event;
        if (!over) return;

        const overId = over.id as string;

        // Dropped on a sidebar note → move memo to that note
        if (overId.startsWith(DND_PREFIX.NOTE)) {
            const targetNoteId = overId.slice(DND_PREFIX.NOTE.length);
            if (targetNoteId !== activeNoteId) {
                moveMemoToNote(active.id as string, targetNoteId);
            }
            return;
        }

        // Dropped on another memo → reorder within the same note
        if (active.id !== over.id) {
            const oldIndex = activeNote.memoIds.indexOf(active.id as string);
            const newIndex = activeNote.memoIds.indexOf(over.id as string);
            if (oldIndex !== -1 && newIndex !== -1) {
                const newMemoIds = arrayMove(activeNote.memoIds, oldIndex, newIndex);
                reorderMemos(activeNoteId, newMemoIds);
            }
        }
    }, [activeNote.memoIds, activeNoteId, reorderMemos, moveMemoToNote]);

    const handleDragCancel = useCallback(() => {
        setActiveDragMemo(null);
    }, []);

    return {
        activeDragMemo,
        collisionDetection,
        onDragStart: handleDragStart,
        onDragEnd: handleDragEnd,
        onDragCancel: handleDragCancel,
    };
}
