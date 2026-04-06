import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface FABSubAction {
    id: string;
    icon: LucideIcon;
    label: string;
    onClick: () => void;
}

interface FABProps {
    onClick: () => void;
    subActions?: FABSubAction[];
}

export function FAB({ onClick, subActions = [] }: FABProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div
            className="fixed bottom-8 right-8 z-50 flex flex-col items-center gap-3"
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
            role="group"
            aria-label="Memo creation options"
        >
            {/* Sub-action buttons */}
            <div className="flex flex-col items-center gap-2">
                {subActions.map((action, index) => (
                    <div
                        key={action.id}
                        className="group/subaction relative"
                    >
                        <span className={`
                            absolute right-full mr-3 top-1/2 -translate-y-1/2
                            whitespace-nowrap bg-theme-card text-theme-fg text-xs
                            px-2 py-1 rounded-lg shadow-md border border-theme-border/50
                            opacity-0 group-hover/subaction:opacity-100
                            transition-opacity duration-200 pointer-events-none
                        `}>
                            {action.label}
                        </span>
                        <button
                            onClick={action.onClick}
                            className={`
                                w-10 h-10 bg-theme-accent text-white rounded-full
                                shadow-md hover:bg-theme-accent/90 hover:scale-110
                                active:scale-95 flex items-center justify-center
                                transition-all duration-300
                                ${isExpanded
                                    ? 'opacity-100 translate-y-0 scale-100'
                                    : 'opacity-0 translate-y-4 scale-75 pointer-events-none'
                                }
                            `}
                            style={{
                                transitionDelay: isExpanded
                                    ? `${(subActions.length - 1 - index) * 50}ms`
                                    : '0ms'
                            }}
                            tabIndex={isExpanded ? 0 : -1}
                            aria-label={action.label}
                        >
                            <action.icon className="w-5 h-5" />
                        </button>
                    </div>
                ))}
            </div>

            {/* Main FAB button */}
            <button
                onClick={onClick}
                className="w-14 h-14 bg-theme-accent text-white rounded-full shadow-lg hover:bg-theme-accent/90 hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center"
                aria-label="Create new memo"
            >
                <Plus className={`w-7 h-7 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
            </button>
        </div>
    );
}
