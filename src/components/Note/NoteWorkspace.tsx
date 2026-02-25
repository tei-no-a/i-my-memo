import { useRef, useEffect } from 'react';
import { Header } from '../Layout/Header';
import { CategoryBar } from '../Category/CategoryBar';
import { MemoList } from '../Memo/MemoList';
import { FAB } from '../Layout/FAB';
import { useCategorySorter } from '../../hooks/useCategorySorter';
import type { Note, Category, MemoData } from '../../types';

interface NoteWorkspaceProps {
    activeNote: Note;
    isSpecialNote: boolean;
    categories: Category[];
    memos: MemoData[];
    lastCreatedId: string | null;
    onDeleteNote: () => void;
    onRenameNote: (newTitle: string) => void;
    onToggleCategory: (categoryId: string) => void;
    onCreateMemo: () => void;
    onUpdateMemo: (id: string, content: string) => void;
    onDuplicateMemo: (id: string) => void;
    onDeleteMemo: (id: string) => void;
    isTrashNote: boolean;
    onReturnToBoard: (id: string) => void;
    onEmptyTrash: () => void;
}

export function NoteWorkspace({
    activeNote,
    isSpecialNote,
    categories,
    memos,
    lastCreatedId,
    onDeleteNote,
    onRenameNote,
    onToggleCategory,
    onCreateMemo,
    onUpdateMemo,
    onDuplicateMemo,
    onDeleteMemo,
    isTrashNote,
    onReturnToBoard,
    onEmptyTrash
}: NoteWorkspaceProps) {
    const bottomRef = useRef<HTMLDivElement>(null);
    const scrolledMemoIdRef = useRef<string | null>(null);

    // 今後、エイリアスの出現回数に応じたソートをここで実行します
    const sortedCategories = useCategorySorter(categories, memos);

    useEffect(() => {
        if (
            lastCreatedId &&
            scrolledMemoIdRef.current !== lastCreatedId &&
            activeNote.memoIds.includes(lastCreatedId)
        ) {
            const el = document.getElementById(`memo-${lastCreatedId}`);
            el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            scrolledMemoIdRef.current = lastCreatedId;
        }
    }, [memos, lastCreatedId, activeNote]);

    return (
        <div className="flex-1 flex flex-col h-full relative">
            <Header
                title={activeNote.title}
                canDelete={!isSpecialNote}
                canRename={!isSpecialNote}
                onDeleteNote={onDeleteNote}
                onRenameNote={onRenameNote}
                isTrashNote={isTrashNote}
                onEmptyTrash={onEmptyTrash}
            />

            {!isSpecialNote && (
                <CategoryBar
                    categories={sortedCategories}
                    activeCategoryIds={activeNote.categories || []}
                    onToggle={onToggleCategory}
                />
            )}

            <main className="flex-1 overflow-y-auto p-6 md:p-8">
                <div className="max-w-2xl mx-auto flex flex-col gap-6 items-stretch pb-24">
                    <MemoList
                        memos={memos}
                        activeNoteMemoIds={activeNote.memoIds}
                        lastCreatedId={lastCreatedId}
                        bottomRef={bottomRef}
                        onUpdateMemo={onUpdateMemo}
                        onDuplicateMemo={onDuplicateMemo}
                        onDeleteMemo={onDeleteMemo}
                        isTrashNote={isTrashNote}
                        onReturnToBoard={onReturnToBoard}
                    />
                </div>
            </main>

            <FAB onClick={onCreateMemo} />
        </div>
    );
}
