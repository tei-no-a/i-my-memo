import { useEffect, useCallback } from 'react';
import type { KeyBinding, ActionName } from '../types/keybindings';

type ActionHandlers = Partial<Record<ActionName, () => void>>;

export function useKeyboardShortcuts(
    keybindings: KeyBinding[],
    actionHandlers: ActionHandlers,
    enabled: boolean = true
) {
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!enabled) return;

        // テキスト入力中はショートカットを無効化
        const target = e.target as HTMLElement;
        const isEditing = target.tagName === 'TEXTAREA' || target.tagName === 'INPUT'
            || target.isContentEditable;

        const match = keybindings.find(kb => {
            if (kb.key.toLowerCase() !== e.key.toLowerCase()) return false;
            if (kb.ctrlKey && !(e.ctrlKey || e.metaKey)) return false;  // macOS対応(metaKey)
            if (!kb.ctrlKey && (e.ctrlKey || e.metaKey)) return false;
            if (kb.shiftKey && !e.shiftKey) return false;
            if (kb.altKey && !e.altKey) return false;
            // テキスト入力中は Ctrl/Alt 等の修飾キー付きのみ許可
            if (isEditing && !kb.ctrlKey && !kb.altKey) return false;
            return true;
        });

        if (match) {
            e.preventDefault();
            actionHandlers[match.action]?.();
        }
    }, [keybindings, actionHandlers, enabled]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
}
