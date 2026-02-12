import { Book, Plus, Settings } from 'lucide-react';

interface SidebarProps {
    boards: string[];
    activeBoard: string;
    onSelectBoard: (board: string) => void;
}

export function Sidebar({ boards, activeBoard, onSelectBoard }: SidebarProps) {
    return (
        <aside className="w-64 bg-theme-bg-soft h-full flex flex-col border-r border-theme-border flex-shrink-0">
            <div className="p-6">
                <button
                    onClick={() => onSelectBoard('Main')}
                    className="text-2xl font-bold text-theme-fg tracking-tight flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                    <Book className="w-6 h-6 text-theme-accent" />
                    <span>i-my-memo</span>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 space-y-1">
                <div className="text-xs font-semibold text-theme-fg/60 uppercase tracking-wider mb-2 px-2">
                    Notes
                </div>
                {boards.map((board) => (
                    <button
                        key={board}
                        onClick={() => onSelectBoard(board)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-3 ${activeBoard === board
                            ? 'bg-theme-secondary/30 text-theme-fg font-medium'
                            : 'text-theme-fg/80 hover:bg-theme-secondary/10 hover:text-theme-fg'
                            }`}
                    >
                        <span className="w-2 h-2 rounded-full bg-theme-accent opacity-70"></span>
                        {board}
                    </button>
                ))}

                <button className="w-full text-left px-3 py-2 rounded-lg text-theme-fg/60 hover:text-theme-accent hover:bg-theme-secondary/10 transition-colors flex items-center gap-3 mt-2">
                    <Plus className="w-4 h-4" />
                    <span className="text-sm">New Note</span>
                </button>
            </div>

            <div className="p-4 border-t border-theme-border">
                <button className="flex items-center gap-2 text-sm text-theme-fg/60 hover:text-theme-fg transition-colors">
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                </button>
            </div>
        </aside>
    );
}
