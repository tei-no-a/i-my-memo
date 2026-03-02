import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Memo } from './Memo';
import type { MemoData } from '../../types';

interface MemoListProps {
    memos: MemoData[];
    activeNoteMemoIds: string[];
    lastCreatedId: string | null;
    bottomRef: React.RefObject<HTMLDivElement | null>;
    onUpdateMemo: (id: string, content: string) => void;
    onDuplicateMemo: (id: string) => void;
    onDeleteMemo: (id: string) => void;
    onExportMemo: (id: string) => void;
    isTrashNote: boolean;
    onReturnToBoard: (id: string) => void;
    onMemoFocus?: (id: string) => void;
    onMemoBlur?: () => void;
}

export function MemoList({ memos, activeNoteMemoIds, lastCreatedId, bottomRef, onUpdateMemo, onDuplicateMemo, onDeleteMemo, onExportMemo, isTrashNote, onReturnToBoard, onMemoFocus, onMemoBlur }: MemoListProps) {
    if (memos.length === 0) {
        return (
            <div className="text-center text-theme-fg/40 mt-20">
                <p>No memos in this note.</p>
            </div>
        );
    }

    return (
        <SortableContext
            items={activeNoteMemoIds}
            strategy={verticalListSortingStrategy}
        >
            {memos.map((memo) => (
                <Memo
                    key={memo.id}
                    data={memo}
                    onUpdate={onUpdateMemo}
                    onDuplicate={onDuplicateMemo}
                    onDelete={onDeleteMemo}
                    onExport={onExportMemo}
                    autoFocus={memo.id === lastCreatedId}
                    isTrashNote={isTrashNote}
                    onReturnToBoard={onReturnToBoard}
                    onMemoFocus={onMemoFocus}
                    onMemoBlur={onMemoBlur}
                />
            ))}
            <div ref={bottomRef} />
        </SortableContext>
    );
}
