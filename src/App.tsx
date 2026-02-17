import { useRef, useEffect } from 'react';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Memo } from './components/Memo';
import { FAB } from './components/FAB';
import { useWorkspace } from './hooks/useWorkspace';
import { useDragAndDrop } from './hooks/useDragAndDrop';

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

  const {
    activeDragMemo,
    collisionDetection,
    onDragStart,
    onDragEnd,
    onDragCancel,
  } = useDragAndDrop({ memos, activeNote, activeNoteId, reorderMemos, moveMemoToNote });

  const { deleteNote } = useWorkspace();

  const isSpecialNote = activeNoteId === 'board' || activeNoteId === 'trash';

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (lastCreatedId && activeNote.memoIds.includes(lastCreatedId)) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [memos, lastCreatedId, activeNote]);

  console.log('[App] Render. activeNoteId:', activeNoteId, 'notes count:', notes.length, 'note IDs:', notes.map(n => n.id));

  return (
    <DndContext
      collisionDetection={collisionDetection}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
    >
      <div className="flex h-screen bg-theme-bg overflow-hidden text-theme-fg font-sans selection:bg-theme-accent/30">
        <Sidebar
          notes={notes}
          activeNoteId={activeNoteId}
          onSelectNote={selectNote}
          onAddNote={addNote}
        />

        <div className="flex-1 flex flex-col h-full relative">
          <Header
            title={activeNote.title}
            canDelete={!isSpecialNote}
            onDeleteNote={() => deleteNote(activeNoteId)}
          />

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

          <FAB onClick={createMemo} />
        </div>
      </div>

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
