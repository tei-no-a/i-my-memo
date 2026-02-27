import type { KeyBinding } from '../types/keybindings';

export const DEFAULT_KEYBINDINGS: KeyBinding[] = [
    { key: 'Enter', ctrlKey: true, action: 'createMemo' },
    { key: 'Enter', altKey: true, action: 'exportMemo' },
    { key: 'd', ctrlKey: true, action: 'deleteMemo' },
];
