import type { ReactNode } from 'react';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
    isDestructive?: boolean;
}

export function ConfirmDialog({
    isOpen,
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    onConfirm,
    onCancel,
    isDestructive = false
}: ConfirmDialogProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-theme-bg/60 backdrop-blur-sm">
            <div className="bg-theme-card rounded-xl shadow-xl w-full max-w-sm p-5 border border-theme-border animate-in fade-in zoom-in-95 duration-200">
                <h3 className="text-lg font-bold text-theme-fg mb-2">{title}</h3>
                <div className="text-sm text-theme-fg/70 mb-5">
                    {message}
                </div>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium text-theme-fg hover:bg-theme-bg-soft rounded-lg transition-colors"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors shadow-sm ${isDestructive
                            ? 'bg-red-500 hover:bg-red-600'
                            : 'bg-theme-accent hover:bg-theme-accent/90'
                            }`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
