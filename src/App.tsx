import { useRef, useEffect } from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Memo } from './components/Memo';
import { FAB } from './components/FAB';
import { useWorkspace } from './hooks/useWorkspace';

function App() {
  const {
    notes,
    activeNote,
    activeNoteId,
    selectNote,
    addNote,
    memos,
    lastCreatedId,
    createMemo,
    updateMemo,
    deleteMemo,
    reorderMemos
  } = useWorkspace();

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (lastCreatedId && activeNote.memoIds.includes(lastCreatedId)) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [memos, lastCreatedId, activeNote]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = activeNote.memoIds.indexOf(active.id as string);
      const newIndex = activeNote.memoIds.indexOf(over.id as string);
      const newMemoIds = arrayMove(activeNote.memoIds, oldIndex, newIndex);
      reorderMemos(activeNoteId, newMemoIds);
    }
  };

  return (
    <div className="flex h-screen bg-theme-bg overflow-hidden text-theme-fg font-sans selection:bg-theme-accent/30">
      {/* Sidebar */}
      <Sidebar
        notes={notes}
        activeNoteId={activeNoteId}
        onSelectNote={selectNote}
        onAddNote={addNote}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full relative">
        <Header title={activeNote.title} />

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-2xl mx-auto flex flex-col gap-6 items-stretch pb-24">
            {memos.length === 0 ? (
              <div className="text-center text-theme-fg/40 mt-20">
                <p>No memos in this note.</p>
              </div>
            ) : (
              <DndContext
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={activeNote.memoIds}
                  strategy={verticalListSortingStrategy}
                >
                  {memos.map((memo) => (
                    <Memo
                      key={memo.id}
                      data={memo}
                      onUpdate={updateMemo}
                      onDelete={deleteMemo}
                      autoFocus={memo.id === lastCreatedId}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            )}
            <div ref={bottomRef} />
          </div>
        </main>

        {/* Floating Action Button */}
        <FAB onClick={createMemo} />
      </div>
    </div>
  );
}

export default App;
