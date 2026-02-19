import { useDroppable } from '@dnd-kit/core';
import { DND_PREFIX, DND_ITEM_TYPES } from '../constants';
import type { Note } from '../types';

interface DroppableNoteItemProps {
    note: Note;
    isActive: boolean;
    onSelect: () => void;
}

export function DroppableNoteItem({ note, isActive, onSelect }: DroppableNoteItemProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: `${DND_PREFIX.NOTE}${note.id}`,
        data: { type: DND_ITEM_TYPES.NOTE, noteId: note.id },
        disabled: isActive,
    });

    return (
        <button
            ref={setNodeRef}
            onClick={onSelect}
            className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-3
                ${isActive
                    ? 'bg-theme-secondary/30 text-theme-fg font-medium'
                    : 'text-theme-fg/80 hover:bg-theme-secondary/10 hover:text-theme-fg'
                }
                ${isOver && !isActive
                    ? 'ring-2 ring-theme-accent bg-theme-accent/10 scale-[1.02]'
                    : ''
                }
            `}
        >
            <span className={`w-2 h-2 rounded-full transition-colors duration-200 ${isOver && !isActive ? 'bg-theme-accent' : 'bg-theme-accent opacity-70'}`}></span>
            {note.title}
        </button>
    );
}
