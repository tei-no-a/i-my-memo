import { useState, useRef, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Memo } from './components/Memo';
import { FAB } from './components/FAB';

// Dummy data for initial visualization
const INITIAL_MEMOS = [
  { id: '1', content: 'Design system meeting at 3 PM\n- Review color palette\n- Discuss typography', createdAt: '2023-10-27 10:30' },
  { id: '2', content: 'Groceries:\n- Milk\n- Eggs\n- Bread\n- Coffee beans', createdAt: '2023-10-28 09:15' },
  { id: '3', content: 'Project ideas:\n1. Personal finance tracker\n2. Recipe organizer\n3. Workout log', createdAt: '2023-10-29 14:00' },
];

const BOARDS = ['Personal', 'Work', 'Ideas', 'Travel'];

function App() {
  const [activeBoard, setActiveBoard] = useState('Personal');
  const [memos, setMemos] = useState(INITIAL_MEMOS);
  const [lastCreatedId, setLastCreatedId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (lastCreatedId) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [memos, lastCreatedId]);

  const handleUpdateMemo = (id: string, content: string) => {
    setMemos(memos.map(memo => memo.id === id ? { ...memo, content } : memo));
  };

  const handleDeleteMemo = (id: string) => {
    setMemos(memos.filter(memo => memo.id !== id));
  };

  const handleAddMemo = () => {
    const newId = Date.now().toString();
    const newMemo = {
      id: newId,
      content: '',
      createdAt: new Date().toLocaleString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
    };
    setMemos([...memos, newMemo]);
    setLastCreatedId(newId);
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
