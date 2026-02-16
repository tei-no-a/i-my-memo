import { useRef, useEffect, useState } from 'react';
import { DndContext, pointerWithin, closestCenter, DragOverlay } from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent, CollisionDetection } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Memo } from './components/Memo';
import { FAB } from './components/FAB';
import { useWorkspace } from './hooks/useWorkspace';
import type { MemoData } from './types';

// Custom collision detection: prioritize sidebar note droppables (pointerWithin),
// then fall back to closestCenter for sortable reorder within the memo list.
const customCollisionDetection: CollisionDetection = (args) => {
  // First check pointer-within collisions (good for sidebar droppables)
  const pointerCollisions = pointerWithin(args);
  // If pointer is within a note droppable, use that
  const noteCollision = pointerCollisions.find(c =>
    typeof c.id === 'string' && c.id.startsWith('note:')
  );
  if (noteCollision) {
    return [noteCollision];
  }
  // Otherwise fall back to closestCenter for sortable items
  return closestCenter(args);
};

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
    reorderMemos,
    moveMemoToNote
  } = useWorkspace();

  const bottomRef = useRef<HTMLDivElement>(null);
  const [activeDragMemo, setActiveDragMemo] = useState<MemoData | null>(null);

  useEffect(() => {
    if (lastCreatedId && activeNote.memoIds.includes(lastCreatedId)) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [memos, lastCreatedId, activeNote]);

  const handleDragStart = (event: DragStartEvent) => {
    const draggedMemo = memos.find(m => m.id === event.active.id);
    setActiveDragMemo(draggedMemo || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragMemo(null);
    const { active, over } = event;
    if (!over) return;

    const overId = over.id as string;

    // Check if dropped on a sidebar note (prefixed with "note:")
    if (overId.startsWith('note:')) {
      const targetNoteId = overId.replace('note:', '');
      if (targetNoteId !== activeNoteId) {
        moveMemoToNote(active.id as string, targetNoteId);
      }
      return;
    }

    // Otherwise, handle sortable reorder within the same note
    if (active.id !== over.id) {
      const oldIndex = activeNote.memoIds.indexOf(active.id as string);
      const newIndex = activeNote.memoIds.indexOf(over.id as string);
      if (oldIndex !== -1 && newIndex !== -1) {
        const newMemoIds = arrayMove(activeNote.memoIds, oldIndex, newIndex);
        reorderMemos(activeNoteId, newMemoIds);
      }
    }
  };

  const handleDragCancel = () => {
    setActiveDragMemo(null);
  };

  return (
    <DndContext
      collisionDetection={customCollisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
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
              )}
              <div ref={bottomRef} />
            </div>
          </main>

          {/* Floating Action Button */}
          <FAB onClick={createMemo} />
        </div>
      </div>

      {/* Drag Overlay - shows a preview of the memo being dragged */}
      <DragOverlay dropAnimation={null}>
        {activeDragMemo ? (
          <div className="w-80 bg-white rounded-2xl shadow-xl border border-theme-accent/30 opacity-80 p-4 text-sm text-theme-fg truncate pointer-events-none">
            {activeDragMemo.content || 'Empty memo'}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export default App;

