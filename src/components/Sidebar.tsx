import { Book, Plus, Settings, Trash2 } from 'lucide-react';
import type { Note } from '../types';

interface SidebarProps {
    notes: Note[];
    activeNoteId: string;
    onSelectNote: (noteId: string) => void;
    onAddNote: (title: string) => void;
}

import { useState } from 'react';

export function Sidebar({ notes, activeNoteId, onSelectNote, onAddNote }: SidebarProps) {
    const [isCreating, setIsCreating] = useState(false);
    const [newNoteTitle, setNewNoteTitle] = useState('');

    const handleStartCreating = () => {
        setIsCreating(true);
        setNewNoteTitle('');
    };

    const handleCancelCreating = () => {
        setIsCreating(false);
        setNewNoteTitle('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && newNoteTitle.trim()) {
            onAddNote(newNoteTitle.trim());
            handleCancelCreating();
        } else if (e.key === 'Escape') {
            handleCancelCreating();
        }
    };

    const handleDefaultClick = () => {
        onSelectNote('board');
    };

    return (
        <aside className="w-64 bg-theme-bg-soft h-full flex flex-col border-r border-theme-border flex-shrink-0">
            <div className="p-6">
                <button
                    onClick={handleDefaultClick}
                    className={`text-2xl font-bold tracking-tight flex items-center gap-2 hover:opacity-80 transition-opacity ${activeNoteId === 'board' ? 'text-theme-accent' : 'text-theme-fg'}`}
                    title="Go to Board"
                >
                    <Book className="w-6 h-6" />
                    <span>i-my-memo</span>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 space-y-1">
                <div className="text-xs font-semibold text-theme-fg/60 uppercase tracking-wider mb-2 px-2">
                    Notes
                </div>
                {notes
                    .filter(note => note.id !== 'board' && note.id !== 'trash')
                    .map((note) => (
                        <button
                            key={note.id}
                            onClick={() => onSelectNote(note.id)}
                            className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-3 ${activeNoteId === note.id
                                ? 'bg-theme-secondary/30 text-theme-fg font-medium'
                                : 'text-theme-fg/80 hover:bg-theme-secondary/10 hover:text-theme-fg'
                                }`}
                        >
                            <span className="w-2 h-2 rounded-full bg-theme-accent opacity-70"></span>
                            {note.title}
                        </button>
                    ))}

                <button
                    onClick={handleStartCreating}
                    className="w-full text-left px-3 py-2 rounded-lg text-theme-fg/60 hover:text-theme-accent hover:bg-theme-secondary/10 transition-colors flex items-center gap-3 mt-2"
                    title="Create new note"
                >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm">New Note</span>
                </button>

                {isCreating && (
                    <div className="px-3 py-2">
                        <input
                            autoFocus
                            type="text"
                            value={newNoteTitle}
                            onChange={(e) => setNewNoteTitle(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onBlur={handleCancelCreating}
                            placeholder="Note title..."
                            className="w-full bg-theme-bg border border-theme-border rounded px-2 py-1 text-sm text-theme-fg focus:outline-none focus:border-theme-accent"
                        />
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-theme-border space-y-1">
                <button
                    onClick={() => onSelectNote('trash')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-3 ${activeNoteId === 'trash'
                        ? 'bg-theme-secondary/30 text-theme-fg font-medium'
                        : 'text-theme-fg/60 hover:text-theme-fg hover:bg-theme-secondary/10'
                        }`}
                >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-sm">Trash</span>
                </button>
                <button className="flex items-center gap-2 text-sm text-theme-fg/60 hover:text-theme-fg transition-colors w-full px-3 py-2 rounded-lg hover:bg-theme-secondary/10">
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                </button>
            </div>
        </aside>
    );
}
