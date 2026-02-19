import { useRef, useState, useEffect } from 'react';
import { Menu, MoreVertical, Trash2, Pencil } from 'lucide-react';

interface HeaderProps {
    title: string;
    canDelete?: boolean;
    canRename?: boolean;
    onDeleteNote?: () => void;
    onRenameNote?: (newTitle: string) => void;
}

export function Header({ title, canDelete, canRename, onDeleteNote, onRenameNote }: HeaderProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(title);
    const menuRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // title が外部から変わったとき（別ノートへ切り替え）に同期
    useEffect(() => {
        setEditValue(title);
    }, [title]);

    // 編集モード開始時に input へフォーカス
    useEffect(() => {
        if (isEditing) {
            inputRef.current?.select();
        }
    }, [isEditing]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleDelete = () => {
        console.log('[Header] handleDelete clicked');
        if (onDeleteNote) {
            onDeleteNote();
            setIsMenuOpen(false);
        }
    };

    const startEditing = () => {
        if (!canRename) return;
        setEditValue(title);
        setIsEditing(true);
    };

    const commitEdit = () => {
        setIsEditing(false);
        if (onRenameNote && editValue.trim() && editValue.trim() !== title) {
            onRenameNote(editValue.trim());
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            commitEdit();
        } else if (e.key === 'Escape') {
            setEditValue(title);
            setIsEditing(false);
        }
    };

    return (
        <header className="h-16 flex items-center justify-between px-8 bg-theme-bg border-b border-theme-border/50 sticky top-0 z-10 w-full">
            <div className="flex items-center gap-4">
                {/* Mobile menu trigger */}
                <button className="p-2 -ml-2 rounded-md hover:bg-theme-bg-soft text-theme-fg/60 lg:hidden">
                    <Menu className="w-5 h-5" />
                </button>

                {isEditing ? (
                    <input
                        ref={inputRef}
                        type="text"
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        onBlur={commitEdit}
                        onKeyDown={handleKeyDown}
                        className="text-xl font-bold text-theme-fg bg-theme-bg-soft border border-theme-accent/50 rounded-lg px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-theme-accent/40 w-64"
                    />
                ) : (
                    <div className="flex items-center gap-2 group">
                        <h2
                            className={`text-xl font-bold text-theme-fg ${canRename ? 'cursor-pointer hover:text-theme-accent transition-colors' : ''}`}
                            onDoubleClick={startEditing}
                            title={canRename ? 'ダブルクリックで名前を変更' : undefined}
                        >
                            {title}
                        </h2>
                        {canRename && (
                            <button
                                onClick={startEditing}
                                className="p-1 rounded-md text-theme-fg/30 hover:text-theme-accent hover:bg-theme-bg-soft transition-all opacity-0 group-hover:opacity-100"
                                title="名前を変更"
                            >
                                <Pencil className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-3">
                <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className={`p-2 rounded-full transition-colors ${isMenuOpen ? 'bg-theme-bg-soft text-theme-fg' : 'text-theme-fg/60 hover:bg-theme-bg-soft hover:text-theme-fg'}`}
                    >
                        <MoreVertical className="w-5 h-5" />
                    </button>

                    {isMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-theme-border/50 py-1 z-20 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                            {canRename && (
                                <button
                                    onClick={() => { startEditing(); setIsMenuOpen(false); }}
                                    className="w-full text-left px-4 py-2.5 text-sm text-theme-fg hover:bg-theme-bg-soft flex items-center gap-2 transition-colors"
                                >
                                    <Pencil className="w-4 h-4" />
                                    Rename
                                </button>
                            )}
                            {canDelete && (
                                <button
                                    onClick={handleDelete}
                                    className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete Note
                                </button>
                            )}
                            {!canDelete && !canRename && (
                                <div className="px-4 py-2 text-xs text-theme-fg/40 text-center">
                                    No actions available
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
