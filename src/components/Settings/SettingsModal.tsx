import { useState, useEffect, useRef } from 'react';
import { X, Settings2, Tags, FolderOpen, Keyboard } from 'lucide-react';
import type { Category, CategoryColor } from '../../types/category';
import type { ExportSettings } from '../../types/settings';
import type { KeyBinding, ActionName } from '../../types';
import { CategoryManager } from '../Category/CategoryManager';
import { KeybindingSettings } from './KeybindingSettings';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    categories: Category[];
    onAddCategory: (name: string, color: CategoryColor, aliases: string[]) => void;
    onUpdateCategory: (id: number, updater: (cat: Category) => Partial<Category>) => void;
    onDeleteCategory: (id: number) => void;
    exportSettings: ExportSettings;
    onSelectExportFolder: (key: keyof ExportSettings) => Promise<void>;
    darkMode: boolean;
    onToggleDarkMode: (darkMode: boolean) => void;
    keybindings: KeyBinding[];
    onUpdateKeybinding: (action: ActionName, newBinding: Omit<KeyBinding, 'action'>) => Promise<void>;
    onResetKeybindings: () => Promise<void>;
}

type TabType = 'categories' | 'general' | 'shortcuts';

export function SettingsModal({
    isOpen,
    onClose,
    categories,
    onAddCategory,
    onUpdateCategory,
    onDeleteCategory,
    exportSettings,
    onSelectExportFolder,
    darkMode,
    onToggleDarkMode,
    keybindings,
    onUpdateKeybinding,
    onResetKeybindings
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
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose]);


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-theme-bg/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                ref={modalRef}
                className="bg-theme-card w-full max-w-lg h-[600px] max-h-[85vh] rounded-2xl shadow-2xl flex flex-col border border-theme-border/50 animate-in zoom-in-95 duration-200 overflow-hidden relative"
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
                    <button
                        onClick={() => setActiveTab('shortcuts')}
                        className={`flex items-center gap-2 py-3 border-b-2 transition-colors text-sm font-medium ${activeTab === 'shortcuts'
                            ? 'border-theme-accent text-theme-accent'
                            : 'border-transparent text-theme-fg/60 hover:text-theme-fg'
                            }`}
                    >
                        <Keyboard className="w-4 h-4" />
                        Shortcuts
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
                        <div className="h-full overflow-y-auto space-y-6">
                            <h3 className="text-base font-semibold text-theme-fg">Appearance</h3>
                            <div className="space-y-2">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            className="sr-only"
                                            checked={darkMode}
                                            onChange={(e) => onToggleDarkMode(e.target.checked)}
                                        />
                                        <div className={`block w-10 h-6 rounded-full transition-colors ${darkMode ? 'bg-theme-accent' : 'bg-theme-border'}`}></div>
                                        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${darkMode ? 'translate-x-4' : ''}`}></div>
                                    </div>
                                    <span className="text-sm font-medium text-theme-fg/80">Dark Mode</span>
                                </label>
                            </div>

                            <hr className="border-theme-border/50" />

                            <h3 className="text-base font-semibold text-theme-fg">Export Settings</h3>

                            {/* メモエクスポート先 */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-theme-fg/70">
                                    Memo Export Folder
                                </label>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 px-3 py-2 bg-theme-bg-soft rounded-lg text-sm text-theme-fg/80 truncate min-h-[38px] flex items-center border border-theme-border/50">
                                        {exportSettings.memoExportDir || (
                                            <span className="text-theme-fg/30 italic">未設定</span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => onSelectExportFolder('memoExportDir')}
                                        className="flex items-center gap-1.5 px-3 py-2 bg-theme-accent/10 text-theme-accent rounded-lg hover:bg-theme-accent/20 transition-colors text-sm font-medium flex-shrink-0"
                                    >
                                        <FolderOpen className="w-4 h-4" />
                                        選択
                                    </button>
                                </div>
                                <p className="text-xs text-theme-fg/40">
                                    メモのエクスポート先フォルダを指定します。
                                </p>
                            </div>

                            {/* ノートエクスポート先 */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-theme-fg/70">
                                    Note Export Folder
                                </label>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 px-3 py-2 bg-theme-bg-soft rounded-lg text-sm text-theme-fg/80 truncate min-h-[38px] flex items-center border border-theme-border/50">
                                        {exportSettings.noteExportDir || (
                                            <span className="text-theme-fg/30 italic">未設定</span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => onSelectExportFolder('noteExportDir')}
                                        className="flex items-center gap-1.5 px-3 py-2 bg-theme-accent/10 text-theme-accent rounded-lg hover:bg-theme-accent/20 transition-colors text-sm font-medium flex-shrink-0"
                                    >
                                        <FolderOpen className="w-4 h-4" />
                                        選択
                                    </button>
                                </div>
                                <p className="text-xs text-theme-fg/40">
                                    ノートのエクスポート先フォルダを指定します。
                                </p>
                            </div>
                        </div>
                    )}
                    {activeTab === 'shortcuts' && (
                        <KeybindingSettings
                            keybindings={keybindings}
                            onUpdateKeybinding={onUpdateKeybinding}
                            onResetKeybindings={onResetKeybindings}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
