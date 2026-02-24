import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Memo } from './Memo';
import type { MemoData } from '../../types';

interface MemoListProps {
    memos: MemoData[];
    activeNoteMemoIds: string[];
    lastCreatedId: string | null;
    bottomRef: React.RefObject<HTMLDivElement | null>;
    onUpdateMemo: (id: string, content: string) => void;
    onDeleteMemo: (id: string) => void;
    isTrashNote: boolean;
    onReturnToBoard: (id: string) => void;
}

export function MemoList({ memos, activeNoteMemoIds, lastCreatedId, bottomRef, onUpdateMemo, onDeleteMemo, isTrashNote, onReturnToBoard }: MemoListProps) {
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
                    onDelete={onDeleteMemo}
                    autoFocus={memo.id === lastCreatedId}
                    isTrashNote={isTrashNote}
                    onReturnToBoard={onReturnToBoard}
                />
            ))}
            <div ref={bottomRef} />
        </SortableContext>
    );
}
