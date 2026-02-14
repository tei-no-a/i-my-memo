import { Menu, Search, Filter, MoreVertical } from 'lucide-react';

interface HeaderProps {
    title: string;
}

export function Header({ title }: HeaderProps) {
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
                <button className="p-2 rounded-full hover:bg-theme-bg-soft text-theme-fg/60 hover:text-theme-fg transition-colors">
                    <MoreVertical className="w-5 h-5" />
                </button>
            </div>
        </header>
    );
}
