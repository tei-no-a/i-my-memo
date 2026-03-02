import { useMemo, useState } from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { StickyNote, Plus, Settings, Trash2 } from 'lucide-react';
import { SPECIAL_NOTE_IDS, DND_PREFIX } from '../../constants';
import { NoteInput } from '../Note/NoteInput';
import { SortableNoteItem } from '../Note/SortableNoteItem';
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

    // 特殊ノートを除外したユーザーノート
    const userNotes = useMemo(() =>
        notes.filter(note => note.id !== SPECIAL_NOTE_IDS.BOARD && note.id !== SPECIAL_NOTE_IDS.TRASH),
        [notes]
    );

    // SortableContext 用の ID リスト
    const sortableNoteIds = useMemo(() =>
        userNotes.map(note => `${DND_PREFIX.SORTABLE_NOTE}${note.id}`),
        [userNotes]
    );

    return (
        <aside className="w-64 bg-theme-bg-soft h-full flex flex-col border-r border-theme-border flex-shrink-0">
            <div className="p-6">
                <button
                    onClick={() => onSelectNote(SPECIAL_NOTE_IDS.BOARD)}
                    className={`text-2xl font-bold tracking-tight flex items-center gap-2 hover:opacity-80 transition-opacity ${activeNoteId === SPECIAL_NOTE_IDS.BOARD ? 'text-theme-accent' : 'text-theme-fg'}`}
                    title="Go to Board"
                >
                    <StickyNote className="w-6 h-6" />
                    <span>I My Memo</span>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 space-y-0.5">
                <div className="text-xs font-semibold text-theme-fg/60 uppercase tracking-wider mb-2 px-2">
                    Notes
                </div>
                <SortableContext
                    items={sortableNoteIds}
                    strategy={verticalListSortingStrategy}
                >
                    {userNotes.map((note) => (
                        <SortableNoteItem
                            key={note.id}
                            note={note}
                            isActive={activeNoteId === note.id}
                            onSelect={() => onSelectNote(note.id)}
                        />
                    ))}
                </SortableContext>

                <button
                    onClick={handleStartCreating}
                    className="w-full text-left px-2 py-1.5 rounded-lg text-theme-fg/60 hover:text-theme-accent hover:bg-theme-secondary/10 transition-colors flex items-center gap-2 mt-2"
                    title="Create new note"
                >
                    <Plus className="w-4 h-4" />
                    <span className="text-xs">New Note</span>
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

