import { GripHorizontal, MoreVertical, X } from 'lucide-react';
import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DND_ITEM_TYPES } from '../../constants';
import type { MemoData } from '../../types';
import { DropdownMenu } from '../Memo/DropdownMenu';

interface MemoProps {
    data: MemoData;

    onUpdate: (id: string, content: string) => void;
    onDelete: (id: string) => void;
    autoFocus?: boolean;
    isTrashNote: boolean;
    onReturnToBoard: (id: string) => void;
}

export function Memo({ data, onUpdate, onDelete, autoFocus, isTrashNote, onReturnToBoard }: MemoProps) {
    const [isFocused, setIsFocused] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: data.id, data: { type: DND_ITEM_TYPES.MEMO } });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`
            group relative flex flex-col w-full
            bg-white rounded-2xl shadow-sm border border-theme-border/50
            transition-all duration-200 ease-out
            hover:shadow-md hover:-translate-y-0.5
            ${isFocused ? 'ring-2 ring-theme-accent/20 border-theme-accent' : ''}
            ${isDragging ? 'opacity-50 shadow-lg scale-[1.02] z-50' : ''}
        `}
        >
            {/* Header / Drag Handle */}
            <div
                className="flex items-center justify-between px-3 py-2 border-b border-theme-border/30 cursor-grab active:cursor-grabbing text-theme-fg/40 hover:text-theme-fg/60 transition-colors"
                {...attributes}
                {...listeners}
            >
                <GripHorizontal className="w-4 h-4" />
                <div
                    className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity relative"
                    onPointerDown={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={() => onDelete(data.id)}
                        className="p-1 hover:bg-theme-bg-soft rounded text-theme-fg/40 hover:text-red-400"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                    <div className="relative">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-1 hover:bg-theme-bg-soft rounded text-theme-fg/40 hover:text-theme-fg/80"
                        >
                            <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                        <DropdownMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)}>
                            {isTrashNote ? (
                                <button
                                    onClick={() => {
                                        onReturnToBoard(data.id);
                                        setIsMenuOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-theme-fg hover:bg-theme-bg-soft transition-colors"
                                >
                                    ボードへ戻す
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setIsMenuOpen(false)}
                                        className="w-full text-left px-4 py-2 text-sm text-theme-fg hover:bg-theme-bg-soft transition-colors"
                                    >
                                        エクスポート
                                    </button>
                                    <button
                                        onClick={() => setIsMenuOpen(false)}
                                        className="w-full text-left px-4 py-2 text-sm text-theme-fg hover:bg-theme-bg-soft transition-colors"
                                    >
                                        複製する
                                    </button>
                                    <button
                                        onClick={() => setIsMenuOpen(false)}
                                        className="w-full text-left px-4 py-2 text-sm text-theme-fg hover:bg-theme-bg-soft transition-colors"
                                    >
                                        タスクに変換
                                    </button>
                                </>
                            )}
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-0">
                <textarea
                    value={data.content}
                    onChange={(e) => onUpdate(data.id, e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="Take a note..."
                    autoFocus={autoFocus}
                    className="w-full min-h-[120px] p-4 bg-transparent resize-none focus:outline-none text-theme-fg placeholder:text-theme-fg/30 text-base leading-relaxed textarea-autosize rounded-b-2xl"
                />
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-theme-border/30 text-[10px] font-medium text-theme-fg/30 uppercase tracking-wider flex justify-end">
                {data.createdAt}
            </div>
        </div>
    );
}
