import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Book, Plus, Settings, Trash2 } from 'lucide-react';
import { DND_PREFIX, DND_ITEM_TYPES } from '../constants';
import type { Note } from '../types';

interface SidebarProps {
    notes: Note[];
    activeNoteId: string;
    onSelectNote: (noteId: string) => void;
    onAddNote: (title: string) => void;
}

function NoteInput({ onAdd, onCancel }: { onAdd: (title: string) => void, onCancel: () => void }) {
    const [title, setTitle] = useState('');

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && title.trim()) {
            onAdd(title.trim());
        } else if (e.key === 'Escape') {
            onCancel();
        }
    };

    return (
        <div className="px-3 py-2">
            <input
                autoFocus
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={onCancel}
                placeholder="Note title..."
                className="w-full bg-theme-bg border border-theme-border rounded px-2 py-1 text-sm text-theme-fg focus:outline-none focus:border-theme-accent"
            />
        </div>
    );
}

function DroppableNoteItem({
    note,
    isActive,
    onSelect,
}: {
    note: Note;
    isActive: boolean;
    onSelect: () => void;
}) {
    const { setNodeRef, isOver } = useDroppable({
        id: `${DND_PREFIX.NOTE}${note.id}`,
        data: { type: DND_ITEM_TYPES.NOTE, noteId: note.id },
        disabled: isActive,
    });

    return (
        <button
            ref={setNodeRef}
            onClick={onSelect}
            className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-3
                ${isActive
                    ? 'bg-theme-secondary/30 text-theme-fg font-medium'
                    : 'text-theme-fg/80 hover:bg-theme-secondary/10 hover:text-theme-fg'
                }
                ${isOver && !isActive
                    ? 'ring-2 ring-theme-accent bg-theme-accent/10 scale-[1.02]'
                    : ''
                }
            `}
        >
            <span className={`w-2 h-2 rounded-full transition-colors duration-200 ${isOver && !isActive ? 'bg-theme-accent' : 'bg-theme-accent opacity-70'}`}></span>
            {note.title}
        </button>
    );
}

export function Sidebar({ notes, activeNoteId, onSelectNote, onAddNote }: SidebarProps) {
    const [isCreating, setIsCreating] = useState(false);

    const handleStartCreating = () => setIsCreating(true);
    const handleCancelCreating = () => setIsCreating(false);

    const handleAddNote = (title: string) => {
        onAddNote(title);
        setIsCreating(false);
    };

    return (
        <aside className="w-64 bg-theme-bg-soft h-full flex flex-col border-r border-theme-border flex-shrink-0">
            <div className="p-6">
                <button
                    onClick={() => onSelectNote('board')}
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
                        <DroppableNoteItem
                            key={note.id}
                            note={note}
                            isActive={activeNoteId === note.id}
                            onSelect={() => onSelectNote(note.id)}
                        />
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
                    <NoteInput onAdd={handleAddNote} onCancel={handleCancelCreating} />
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

