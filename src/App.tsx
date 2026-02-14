import { useState, useRef, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Memo } from './components/Memo';
import { FAB } from './components/FAB';
import { useMemos } from './hooks/useMemos';

const BOARDS = ['Personal', 'Work', 'Ideas', 'Travel'];

function App() {
  const [activeBoard, setActiveBoard] = useState('Personal');
  const bottomRef = useRef<HTMLDivElement>(null);
  const { memos, lastCreatedId, addMemo, updateMemo, deleteMemo } = useMemos();

  useEffect(() => {
    if (lastCreatedId) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [memos, lastCreatedId]);

  return (
    <div className="flex h-screen bg-theme-bg overflow-hidden text-theme-fg font-sans selection:bg-theme-accent/30">
      {/* Sidebar */}
      <Sidebar
        boards={BOARDS}
        activeBoard={activeBoard}
        onSelectBoard={setActiveBoard}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full relative">
        <Header title={activeBoard} />

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-2xl mx-auto flex flex-col gap-6 items-stretch pb-24">
            {memos.map((memo) => (
              <Memo
                key={memo.id}
                data={memo}
                onUpdate={updateMemo}
                onDelete={deleteMemo}
                autoFocus={memo.id === lastCreatedId}
              />
            ))}
            <div ref={bottomRef} />
          </div>
        </main>

        {/* Floating Action Button */}
        <FAB onClick={addMemo} />
      </div>
    </div>
  );
}

export default App;
