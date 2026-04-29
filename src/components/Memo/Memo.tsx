import { GripHorizontal, MoreVertical, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DND_ITEM_TYPES } from '../../constants';
import type { MemoData } from '../../types';
import { DropdownMenu } from '../ui/DropdownMenu';
import { TaskListContent } from './TaskListContent';

interface MemoProps {
    data: MemoData;

    onUpdate: (id: string, content: string) => void;
    onSwitchType: (id: string) => void;
    onDuplicate: (id: string) => void;
    onDelete: (id: string) => void;
    onExport: (id: string) => void;
    autoFocus?: boolean;
    isTrashNote: boolean;
    onReturnToBoard: (id: string) => void;
    onMemoFocus?: (id: string) => void;
    onMemoBlur?: () => void;
}

const MENU_BUTTON_CLASS = 'w-full text-left px-4 py-2 text-sm text-theme-fg hover:bg-theme-bg-soft transition-colors';

export function Memo({ data, onUpdate, onSwitchType, onDuplicate, onDelete, onExport, autoFocus, isTrashNote, onReturnToBoard, onMemoFocus, onMemoBlur }: MemoProps) {
    const [isFocused, setIsFocused] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (autoFocus && textareaRef.current) {
            textareaRef.current.focus({ preventScroll: true });
        }
    }, [autoFocus]);

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
            id={`memo-${data.id}`}
            ref={setNodeRef}
            style={style}
            className={`
            group relative flex flex-col w-full
            bg-theme-card rounded-2xl shadow-sm border border-theme-border/50
            transition-all duration-200 ease-out
            hover:shadow-md
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
                                    className={MENU_BUTTON_CLASS}
                                >
                                    ボードへ戻す
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={() => {
                                            onExport(data.id);
                                            setIsMenuOpen(false);
                                        }}
                                        className={MENU_BUTTON_CLASS}
                                    >
                                        エクスポート
                                    </button>
                                    <button
                                        onClick={() => {
                                            onDuplicate(data.id);
                                            setIsMenuOpen(false);
                                        }}
                                        className={MENU_BUTTON_CLASS}
                                    >
                                        複製する
                                    </button>
                                    <button
                                        onClick={() => {
                                            onSwitchType(data.id);
                                            setIsMenuOpen(false);
                                        }}
                                        className={MENU_BUTTON_CLASS}
                                    >
                                        メモタイプ切り替え
                                    </button>
                                </>
                            )}
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            {/* Content */}
            {data.type === 'tasklist' ? (
                <TaskListContent
                    content={data.content}
                    onChange={(newContent) => onUpdate(data.id, newContent)}
                    autoFocus={autoFocus}
                    onFocus={() => {
                        setIsFocused(true);
                        onMemoFocus?.(data.id);
                    }}
                    onBlur={() => {
                        setIsFocused(false);
                        onMemoBlur?.();
                    }}
                />
            ) : (
                <textarea
                    ref={textareaRef}
                    value={data.content}
                    onChange={(e) => onUpdate(data.id, e.target.value)}
                    onFocus={() => {
                        setIsFocused(true);
                        onMemoFocus?.(data.id);
                    }}
                    onBlur={() => {
                        setIsFocused(false);
                        onMemoBlur?.();
                    }}
                    placeholder="Take a memo..."
                    className="w-full min-h-[120px] p-4 bg-transparent resize-none focus:outline-none text-theme-fg placeholder:text-theme-fg/30 text-[18px] leading-relaxed textarea-autosize rounded-b-2xl"
                />
            )}

            {/* Footer */}
            <div className="px-4 py-2 border-t border-theme-border/30 text-[10px] font-medium text-theme-fg/30 uppercase tracking-wider flex justify-end">
                {data.createdAt}
            </div>
        </div>
    );
}
