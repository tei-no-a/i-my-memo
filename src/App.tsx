import { useState, useRef, useEffect } from 'react';
import { loadMemos, saveMemo, deleteMemo, type MemoData } from './utils/fileStorage';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Memo } from './components/Memo';
import { FAB } from './components/FAB';

const BOARDS = ['Personal', 'Work', 'Ideas', 'Travel'];

function App() {
  const [activeBoard, setActiveBoard] = useState('Personal');
  const [memos, setMemos] = useState<MemoData[]>([]);
  const [lastCreatedId, setLastCreatedId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMemos().then(setMemos).catch(console.error);
  }, []);

  useEffect(() => {
    if (lastCreatedId) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [memos, lastCreatedId]);

  const saveTimeoutRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const handleUpdateMemo = (id: string, content: string) => {
    // Optimistic update for immediate UI response (fixes IME issues)
    setMemos(prev => prev.map(memo => memo.id === id ? { ...memo, content } : memo));

    // Debounce the file save
    if (saveTimeoutRef.current[id]) {
      clearTimeout(saveTimeoutRef.current[id]);
    }

    saveTimeoutRef.current[id] = setTimeout(() => {
      saveMemo(content, id).catch(console.error);
      delete saveTimeoutRef.current[id];
    }, 500);
  };

  const handleDeleteMemo = async (id: string) => {
    await deleteMemo(id);
    setMemos(memos.filter(memo => memo.id !== id));
  };

  const handleAddMemo = async () => {
    try {
      const newMemo = await saveMemo('');
      setMemos(prev => [...prev, newMemo]);
      setLastCreatedId(newMemo.id);
    } catch (error) {
      console.error('Failed to create memo:', error);
      alert('Failed to create memo. See console for details.');
    }
  };

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
                onUpdate={handleUpdateMemo}
                onDelete={handleDeleteMemo}
                autoFocus={memo.id === lastCreatedId}
              />
            ))}
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
