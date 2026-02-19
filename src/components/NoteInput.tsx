import { useState } from 'react';

interface NoteInputProps {
    onAdd: (title: string) => void;
    onCancel: () => void;
}

export function NoteInput({ onAdd, onCancel }: NoteInputProps) {
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
