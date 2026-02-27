import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { Category, CategoryColor } from '../../types/category';
import { CategoryItem } from './CategoryItem';
import { CategoryForm } from './CategoryForm';

interface CategoryManagerProps {
    categories: Category[];
    onAdd: (name: string, color: CategoryColor, aliases: string[]) => void;
    onUpdate: (id: number, updater: (cat: Category) => Partial<Category>) => void;
    onDelete: (id: number) => void;
}

export function CategoryManager({ categories, onAdd, onUpdate, onDelete }: CategoryManagerProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [itemToDelete, setItemToDelete] = useState<Category | null>(null);

    const handleSaveAdd = (name: string, color: CategoryColor, aliases: string[]) => {
        onAdd(name, color, aliases);
        setIsAdding(false);
    };

    const handleSaveEdit = (id: number, name: string, color: CategoryColor, aliases: string[]) => {
        onUpdate(id, () => ({ name, color, aliases }));
        setEditingId(null);
    };

    const confirmDelete = () => {
        if (itemToDelete) {
            onDelete(itemToDelete.id);
            setItemToDelete(null);
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
                    <CategoryItem
                        key={cat.id}
                        category={cat}
                        isEditing={editingId === cat.id}
                        onStartEdit={() => {
                            setIsAdding(false);
                            setEditingId(cat.id);
                        }}
                        onCancelEdit={() => setEditingId(null)}
                        onSaveEdit={(name, color, aliases) => handleSaveEdit(cat.id, name, color, aliases)}
                        onDeleteRequest={() => setItemToDelete(cat)}
                    />
                ))}

                {/* Adding Form */}
                {isAdding && (
                    <CategoryForm
                        onCancel={() => setIsAdding(false)}
                        onSave={handleSaveAdd}
                    />
                )}
            </div>

            {/* Add Button */}
            {!isAdding && editingId === null && (
                <button
                    onClick={() => {
                        setIsAdding(true);
                        setEditingId(null);
                    }}
                    className="w-full py-2.5 border-2 border-dashed border-theme-border hover:border-theme-accent/50 text-theme-fg/60 hover:text-theme-accent rounded-xl flex items-center justify-center gap-2 transition-colors text-sm font-medium"
                >
                    <Plus className="w-4 h-4" />
                    Add Category
                </button>
            )}

            {/* Delete Confirmation Dialog */}
            {itemToDelete && (
                <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-theme-bg/60 backdrop-blur-sm rounded-xl">
                    <div className="bg-theme-card rounded-xl shadow-xl w-full max-w-sm p-5 border border-theme-border animate-in fade-in zoom-in-95 duration-200">
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
