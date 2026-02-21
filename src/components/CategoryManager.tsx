import { useState, useRef, useEffect } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import type { Category, CategoryColor } from '../types/category';
import { CATEGORY_COLOR_DISPLAY_MAP } from '../constants/categories';
import { ColorPicker } from './ColorPicker';

interface CategoryManagerProps {
    categories: Category[];
    onAdd: (name: string, color: CategoryColor, aliases: string[]) => void;
    onUpdate: (id: number, updater: (cat: Category) => Partial<Category>) => void;
    onDelete: (id: number) => void;
}

export function CategoryManager({ categories, onAdd, onUpdate, onDelete }: CategoryManagerProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState('');
    const [editAliases, setEditAliases] = useState('');
    const [editColor, setEditColor] = useState<CategoryColor>('rose');
    const [itemToDelete, setItemToDelete] = useState<Category | null>(null);

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isAdding || editingId !== null) {
            inputRef.current?.focus();
        }
    }, [isAdding, editingId]);

    const startAdd = () => {
        setIsAdding(true);
        setEditingId(null);
        setEditName('');
        setEditAliases('');
        setEditColor('rose');
    };

    const startEdit = (cat: Category) => {
        setIsAdding(false);
        setEditingId(cat.id);
        setEditName(cat.name);
        setEditAliases(cat.aliases.join(', '));
        setEditColor(cat.color);
    };

    const cancelEdit = () => {
        setIsAdding(false);
        setEditingId(null);
    };

    const saveEdit = () => {
        const trimmedName = editName.trim();
        if (!trimmedName) return;

        const aliasesArray = editAliases
            .split(',')
            .map(a => a.trim())
            .filter(a => a.length > 0);

        if (isAdding) {
            onAdd(trimmedName, editColor, aliasesArray);
        } else if (editingId !== null) {
            onUpdate(editingId, () => ({
                name: trimmedName,
                color: editColor,
                aliases: aliasesArray
            }));
        }
        cancelEdit();
    };

    const handleDelete = (cat: Category) => {
        setItemToDelete(cat);
    };

    const confirmDelete = () => {
        if (itemToDelete) {
            onDelete(itemToDelete.id);
            setItemToDelete(null);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            saveEdit();
        } else if (e.key === 'Escape') {
            cancelEdit();
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Category List */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-2 mb-4">
                {categories.length === 0 && (
                    <div className="text-center text-sm text-theme-fg/40 py-8">
                        カテゴリがありません。新規作成してください。
                    </div>
                )}
                {categories.map(cat => (
                    <div
                        key={cat.id}
                        className={`
                            group flex items-center justify-between p-3 rounded-xl border transition-all
                            ${editingId === cat.id ? 'border-theme-accent bg-theme-bg-soft shadow-sm' : 'border-theme-border/50 hover:border-theme-accent/30'}
                        `}
                    >
                        {editingId === cat.id ? (
                            <div className="flex-1 flex flex-col gap-3">
                                <div className="flex gap-2">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={editName}
                                        onChange={e => setEditName(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="カテゴリ名"
                                        className="flex-1 bg-white border border-theme-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-theme-accent/50"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={editAliases}
                                        onChange={e => setEditAliases(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="エイリアス（カンマ区切り）"
                                        className="flex-1 bg-white border border-theme-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-theme-accent/50"
                                    />
                                </div>
                                <div className="flex items-center justify-between mt-1">
                                    <ColorPicker value={editColor} onChange={setEditColor} />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={cancelEdit}
                                            className="px-3 py-1.5 text-xs font-medium text-theme-fg/60 hover:text-theme-fg hover:bg-theme-bg-soft rounded-lg transition-colors"
                                        >
                                            キャンセル
                                        </button>
                                        <button
                                            onClick={saveEdit}
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
                                    <div className={`w-3 h-3 rounded-full ${CATEGORY_COLOR_DISPLAY_MAP[cat.color].bg} shadow-sm`} />
                                    <div>
                                        <span className="font-semibold text-theme-fg text-sm">{cat.name}</span>
                                        {cat.aliases && cat.aliases.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {cat.aliases.map(alias => (
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
                                        onClick={() => startEdit(cat)}
                                        className="p-1.5 rounded-md text-theme-fg/40 hover:text-theme-accent hover:bg-theme-bg-soft transition-colors"
                                        title="編集"
                                        aria-label="カテゴリを編集"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(cat)}
                                        className="p-1.5 rounded-md text-theme-fg/40 hover:text-red-500 hover:bg-red-50 transition-colors"
                                        title="削除"
                                        aria-label="カテゴリを削除"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ))}

                {/* Adding Form */}
                {isAdding && (
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
                                    onClick={cancelEdit}
                                    className="px-3 py-1.5 text-xs font-medium text-theme-fg/60 hover:text-theme-fg hover:bg-theme-border rounded-lg transition-colors"
                                >
                                    キャンセル
                                </button>
                                <button
                                    onClick={saveEdit}
                                    disabled={!editName.trim()}
                                    className="px-3 py-1.5 text-xs font-medium bg-theme-accent text-white rounded-lg hover:bg-theme-accent/90 disabled:opacity-50 transition-colors shadow-sm"
                                >
                                    追加
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Add Button */}
            {!isAdding && editingId === null && (
                <button
                    onClick={startAdd}
                    className="w-full py-2.5 border-2 border-dashed border-theme-border hover:border-theme-accent/50 text-theme-fg/60 hover:text-theme-accent rounded-xl flex items-center justify-center gap-2 transition-colors text-sm font-medium"
                >
                    <Plus className="w-4 h-4" />
                    Add Category
                </button>
            )}

            {/* Delete Confirmation Dialog */}
            {itemToDelete && (
                <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-theme-bg/60 backdrop-blur-sm rounded-xl">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-5 border border-theme-border animate-in fade-in zoom-in-95 duration-200">
                        <h3 className="text-lg font-bold text-theme-fg mb-2">Delete Category</h3>
                        <p className="text-sm text-theme-fg/70 mb-5">
                            本当に "{itemToDelete.name}" カテゴリを削除しますか？ この操作は取り消せません。
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setItemToDelete(null)}
                                className="px-4 py-2 text-sm font-medium text-theme-fg hover:bg-theme-bg-soft rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 text-sm font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-sm"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
