import { useState, useRef, useEffect } from 'react';
import type { CategoryColor } from '../../types/category';
import { ColorPicker } from './ColorPicker';

interface CategoryFormProps {
    onCancel: () => void;
    onSave: (name: string, color: CategoryColor, aliases: string[]) => void;
}

export function CategoryForm({ onCancel, onSave }: CategoryFormProps) {
    const [editName, setEditName] = useState('');
    const [editAliases, setEditAliases] = useState('');
    const [editColor, setEditColor] = useState<CategoryColor>('rose');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSave = () => {
        const trimmedName = editName.trim();
        if (!trimmedName) return;

        const aliasesArray = editAliases
            .split(',')
            .map(a => a.trim())
            .filter(a => a.length > 0);

        onSave(trimmedName, editColor, aliasesArray);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            onCancel();
        }
    };

    return (
        <div className="p-3 rounded-xl border border-theme-accent bg-theme-bg-soft shadow-sm flex flex-col gap-3">
            <input
                ref={inputRef}
                type="text"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="カテゴリ名"
                className="w-full bg-white border border-theme-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-theme-accent/50"
            />
            <input
                type="text"
                value={editAliases}
                onChange={e => setEditAliases(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="エイリアス（カンマ区切り）"
                className="w-full bg-white border border-theme-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-theme-accent/50"
            />
            <div className="flex items-center justify-between mt-1">
                <ColorPicker value={editColor} onChange={setEditColor} />
                <div className="flex gap-2">
                    <button
                        onClick={onCancel}
                        className="px-3 py-1.5 text-xs font-medium text-theme-fg/60 hover:text-theme-fg hover:bg-theme-border rounded-lg transition-colors"
                    >
                        キャンセル
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!editName.trim()}
                        className="px-3 py-1.5 text-xs font-medium bg-theme-accent text-white rounded-lg hover:bg-theme-accent/90 disabled:opacity-50 transition-colors shadow-sm"
                    >
                        追加
                    </button>
                </div>
            </div>
        </div>
    );
}
