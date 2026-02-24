import { useState } from 'react';
import { Book, Plus, Settings, Trash2 } from 'lucide-react';
import { SPECIAL_NOTE_IDS } from '../../constants';
import { NoteInput } from '../Note/NoteInput';
import { DroppableNoteItem } from '../Note/DroppableNoteItem';
import type { Note } from '../../types';

interface SidebarProps {
    notes: Note[];
    activeNoteId: string;
    onSelectNote: (noteId: string) => void;
    onAddNote: (title: string) => void;
    onOpenSettings: () => void;
}

export function Sidebar({ notes, activeNoteId, onSelectNote, onAddNote, onOpenSettings }: SidebarProps) {
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
                    onClick={() => onSelectNote(SPECIAL_NOTE_IDS.BOARD)}
                    className={`text-2xl font-bold tracking-tight flex items-center gap-2 hover:opacity-80 transition-opacity ${activeNoteId === SPECIAL_NOTE_IDS.BOARD ? 'text-theme-accent' : 'text-theme-fg'}`}
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
                    .filter(note => note.id !== SPECIAL_NOTE_IDS.BOARD && note.id !== SPECIAL_NOTE_IDS.TRASH)
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
                    onClick={() => onSelectNote(SPECIAL_NOTE_IDS.TRASH)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-3 ${activeNoteId === SPECIAL_NOTE_IDS.TRASH
                        ? 'bg-theme-secondary/30 text-theme-fg font-medium'
                        : 'text-theme-fg/60 hover:text-theme-fg hover:bg-theme-secondary/10'
                        }`}
                >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-sm">Trash</span>
                </button>
                <button
                    onClick={onOpenSettings}
                    className="flex items-center gap-2 text-sm text-theme-fg/60 hover:text-theme-fg transition-colors w-full px-3 py-2 rounded-lg hover:bg-theme-secondary/10"
                >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                </button>
            </div>
        </aside>
    );
}
