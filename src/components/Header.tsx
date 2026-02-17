import { useRef, useState, useEffect } from 'react';
import { Menu, Search, Filter, MoreVertical, Trash2 } from 'lucide-react';

interface HeaderProps {
    title: string;
    canDelete?: boolean;
    onDeleteNote?: () => void;
}

export function Header({ title, canDelete, onDeleteNote }: HeaderProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

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

    return (
        <header className="h-16 flex items-center justify-between px-8 bg-theme-bg border-b border-theme-border/50 sticky top-0 z-10 w-full">
            <div className="flex items-center gap-4">
                {/* Mobile menu trigger, hidden on large screens if desired, but good for completeness */}
                <button className="p-2 -ml-2 rounded-md hover:bg-theme-bg-soft text-theme-fg/60 lg:hidden">
                    <Menu className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-bold text-theme-fg">{title}</h2>
            </div>

            <div className="flex items-center gap-3">
                <div className="relative group">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-theme-fg/40 group-focus-within:text-theme-accent transition-colors" />
                    <input
                        type="text"
                        placeholder="Search memos..."
                        className="pl-9 pr-4 py-1.5 rounded-full bg-theme-bg-soft border border-transparent focus:border-theme-accent/50 focus:bg-white focus:outline-none text-sm w-48 transition-all"
                    />
                </div>
                <button className="p-2 rounded-full hover:bg-theme-bg-soft text-theme-fg/60 hover:text-theme-fg transition-colors">
                    <Filter className="w-5 h-5" />
                </button>

                <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className={`p-2 rounded-full transition-colors ${isMenuOpen ? 'bg-theme-bg-soft text-theme-fg' : 'text-theme-fg/60 hover:bg-theme-bg-soft hover:text-theme-fg'}`}
                    >
                        <MoreVertical className="w-5 h-5" />
                    </button>

                    {isMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-theme-border/50 py-1 z-20 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                            {canDelete && (
                                <button
                                    onClick={handleDelete}
                                    className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete Note
                                </button>
                            )}
                            {!canDelete && (
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
