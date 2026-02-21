import { useState, useEffect, useRef } from 'react';
import { X, Settings2, Tags } from 'lucide-react';
import type { Category, CategoryColor } from '../types/category';
import { CategoryManager } from './CategoryManager';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    categories: Category[];
    onAddCategory: (name: string, color: CategoryColor, aliases: string[]) => void;
    onUpdateCategory: (id: number, updater: (cat: Category) => Partial<Category>) => void;
    onDeleteCategory: (id: number) => void;
}

type TabType = 'categories' | 'general';

export function SettingsModal({
    isOpen,
    onClose,
    categories,
    onAddCategory,
    onUpdateCategory,
    onDeleteCategory
}: SettingsModalProps) {
    const [activeTab, setActiveTab] = useState<TabType>('categories');
    const modalRef = useRef<HTMLDivElement>(null);

    // ESC to close
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
        }
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        if (isOpen) {
            // Use mousedown instead of click to prevent issues with text selection dragging outside
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-theme-bg/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                ref={modalRef}
                className="bg-white w-full max-w-lg h-[600px] max-h-[85vh] rounded-2xl shadow-2xl flex flex-col border border-theme-border/50 animate-in zoom-in-95 duration-200 overflow-hidden relative"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-theme-border flex-shrink-0">
                    <h2 className="text-xl font-bold text-theme-fg tracking-tight">Settings</h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-theme-fg/40 hover:text-theme-fg hover:bg-theme-bg-soft rounded-full transition-colors"
                        aria-label="Close settings"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex px-6 border-b border-theme-border gap-6 flex-shrink-0">
                    <button
                        onClick={() => setActiveTab('categories')}
                        className={`flex items-center gap-2 py-3 border-b-2 transition-colors text-sm font-medium ${activeTab === 'categories'
                                ? 'border-theme-accent text-theme-accent'
                                : 'border-transparent text-theme-fg/60 hover:text-theme-fg'
                            }`}
                    >
                        <Tags className="w-4 h-4" />
                        Categories
                    </button>
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`flex items-center gap-2 py-3 border-b-2 transition-colors text-sm font-medium ${activeTab === 'general'
                                ? 'border-theme-accent text-theme-accent'
                                : 'border-transparent text-theme-fg/60 hover:text-theme-fg'
                            }`}
                    >
                        <Settings2 className="w-4 h-4" />
                        General
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden p-6">
                    {activeTab === 'categories' && (
                        <CategoryManager
                            categories={categories}
                            onAdd={onAddCategory}
                            onUpdate={onUpdateCategory}
                            onDelete={onDeleteCategory}
                        />
                    )}
                    {activeTab === 'general' && (
                        <div className="h-full flex flex-col items-center justify-center text-center text-theme-fg/40 space-y-2">
                            <Settings2 className="w-12 h-12 opacity-20 mb-2" />
                            <p className="font-medium text-theme-fg/60">General Settings</p>
                            <p className="text-sm">These settings are currently under construction.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
