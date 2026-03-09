import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { Category, CategoryColor } from '../../types/category';
import { CategoryItem } from './CategoryItem';
import { CategoryForm } from './CategoryForm';
import { ConfirmDialog } from '../ui/ConfirmDialog';

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
            <ConfirmDialog
                isOpen={itemToDelete !== null}
                title="Delete Category"
                message={<>本当に "{itemToDelete?.name}" カテゴリを削除しますか？ この操作は取り消せません。</>}
                confirmLabel="Delete"
                cancelLabel="Cancel"
                isDestructive={true}
                onConfirm={confirmDelete}
                onCancel={() => setItemToDelete(null)}
            />
        </div>
    );
}
