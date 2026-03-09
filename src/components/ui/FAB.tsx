import { Plus } from 'lucide-react';

interface FABProps {
    onClick: () => void;
}

export function FAB({ onClick }: FABProps) {
    return (
        <button
            onClick={onClick}
            className="fixed bottom-8 right-8 w-14 h-14 bg-theme-accent text-white rounded-full shadow-lg hover:bg-theme-accent/90 hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center z-50 group"
            aria-label="Create new memo"
        >
            <Plus className="w-7 h-7 group-hover:rotate-90 transition-transform duration-300" />
        </button>
    );
}
