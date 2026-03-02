import { useDroppable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { DND_PREFIX, DND_ITEM_TYPES } from '../../constants';
import type { Note } from '../../types';

interface SortableNoteItemProps {
    note: Note;
    isActive: boolean;
    onSelect: () => void;
}

export function SortableNoteItem({ note, isActive, onSelect }: SortableNoteItemProps) {
    // Sortable: ノート並べ替え用（ドラッグハンドルはマーカー部分に限定）
    const {
        attributes,
        listeners,
        setNodeRef: setSortableRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: `${DND_PREFIX.SORTABLE_NOTE}${note.id}`,
        data: { type: DND_ITEM_TYPES.SORTABLE_NOTE, noteId: note.id },
    });

    // Droppable: メモのドロップ先（既存機能を維持）
    const { setNodeRef: setDroppableRef, isOver } = useDroppable({
        id: `${DND_PREFIX.NOTE}${note.id}`,
        data: { type: DND_ITEM_TYPES.NOTE, noteId: note.id },
        disabled: isActive,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={(node) => {
                setSortableRef(node);
                setDroppableRef(node);
            }}
            style={style}
            className={`${isDragging ? 'opacity-50 z-50' : ''}`}
        >
            <button
                onClick={onSelect}
                className={`w-full text-left px-2 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-2
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
                {/* ドラッグハンドル（マーカー部分） */}
                <span
                    className="flex-shrink-0 group/handle cursor-grab active:cursor-grabbing"
                    {...attributes}
                    {...listeners}
                >
                    {/* 通常時: 丸マーカー / ホバー時: グリップアイコン */}
                    <span className={`w-2 h-2 rounded-full transition-colors duration-200 block group-hover/handle:hidden ${isOver && !isActive ? 'bg-theme-accent' : 'bg-theme-accent opacity-70'}`}></span>
                    <GripVertical className="w-3.5 h-3.5 text-theme-fg/40 hidden group-hover/handle:block" />
                </span>
                <span className="text-xs truncate">{note.title}</span>
            </button>
        </div>
    );
}
