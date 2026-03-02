import { useRef, useEffect, useMemo } from 'react';
import { Header } from '../Layout/Header';
import { CategoryBar } from '../Category/CategoryBar';
import { MemoList } from '../Memo/MemoList';
import { FAB } from '../Layout/FAB';
import { useCategorySorter } from '../../hooks/useCategorySorter';
import { useTypewriterScroll } from '../../hooks/useTypewriterScroll';
import type { Note, Category, MemoData } from '../../types';

interface NoteWorkspaceProps {
    activeNote: Note;
    isSpecialNote: boolean;
    categories: Category[];
    memos: MemoData[];
    isLoadingMemos: boolean;
    lastCreatedId: string | null;
    onDeleteNote: () => void;
    onRenameNote: (newTitle: string) => void;
    onToggleCategory: (categoryId: string) => void;
    onCreateMemo: () => void;
    onUpdateMemo: (id: string, content: string) => void;
    onDuplicateMemo: (id: string) => void;
    onDeleteMemo: (id: string) => void;
    onExportMemo: (id: string) => void;
    isTrashNote: boolean;
    onReturnToBoard: (id: string) => void;
    onEmptyTrash: () => void;
    onExportNote: () => void;
}

export function NoteWorkspace({
    activeNote,
    isSpecialNote,
    categories,
    memos,
    isLoadingMemos,
    lastCreatedId,
    onDeleteNote,
    onRenameNote,
    onToggleCategory,
    onCreateMemo,
    onUpdateMemo,
    onDuplicateMemo,
    onDeleteMemo,
    onExportMemo,
    isTrashNote,
    onReturnToBoard,
    onEmptyTrash,
    onExportNote
}: NoteWorkspaceProps) {
    const bottomRef = useRef<HTMLDivElement>(null);
    const scrolledMemoIdRef = useRef<string | null>(null);
    const scrollContainerRef = useRef<HTMLElement>(null);

    const sortedCategoriesWithScore = useCategorySorter(categories, memos, activeNote.title);

    const { focusedMemoId, handleMemoFocus, handleMemoBlur } = useTypewriterScroll(scrollContainerRef);

    const sortedCategories = useMemo(
        () => sortedCategoriesWithScore.map(item => item.category),
        [sortedCategoriesWithScore]
    );

    const zeroScoreCategoryIds = useMemo(
        () => new Set(
            sortedCategoriesWithScore
                .filter(item => item.score === 0)
                .map(item => item.category.id.toString())
        ),
        [sortedCategoriesWithScore]
    );

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
        <div className="flex-1 flex flex-col h-full relative min-w-0">
            <Header
                title={activeNote.title}
                canDelete={!isSpecialNote}
                canRename={!isSpecialNote}
                onDeleteNote={onDeleteNote}
                onRenameNote={onRenameNote}
                isTrashNote={isTrashNote}
                onEmptyTrash={onEmptyTrash}
                onExportNote={onExportNote}
            />

            {!isSpecialNote && (
                <CategoryBar
                    categories={sortedCategories}
                    activeCategoryIds={activeNote.categories || []}
                    zeroScoreCategoryIds={zeroScoreCategoryIds}
                    onToggle={onToggleCategory}
                />
            )}

            <main ref={scrollContainerRef} className="flex-1 overflow-y-auto scrollbar-hide p-6 md:p-8">
                <div
                    className="max-w-2xl mx-auto flex flex-col gap-6 items-stretch transition-[padding] duration-300 ease-out"
                    style={{ paddingBottom: focusedMemoId ? '60vh' : '6rem' }}
                >
                    {isLoadingMemos ? (
                        <div className="flex flex-col gap-6 mt-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="bg-theme-card rounded-2xl shadow-sm border border-theme-border/50 p-4 animate-pulse">
                                    <div className="h-3 bg-theme-fg/10 rounded w-3/4 mb-3" />
                                    <div className="h-3 bg-theme-fg/10 rounded w-1/2" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <MemoList
                            memos={memos}
                            activeNoteMemoIds={activeNote.memoIds}
                            lastCreatedId={lastCreatedId}
                            bottomRef={bottomRef}
                            onUpdateMemo={onUpdateMemo}
                            onDuplicateMemo={onDuplicateMemo}
                            onDeleteMemo={onDeleteMemo}
                            onExportMemo={onExportMemo}
                            isTrashNote={isTrashNote}
                            onReturnToBoard={onReturnToBoard}
                            onMemoFocus={handleMemoFocus}
                            onMemoBlur={handleMemoBlur}
                        />
                    )}
                </div>
            </main>

            <FAB onClick={onCreateMemo} />
        </div>
    );
}
