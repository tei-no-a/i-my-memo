import { useRef, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Memo } from './components/Memo';
import { FAB } from './components/FAB';
import { useMemos } from './hooks/useMemos';
import { useNotes } from './hooks/useNotes';
import type { MemoData } from './types';

function App() {
  const { notes, activeNoteId, setActiveNoteId, activeNote, addMemoToNote } = useNotes();
  const bottomRef = useRef<HTMLDivElement>(null);
  const { memos, lastCreatedId, addMemo: createMemoFile, updateMemo, deleteMemo } = useMemos();

  // Filter memos belonging to the active note and preserve order
  const displayedMemos = useMemo(() => {
    const memoMap = new Map(memos.map(m => [m.id, m]));
    return activeNote.memoIds
      .map(id => memoMap.get(id))
      .filter((m): m is MemoData => m !== undefined);
  }, [memos, activeNote]);

  const handleAddMemo = async () => {
    try {
      const newMemo = await createMemoFile();
      if (newMemo) {
        await addMemoToNote(activeNoteId, newMemo.id);
      }
    } catch (error) {
      console.error("Failed to add memo", error);
    }
  };

  useEffect(() => {
    if (lastCreatedId && activeNote.memoIds.includes(lastCreatedId)) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [memos, lastCreatedId, activeNote]);

  return (
    <div className="flex h-screen bg-theme-bg overflow-hidden text-theme-fg font-sans selection:bg-theme-accent/30">
      {/* Sidebar */}
      <Sidebar
        notes={notes}
        activeNoteId={activeNoteId}
        onSelectNote={setActiveNoteId}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full relative">
        <Header title={activeNote.title} />

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-2xl mx-auto flex flex-col gap-6 items-stretch pb-24">
            {displayedMemos.length === 0 ? (
              <div className="text-center text-theme-fg/40 mt-20">
                <p>No memos in this note.</p>
              </div>
            ) : (
              displayedMemos.map((memo) => (
                <Memo
                  key={memo.id}
                  data={memo}
                  onUpdate={updateMemo}
                  onDelete={deleteMemo}
                  autoFocus={memo.id === lastCreatedId}
                />
              ))
            )}
            <div ref={bottomRef} />
          </div>
        </main>

        {/* Floating Action Button */}
        <FAB onClick={handleAddMemo} />
      </div>
    </div>
  );
}

export default App;
