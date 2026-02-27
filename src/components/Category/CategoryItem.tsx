import { useState, useRef, useEffect } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import type { Category, CategoryColor } from '../../types/category';
import { CATEGORY_COLOR_DISPLAY_MAP } from '../../constants/categories';
import { ColorPicker } from './ColorPicker';

interface CategoryItemProps {
    category: Category;
    isEditing: boolean;
    onStartEdit: () => void;
    onCancelEdit: () => void;
    onSaveEdit: (name: string, color: CategoryColor, aliases: string[]) => void;
    onDeleteRequest: () => void;
}

export function CategoryItem({
    category,
    isEditing,
    onStartEdit,
    onCancelEdit,
    onSaveEdit,
    onDeleteRequest
}: CategoryItemProps) {
    const [editName, setEditName] = useState(category.name);
    const [editAliases, setEditAliases] = useState(category.aliases.join(', '));
    const [editColor, setEditColor] = useState<CategoryColor>(category.color);
    const inputRef = useRef<HTMLInputElement>(null);

    const [prevIsEditing, setPrevIsEditing] = useState(isEditing);

    if (isEditing !== prevIsEditing) {
        setPrevIsEditing(isEditing);
        if (isEditing) {
            setEditName(category.name);
            setEditAliases(category.aliases.join(', '));
            setEditColor(category.color);
        }
    }

    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
        }
    }, [isEditing]);

    const handleSave = () => {
        const trimmedName = editName.trim();
        if (!trimmedName) return;

        const aliasesArray = editAliases
            .split(',')
            .map(a => a.trim())
            .filter(a => a.length > 0);

        onSaveEdit(trimmedName, editColor, aliasesArray);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            onCancelEdit();
        }
    };

    return (
        <div
            className={`
                group flex items-center justify-between p-3 rounded-xl border transition-all
                ${isEditing ? 'border-theme-accent bg-theme-bg-soft shadow-sm' : 'border-theme-border/50 hover:border-theme-accent/30'}
            `}
        >
            {isEditing ? (
                <div className="flex-1 flex flex-col gap-3">
                    <div className="flex gap-2">
                        <input
                            ref={inputRef}
                            type="text"
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="カテゴリ名"
                            className="flex-1 bg-theme-card border border-theme-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-theme-accent/50"
                        />
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={editAliases}
                            onChange={e => setEditAliases(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="エイリアス（カンマ区切り）"
                            className="flex-1 bg-theme-card border border-theme-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-theme-accent/50"
                        />
                    </div>
                    <div className="flex items-center justify-between mt-1">
                        <ColorPicker value={editColor} onChange={setEditColor} />
                        <div className="flex gap-2">
                            <button
                                onClick={onCancelEdit}
                                className="px-3 py-1.5 text-xs font-medium text-theme-fg/60 hover:text-theme-fg hover:bg-theme-bg-soft rounded-lg transition-colors"
                            >
                                キャンセル
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={!editName.trim()}
                                className="px-3 py-1.5 text-xs font-medium bg-theme-accent text-white rounded-lg hover:bg-theme-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                            >
                                保存
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${CATEGORY_COLOR_DISPLAY_MAP[category.color].bg} shadow-sm`} />
                        <div>
                            <span className="font-semibold text-theme-fg text-sm">{category.name}</span>
                            {category.aliases && category.aliases.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {category.aliases.map(alias => (
                                        <span key={alias} className="text-[10px] px-1.5 py-0.5 rounded-md bg-theme-bg-soft border border-theme-border/50 text-theme-fg/60">
                                            {alias}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={onStartEdit}
                            className="p-1.5 rounded-md text-theme-fg/40 hover:text-theme-accent hover:bg-theme-bg-soft transition-colors"
                            title="編集"
                            aria-label="カテゴリを編集"
                        >
                            <Pencil className="w-4 h-4" />
                        </button>
                        <button
                            onClick={onDeleteRequest}
                            className="p-1.5 rounded-md text-theme-fg/40 hover:text-red-500 hover:bg-theme-danger-hover transition-colors"
                            title="削除"
                            aria-label="カテゴリを削除"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
